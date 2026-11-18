const iconUrl = (code) => `https://openweathermap.org/img/wn/${code}@2x.png`;

// Shift a UTC timestamp by the city's offset so UTC getters return local wall-clock values.
const toLocal = (timestamp, offset) => new Date((timestamp + offset) * 1000);
const dayKey = (date) => date.toISOString().slice(0, 10);

function summariseDays(list, offset, now) {
    const days = new Map();
    for (const entry of list) {
        const date = toLocal(entry.dt, offset);
        const key = dayKey(date);
        const day = days.get(key) ?? { key, date, min: Infinity, max: -Infinity, pop: 0, icon: null, iconDistance: Infinity };
        day.min = Math.min(day.min, entry.main.temp_min);
        day.max = Math.max(day.max, entry.main.temp_max);
        day.pop = Math.max(day.pop, entry.pop ?? 0);
        // Prefer the reading closest to midday for the day's icon.
        const distance = Math.abs(date.getUTCHours() - 13);
        if (distance < day.iconDistance) {
            day.iconDistance = distance;
            day.icon = entry.weather[0].icon.replace('n', 'd');
            day.description = entry.weather[0].description;
        }
        days.set(key, day);
    }
    const todayKey = dayKey(toLocal(now, offset));
    return [...days.values()].slice(0, 5).map((day) => ({
        ...day,
        label: day.key === todayKey
            ? 'Today'
            : day.date.toLocaleDateString('en', { weekday: 'short', timeZone: 'UTC' })
    }));
}

function ForecastIcon({ code, description }) {
    return (
        <span className="forecast-icon">
            <img src={iconUrl(code)} alt={description} width="56" height="56" />
        </span>
    );
}

export function HourlyForecast({ forecast }) {
    const offset = forecast.city?.timezone ?? 0;
    const hours = forecast.list.slice(0, 8);

    return (
        <section className="panel hourly-card" aria-labelledby="hourly-heading">
            <div className="panel-heading">
                <h2 id="hourly-heading">Next 24 hours</h2>
                <span className="panel-note">Every 3 hours</span>
            </div>
            <ol className="hourly-list">
                {hours.map((entry) => (
                    <li key={entry.dt} className="hourly-item">
                        <span className="hourly-time">{toLocal(entry.dt, offset).toISOString().slice(11, 16)}</span>
                        <ForecastIcon code={entry.weather[0].icon} description={entry.weather[0].description} />
                        <strong className="hourly-temp">{Math.round(entry.main.temp)}°</strong>
                        <span className="hourly-pop" aria-label={`${Math.round((entry.pop ?? 0) * 100)}% chance of rain`}>
                            {entry.pop >= 0.1 ? `${Math.round(entry.pop * 100)}%` : ' '}
                        </span>
                    </li>
                ))}
            </ol>
        </section>
    );
}

export function DailyForecast({ forecast, now }) {
    const offset = forecast.city?.timezone ?? 0;
    const days = summariseDays(forecast.list, offset, now);
    const weekMin = Math.min(...days.map((day) => day.min));
    const weekMax = Math.max(...days.map((day) => day.max));
    const span = Math.max(weekMax - weekMin, 1);

    return (
        <section className="panel daily-card" aria-labelledby="daily-heading">
            <div className="panel-heading">
                <h2 id="daily-heading">5-day forecast</h2>
            </div>
            <ul className="daily-list">
                {days.map((day) => (
                    <li key={day.key} className="daily-item">
                        <span className="daily-day">{day.label}</span>
                        <ForecastIcon code={day.icon} description={day.description} />
                        <span className="daily-pop">{day.pop >= 0.1 ? `${Math.round(day.pop * 100)}%` : ''}</span>
                        <span className="daily-min">{Math.round(day.min)}°</span>
                        <span className="daily-bar" aria-hidden="true">
                            <span
                                style={{
                                    left: `${((day.min - weekMin) / span) * 100}%`,
                                    right: `${((weekMax - day.max) / span) * 100}%`
                                }}
                            />
                        </span>
                        <span className="daily-max">{Math.round(day.max)}°</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
