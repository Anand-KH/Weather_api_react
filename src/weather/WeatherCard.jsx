import React from 'react';

function formatLocalTime(timestamp, timezoneOffset) {
    if (!timestamp) return '--:--';
    const localDate = new Date((timestamp + timezoneOffset) * 1000);
    return localDate.toISOString().slice(11, 16);
}

function WeatherCard({ weather }) {
    const {
        name,
        coord,
        weather: conditions,
        main,
        wind,
        sys,
        clouds,
        visibility,
        rain,
        timezone = 0,
        dt
    } = weather;
    const condition = conditions[0];
    const localDate = new Date((dt + timezone) * 1000);
    const dateLabel = localDate.toLocaleDateString('en', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    });
    const metrics = [
        { label: 'Feels like', value: `${Math.round(main.feels_like ?? main.temp)}°`, icon: '◉' },
        { label: 'Humidity', value: `${main.humidity}%`, icon: '♧' },
        { label: 'Wind', value: `${wind.speed} m/s`, icon: '≋' },
        { label: 'Pressure', value: `${main.pressure} hPa`, icon: '◌' },
        { label: 'Visibility', value: visibility == null ? '—' : `${(visibility / 1000).toFixed(1)} km`, icon: '◎' },
        { label: 'Cloud cover', value: clouds?.all == null ? '—' : `${clouds.all}%`, icon: '☁' },
        { label: 'Rain (1h)', value: rain?.['1h'] == null ? '0 mm' : `${rain['1h']} mm`, icon: '⌁' },
        { label: 'High / low', value: `${Math.round(main.temp_max)}° / ${Math.round(main.temp_min)}°`, icon: '↕' }
    ];

    return (
        <section className="weather-dashboard" aria-label={`Weather in ${name}`}>
            <article className="current-weather">
                <div className="current-heading">
                    <div>
                        <p className="eyebrow">CURRENT WEATHER</p>
                        <h2>{name}<span className="country-code">, {sys.country}</span></h2>
                        <p className="current-date">{dateLabel}</p>
                    </div>
                    <div className="coordinates">
                        <span>{coord.lat.toFixed(2)}° {coord.lat >= 0 ? 'N' : 'S'}</span>
                        <span>{Math.abs(coord.lon).toFixed(2)}° {coord.lon >= 0 ? 'E' : 'W'}</span>
                    </div>
                </div>

                <div className="temperature-row">
                    <div className="temperature">{Math.round(main.temp)}<span>°</span></div>
                    <div className="condition">
                        <img
                            src={`https://openweathermap.org/img/wn/${condition.icon}@2x.png`}
                            alt=""
                            className="condition-icon"
                        />
                        <span>{condition.description}</span>
                    </div>
                </div>

                <div className="sun-times">
                    <div>
                        <span className="sun-symbol sunrise-symbol" aria-hidden="true">↑</span>
                        <span className="sun-label">Sunrise</span>
                        <strong>{formatLocalTime(sys.sunrise, timezone)}</strong>
                    </div>
                    <div>
                        <span className="sun-symbol sunset-symbol" aria-hidden="true">↓</span>
                        <span className="sun-label">Sunset</span>
                        <strong>{formatLocalTime(sys.sunset, timezone)}</strong>
                    </div>
                </div>
            </article>

            <section className="details-section" aria-labelledby="details-heading">
                <div className="details-heading">
                    <h2 id="details-heading">Today’s conditions</h2>
                    <span>Live details</span>
                </div>
                <div className="metrics-grid">
                    {metrics.map((metric) => (
                        <article className="metric-card" key={metric.label}>
                            <span className="metric-icon" aria-hidden="true">{metric.icon}</span>
                            <span className="metric-label">{metric.label}</span>
                            <strong className="metric-value">{metric.value}</strong>
                        </article>
                    ))}
                </div>
            </section>
        </section>
    );
}

export default WeatherCard;
