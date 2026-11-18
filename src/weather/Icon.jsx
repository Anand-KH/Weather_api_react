const PATHS = {
    search: ['M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', 'M21 21l-4.35-4.35'],
    cloud: ['M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z'],
    thermometer: ['M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z'],
    droplet: ['M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z'],
    wind: ['M9.59 4.59A2 2 0 1 1 11 8H2', 'M12.59 19.41A2 2 0 1 0 14 16H2', 'M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2'],
    gauge: ['M3.34 19a10 10 0 1 1 17.32 0', 'M12 14l4-4'],
    eye: ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
    rain: ['M16 13v8', 'M8 13v8', 'M12 15v8', 'M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25'],
    range: ['M12 3v18', 'M8 7l4-4 4 4', 'M8 17l4 4 4-4'],
    locate: ['M3 11l19-9-9 19-2-8-8-2z'],
    pin: ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z', 'M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z']
};

function Icon({ name, size = 20, className }) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {PATHS[name].map((d) => <path key={d} d={d} />)}
        </svg>
    );
}

export default Icon;
