import { useCallback, useEffect, useRef, useState } from 'react';
import WeatherCard from './WeatherCard';
import Forecast from './Forecast';
import CitySearch from './CitySearch';
import { getCurrentWeather, getForecast } from './api';
import { getSky } from './sky';

const DEFAULT_CITY = 'Bangalore';

const GEO_ERRORS = {
    1: 'Location access was denied. Allow it in your browser settings, or search for a city.',
    2: 'Your location could not be determined. Try searching for a city.',
    3: 'Finding your location took too long. Try again or search for a city.'
};

function Wheather() {
    const [query, setQuery] = useState(DEFAULT_CITY);
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const controllerRef = useRef(null);

    const load = useCallback(async (location) => {
        if (location.q !== undefined && !location.q) {
            setError('Enter a city to search for.');
            return null;
        }

        // Cancel any request still in flight so a slow response can't overwrite a newer one.
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        setLoading(true);
        setError('');

        const [current, upcoming] = await Promise.allSettled([
            getCurrentWeather(location, controller.signal),
            getForecast(location, controller.signal)
        ]);
        if (controller.signal.aborted) return null;

        if (current.status === 'fulfilled') {
            setWeather(current.value);
            // The forecast is a bonus: if only it fails, still show current conditions.
            setForecast(upcoming.status === 'fulfilled' ? upcoming.value : null);
        } else {
            setError(current.reason?.message || 'Unable to load weather data.');
        }
        setLoading(false);
        return current.status === 'fulfilled' ? current.value : null;
    }, []);

    useEffect(() => {
        load({ q: DEFAULT_CITY });
        return () => controllerRef.current?.abort();
    }, [load]);

    const handleLocate = () => {
        if (!navigator.geolocation) {
            setError('Your browser does not support location access. Search for a city instead.');
            return;
        }
        setLocating(true);
        setError('');
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                setLocating(false);
                const data = await load({ lat: coords.latitude, lon: coords.longitude });
                if (data) setQuery(`${data.name}, ${data.sys.country}`);
            },
            (geoError) => {
                setLocating(false);
                setError(GEO_ERRORS[geoError.code] || 'Unable to get your location.');
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 }
        );
    };

    return (
        <main className="weather-app" data-sky={getSky(weather)}>
            <div className="weather-shell">
                <header className="app-header">
                    <a className="brand" href="/" aria-label="Skycast home">
                        <img className="brand-mark" src="/logo.svg" alt="" width="36" height="36" />
                        <span>skycast</span>
                    </a>
                    <span className="header-caption">Weather, at a glance</span>
                </header>

                <section className="weather-content" aria-label="Local weather">
                    <div className="intro">
                        <p className="eyebrow">WEATHER DASHBOARD</p>
                        <h1>Find your forecast.</h1>
                        <p className="intro-copy">A clear picture of what’s happening outside.</p>
                    </div>

                    <CitySearch
                        value={query}
                        onChange={setQuery}
                        onSearch={load}
                        onLocate={handleLocate}
                        loading={loading}
                        locating={locating}
                    />

                    {error && <p className="weather-error" role="alert">{error}</p>}
                    {(loading || locating) && !weather && (
                        <div className="loading-card" role="status">
                            <span className="visually-hidden">Loading weather…</span>
                        </div>
                    )}
                    {weather && <WeatherCard weather={weather} />}
                    {weather && forecast && <Forecast forecast={forecast} now={weather.dt} />}
                </section>

                <footer className="app-footer">Weather data by OpenWeather</footer>
            </div>
        </main>
    );
}

export default Wheather;
