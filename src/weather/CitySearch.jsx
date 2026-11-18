import { useEffect, useId, useRef, useState } from 'react';
import Icon from './Icon';
import { searchPlaces } from './api';

const MIN_CHARS = 2;
const DEBOUNCE_MS = 300;

function CitySearch({ value, onChange, onSearch, onLocate, loading, locating, near }) {
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const skipNextLookup = useRef(false);
    const inputRef = useRef(null);
    // Bias suggestions toward the place currently shown, without re-running the lookup when it changes.
    const nearRef = useRef(near);
    useEffect(() => {
        nearRef.current = near;
    }, [near]);
    const listId = useId();

    // Debounced suggestion lookup as the user types.
    useEffect(() => {
        if (skipNextLookup.current) {
            skipNextLookup.current = false;
            return undefined;
        }
        const text = value.trim();
        // Only suggest while the user is typing, not when the app fills the box itself.
        if (text.length < MIN_CHARS || document.activeElement !== inputRef.current) {
            setSuggestions([]);
            return undefined;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const results = await searchPlaces(text, nearRef.current, controller.signal);
                setSuggestions(results);
                setActive(-1);
                setOpen(true);
            } catch {
                // Suggestions are a convenience; a failed lookup just shows none.
                if (!controller.signal.aborted) setSuggestions([]);
            }
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [value]);

    const choose = (city) => {
        skipNextLookup.current = true;
        onChange(city.label);
        setOpen(false);
        setSuggestions([]);
        onSearch({ lat: city.lat, lon: city.lon, name: city.name });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (open && active >= 0 && suggestions[active]) {
            choose(suggestions[active]);
            return;
        }
        setOpen(false);
        onSearch({ q: value.trim() });
    };

    const handleKeyDown = (event) => {
        if (!open || suggestions.length === 0) return;
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActive((index) => (index + 1) % suggestions.length);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActive((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
        } else if (event.key === 'Escape') {
            setOpen(false);
        }
    };

    const showList = open && suggestions.length > 0;

    return (
        <form className="search-form" onSubmit={handleSubmit} role="search">
            <label className="visually-hidden" htmlFor="city-search">Search by city</label>
            <span className="search-icon"><Icon name="search" /></span>
            <input
                id="city-search"
                ref={inputRef}
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length && setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 120)}
                placeholder="Search a city"
                autoComplete="off"
                role="combobox"
                aria-expanded={showList}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
            />
            <button
                type="button"
                className="locate-button"
                onClick={onLocate}
                disabled={locating}
                aria-label="Use my location"
                title="Use my location"
            >
                <Icon name="locate" size={18} />
            </button>
            <button type="submit" className="search-button" disabled={loading}>
                {loading ? 'Loading…' : 'Search'}
            </button>

            {showList && (
                <ul className="suggestions" id={listId} role="listbox">
                    {suggestions.map((city, index) => (
                        <li
                            key={city.label}
                            id={`${listId}-${index}`}
                            role="option"
                            aria-selected={index === active}
                            className={index === active ? 'is-active' : undefined}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => choose(city)}
                            onMouseEnter={() => setActive(index)}
                        >
                            <Icon name="pin" size={16} />
                            <span className="suggestion-name">{city.name}</span>
                            <span className="suggestion-meta">{city.meta}</span>
                        </li>
                    ))}
                </ul>
            )}
        </form>
    );
}

export default CitySearch;
