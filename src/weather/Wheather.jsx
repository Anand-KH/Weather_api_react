import { useCallback, useEffect, useState } from 'react';
import WeatherCard from './WeatherCard';
import Icon from './Icon';
import { getSky } from './sky';

function Wheather() {
    const [city, setCity] = useState('Bangalore');
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchWeather = useCallback(async (cityName) => {
        const apiKey = import.meta.env.REACT_APP_WEATHER_API;
        if (!apiKey) {
            setError('OpenWeather API key is missing. Add REACT_APP_WEATHER_API to your .env file and restart the app.');
            return;
        }

        const searchCity = cityName.trim();
        if (!searchCity) {
            setError('Enter a city to search for.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const params = new URLSearchParams({
                q: searchCity,
                units: 'metric',
                appid: apiKey
            });
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Weather request failed (${response.status}).`);
            }

            if (!data.main || !data.weather?.[0] || !data.sys || !data.wind) {
                throw new Error('The weather service returned incomplete weather data.');
            }

            setWeather(data);
        } catch (requestError) {
            setError(requestError.message || 'Unable to load weather data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWeather('Bangalore');
    }, [fetchWeather]);

    const handleSubmit = (event) => {
        event.preventDefault();
        fetchWeather(city);
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

                    <form className="search-form" onSubmit={handleSubmit}>
                        <label className="visually-hidden" htmlFor="city-search">Search by city</label>
                        <span className="search-icon"><Icon name="search" /></span>
                        <input
                            id="city-search"
                            type="search"
                            value={city}
                            onChange={(event) => setCity(event.target.value)}
                            placeholder="Search a city"
                            autoComplete="off"
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Loading…' : 'Search'}
                        </button>
                    </form>

                    {error && <p className="weather-error" role="alert">{error}</p>}
                    {loading && !weather && (
                        <div className="loading-card" role="status">
                            <span className="visually-hidden">Loading weather…</span>
                        </div>
                    )}
                    {weather && <WeatherCard weather={weather} />}
                </section>

                <footer className="app-footer">Weather data by OpenWeather</footer>
            </div>
        </main>
    );
}

export default Wheather;
