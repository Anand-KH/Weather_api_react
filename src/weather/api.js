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
