# Skycast Weather Dashboard

A responsive weather dashboard built with React and the OpenWeather Current
Weather API. Search for a city to view current conditions and details including
temperature, feels-like temperature, humidity, wind, pressure, visibility,
cloud cover, rain, sunrise, and sunset.

## Requirements

- Node.js and npm
- An API key from [OpenWeather](https://openweathermap.org/api)

## Setup

1. Install project dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root, next to `package.json`.
   Add your OpenWeather API key:

   ```env
   REACT_APP_WEATHER_API=your_openweather_api_key
   ```

   Replace the placeholder with your actual key. Do not add quotes around the
   value. The `.env.example` file is a template; Create React App does not load
   values from that file.

3. Start or restart the development server:

   ```bash
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Usage

The dashboard initially loads weather for Bangalore. Enter another city in the
search field and press **Search** or Enter. The layout adapts to narrow and
wide screens.

## Available scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the development server. |
| `npm test` | Run the tests in watch mode. |
| `npm run build` | Create an optimized production build in `build/`. |

## Troubleshooting

- **Missing API key:** Confirm the file is named `.env` (not `.env.example` or
  `.env.txt`), is in the project root, and contains the
  `REACT_APP_WEATHER_API=...` variable. Restart the development server after
  changing it.
- **Invalid API key (401):** Verify the key in your OpenWeather account. Newly
  created keys may take a short time to become active.
- **City not found:** Check the spelling and try searching for the city name
  again.

## API key security

Create React App embeds `REACT_APP_*` variables in the browser bundle. This
approach is suitable for local development, but it does **not** keep the API
key secret in a public deployment. For production, make weather requests
through a backend that stores the key securely.
