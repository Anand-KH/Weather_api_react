import { useEffect, useId, useRef, useState } from 'react';
import Icon from './Icon';
import { searchPlaces } from './api';

const MIN_CHARS = 2;
const DEBOUNCE_MS = 300;

function CitySearch({ value, onChange, onSearch, onLocate, loading, locating, near }) {
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    // True only while the user is typing; finishing a search (or the app filling the box) clears it.
    const typingRef = useRef(false);
    const lookupRef = useRef({ timer: null, controller: null });
    const inputRef = useRef(null);
    // Bias suggestions toward the place currently shown, without re-running the lookup when it changes.
    const nearRef = useRef(near);
    useEffect(() => {
        nearRef.current = near;
    }, [near]);
    const listId = useId();

    const cancelLookup = () => {
        clearTimeout(lookupRef.current.timer);
        lookupRef.current.controller?.abort();
    };

    // Debounced suggestion lookup as the user types.
    useEffect(() => {
        const text = value.trim();
        if (!typingRef.current || text.length < MIN_CHARS) {
            setSuggestions([]);
            setOpen(false);
            return undefined;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const results = await searchPlaces(text, nearRef.current, controller.signal);
                // Ignore results that arrive after the search was completed.
                if (controller.signal.aborted || !typingRef.current) return;
                setSuggestions(results);
                setActive(-1);
                setOpen(results.length > 0);
            } catch {
                // Suggestions are a convenience; a failed lookup just shows none.
                if (!controller.signal.aborted) setSuggestions([]);
            }
        }, DEBOUNCE_MS);
        lookupRef.current = { timer, controller };

        return cancelLookup;
    }, [value]);

    const finishSearch = () => {
        typingRef.current = false;
        cancelLookup();
        setOpen(false);
        setSuggestions([]);
        setActive(-1);
        inputRef.current?.blur();
    };

    const choose = (city) => {
        finishSearch();
        onChange(city.label);
        onSearch({ lat: city.lat, lon: city.lon, name: city.name });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (open && active >= 0 && suggestions[active]) {
            choose(suggestions[active]);
            return;
        }
        finishSearch();
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
                onChange={(event) => {
                    typingRef.current = true;
                    onChange(event.target.value);
                }}
                onKeyDown={handleKeyDown}
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
                onClick={() => {
                    finishSearch();
                    onLocate();
                }}
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
