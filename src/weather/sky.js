// Maps an OpenWeather response to a visual "sky" theme used by the CSS (data-sky attribute).
const GROUPS = {
    Clear: 'clear',
    Clouds: 'clouds',
    Rain: 'rain',
    Drizzle: 'rain',
    Thunderstorm: 'storm',
    Snow: 'snow'
};

export function getSky(weather) {
    if (!weather) return 'clear-day';
    const condition = weather.weather[0];
    const group = GROUPS[condition.main] || 'mist';
    const isNight = condition.icon?.endsWith('n');
    return `${group}-${isNight ? 'night' : 'day'}`;
}
