import Icon from './Icon';

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

function formatLocalTime(timestamp, timezoneOffset) {
    if (!timestamp) return '--:--';
    const localDate = new Date((timestamp + timezoneOffset) * 1000);
    return localDate.toISOString().slice(11, 16);
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

function SunArc({ sunrise, sunset, now, timezone }) {
    if (!sunrise || !sunset) return null;

    // Ellipse from (20,100) to (280,100), rx 130, ry 80, centred at (150,100).
    const progress = (now - sunrise) / (sunset - sunrise);
    const isUp = progress >= 0 && progress <= 1;
    const angle = Math.PI * (1 - Math.min(Math.max(progress, 0), 1));
    const x = 150 + 130 * Math.cos(angle);
    const y = 100 - 80 * Math.sin(angle);
    const status = isUp
        ? `${formatDuration(sunset - now)} of daylight left`
        : progress < 0 ? 'Before sunrise' : 'Sun has set';

    return (
        <div className="sun-arc">
            <svg viewBox="0 0 300 112" role="img" aria-label={`Sunrise ${formatLocalTime(sunrise, timezone)}, sunset ${formatLocalTime(sunset, timezone)}. ${status}.`}>
                <path className="sun-arc-track" d="M20 100 A130 80 0 0 1 280 100" />
                {isUp && progress > 0 && (
                    <path className="sun-arc-progress" d={`M20 100 A130 80 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`} />
                )}
                <line className="sun-arc-horizon" x1="4" y1="100" x2="296" y2="100" />
                {isUp && (
                    <>
                        <circle className="sun-arc-glow" cx={x} cy={y} r="14" />
                        <circle className="sun-arc-sun" cx={x} cy={y} r="7" />
                    </>
                )}
            </svg>
            <div className="sun-arc-labels">
                <div>
                    <span>Sunrise</span>
                    <strong>{formatLocalTime(sunrise, timezone)}</strong>
                </div>
                <p className="sun-arc-status">{status}</p>
                <div>
                    <span>Sunset</span>
                    <strong>{formatLocalTime(sunset, timezone)}</strong>
                </div>
            </div>
        </div>
    );
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
    const timeLabel = formatLocalTime(dt, timezone);
    const windDirection = wind.deg == null ? '' : ` ${COMPASS[Math.round(wind.deg / 45) % 8]}`;
    const metrics = [
        { label: 'Feels like', value: `${Math.round(main.feels_like ?? main.temp)}°`, icon: 'thermometer' },
        { label: 'Humidity', value: `${main.humidity}%`, icon: 'droplet' },
        { label: 'Wind', value: `${wind.speed} m/s${windDirection}`, icon: 'wind' },
        { label: 'Pressure', value: `${main.pressure} hPa`, icon: 'gauge' },
        { label: 'Visibility', value: visibility == null ? '—' : `${(visibility / 1000).toFixed(1)} km`, icon: 'eye' },
        { label: 'Cloud cover', value: clouds?.all == null ? '—' : `${clouds.all}%`, icon: 'cloud' },
        { label: 'Rain (1h)', value: rain?.['1h'] == null ? '0 mm' : `${rain['1h']} mm`, icon: 'rain' },
        { label: 'High / low', value: `${Math.round(main.temp_max)}° / ${Math.round(main.temp_min)}°`, icon: 'range' }
    ];

    return (
        <section className="weather-dashboard" aria-label={`Weather in ${name}`}>
            <article className="current-weather">
                <div className="current-heading">
                    <div>
                        <h2>{name}<span className="country-code">{sys.country}</span></h2>
                        <p className="current-date">{dateLabel} · {timeLabel} local</p>
                    </div>
                    <div className="coordinates">
                        <Icon name="pin" size={14} />
                        <span>
                            {Math.abs(coord.lat).toFixed(2)}°{coord.lat >= 0 ? 'N' : 'S'}{' '}
                            {Math.abs(coord.lon).toFixed(2)}°{coord.lon >= 0 ? 'E' : 'W'}
                        </span>
                    </div>
                </div>

                <div className="temperature-row">
                    <div className="temperature">{Math.round(main.temp)}<span>°C</span></div>
                    <div className="condition">
                        <img
                            src={`https://openweathermap.org/img/wn/${condition.icon}@4x.png`}
                            alt=""
                            className="condition-icon"
                        />
                        <span className="condition-text">{condition.description}</span>
                        <span className="condition-range">
                            H {Math.round(main.temp_max)}° · L {Math.round(main.temp_min)}°
                        </span>
                    </div>
                </div>

                <SunArc sunrise={sys.sunrise} sunset={sys.sunset} now={dt} timezone={timezone} />
            </article>

            <section className="details-section" aria-labelledby="details-heading">
                <div className="details-heading">
                    <h2 id="details-heading">Today’s conditions</h2>
                    <span className="live-badge"><span className="live-dot" aria-hidden="true" />Live</span>
                </div>
                <div className="metrics-grid">
                    {metrics.map((metric) => (
                        <article className="metric-card" key={metric.label}>
                            <span className="metric-icon"><Icon name={metric.icon} /></span>
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
