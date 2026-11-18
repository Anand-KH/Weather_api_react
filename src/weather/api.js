const BASE = 'https://api.openweathermap.org';

export class MissingKeyError extends Error {}

function getKey() {
    const key = import.meta.env.REACT_APP_WEATHER_API;
    if (!key) {
        throw new MissingKeyError('OpenWeather API key is missing. Add REACT_APP_WEATHER_API to your .env file and restart the app.');
    }
    return key;
}

async function request(path, params, signal) {
    const query = new URLSearchParams({ ...params, appid: getKey() });
    const response = await fetch(`${BASE}${path}?${query}`, { signal });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = data.message ? data.message[0].toUpperCase() + data.message.slice(1) : '';
        throw new Error(message || `Weather request failed (${response.status}).`);
    }
    return data;
}

// A location is either { q: 'Paris' } or { lat, lon }.
function locationParams(location) {
    return location.q ? { q: location.q } : { lat: location.lat, lon: location.lon };
}

export async function getCurrentWeather(location, signal) {
    const data = await request('/data/2.5/weather', { ...locationParams(location), units: 'metric' }, signal);
    if (!data.main || !data.weather?.[0] || !data.sys || !data.wind) {
        throw new Error('The weather service returned incomplete weather data.');
    }
    return data;
}

export function getForecast(location, signal) {
    return request('/data/2.5/forecast', { ...locationParams(location), units: 'metric' }, signal);
}

export async function searchCities(text, signal) {
    const results = await request('/geo/1.0/direct', { q: text, limit: 5 }, signal);
    const seen = new Set();
    return results
        .map((city) => ({
            name: city.name,
            state: city.state,
            country: city.country,
            lat: city.lat,
            lon: city.lon,
            label: [city.name, city.state, city.country].filter(Boolean).join(', ')
        }))
        .filter((city) => !seen.has(city.label) && seen.add(city.label));
}

// OpenWeather labels coordinates with its nearest station (e.g. "Kanija Bhavan" for most of
// central/west Bangalore), so look up a human place name from OpenStreetMap instead.
export async function reverseGeocode({ lat, lon }, signal) {
    const query = new URLSearchParams({ lat, lon, format: 'jsonv2', zoom: 16, 'accept-language': 'en' });
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query}`, { signal });
    if (!response.ok) return null;
    const { address = {} } = await response.json();
    const area = [address.neighbourhood, address.quarter, address.suburb]
        .find((part) => part && !/\bward\b/i.test(part));
    const city = address.city || address.town || address.village;
    return [area, city].filter(Boolean).join(', ') || null;
}

// ---------- Place search (autocomplete) ----------
// Photon (OpenStreetMap) covers neighbourhoods and localities, e.g. "Koramangala" or
// "Vijaya Nagar" in Bengaluru, which OpenWeather's city-only geocoder doesn't.

const NEARBY_KM = 50;

function distanceKm(a, b) {
    const rad = (deg) => (deg * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat);
    const dLon = rad(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(h));
}

async function photon(text, near, signal) {
    const params = new URLSearchParams({ q: text, limit: 15, lang: 'en', osm_tag: 'place' });
    if (near) {
        params.set('lat', near.lat);
        params.set('lon', near.lon);
        params.set('zoom', 12);
        params.set('location_bias_scale', 0.1);
    }
    const response = await fetch(`https://photon.komoot.io/api/?${params}`, { signal });
    if (!response.ok) throw new Error(`Place search failed (${response.status}).`);
    const { features = [] } = await response.json();

    return features.map(({ properties: p, geometry }) => {
        const [lon, lat] = geometry.coordinates;
        const area = [p.city, p.district, p.county].find((part) => part && part !== p.name && !/\bward\b/i.test(part));
        const meta = [area, p.state, p.country].filter((part, i, all) => part && all.indexOf(part) === i).join(', ');
        return {
            name: p.name,
            meta,
            label: [p.name, meta].filter(Boolean).join(', '),
            lat,
            lon,
            distance: near ? distanceKm(near, { lat, lon }) : Infinity
        };
    });
}

export async function searchPlaces(text, near, signal) {
    let results;
    try {
        results = await photon(text, near, signal);
        // Indian locality names are written both ways ("Vijayanagar" / "Vijaya Nagar");
        // if nothing nearby matched, retry with the space.
        const split = text.replace(/(\S)(nagara?)$/i, '$1 $2');
        if (near && split !== text && !results.some((place) => place.distance < NEARBY_KM)) {
            results = [...(await photon(split, near, signal)), ...results];
        }
    } catch (error) {
        if (signal?.aborted) throw error;
        // Fall back to OpenWeather's city geocoder if Photon is unavailable.
        return (await searchCities(text, signal)).map((city) => ({
            ...city,
            meta: [city.state, city.country].filter(Boolean).join(', ')
        }));
    }

    const seen = new Set();
    return results
        .filter((place) => place.name && !seen.has(place.label) && seen.add(place.label))
        .sort((a, b) => (a.distance < NEARBY_KM) === (b.distance < NEARBY_KM) ? 0 : a.distance < NEARBY_KM ? -1 : 1)
        .slice(0, 6);
}
