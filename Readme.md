# Weatherwise App

Weatherwise is a modern, responsive weather application built with React, Vite, and Tailwind CSS. It provides real-time weather data, a 5-day/24-hour forecast, air quality information, UV index, and a suite of advanced features to enhance the user's weather tracking experience.

## Live Demo

Experience Weatherwise live: [https://karthikpeketi.github.io/weatherApp](https://karthikpeketi.github.io/weatherApp)

## Features

-   **Real-time Weather Data**: Get current temperature, humidity, wind speed, pressure, cloudiness, and visibility for any location.
-   **Location Search**: Easily search for weather in any city worldwide.
-   **Geolocation Support**: Automatically detects your current location to display local weather.
-   **5-Day / 24-Hour Forecast**: View detailed weather predictions for the upcoming days or hours.
-   **Air Quality Index (AQI)**: Stay informed about the air quality with detailed AQI readings.
-   **UV Index**: Get information on the UV radiation level.
-   **Sunrise/Sunset Times**: Know the exact sunrise and sunset times for your chosen location.
-   **Temperature Unit Toggle**: Switch between Celsius and Fahrenheit with ease.
-   **Dynamic Backgrounds**: Visual backgrounds that change based on current weather conditions.
-   **Favorite Locations**: Save and quickly access your most frequently checked locations.
-   **Weather Maps**: Visualize weather patterns on an interactive map.
-   **Weather Comparison**: Compare weather conditions between multiple locations.
-   **Voice Search**: Search for locations using voice commands.
-   **Weather History**: Keep track of your past weather searches.
-   **Responsive Design**: Optimized for seamless experience across all devices (desktop, tablet, mobile).

## Technologies Used

-   **React**: A JavaScript library for building user interfaces.
-   **Vite**: A fast build tool that provides an extremely fast development experience.
-   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
-   **Axios**: Promise-based HTTP client for making API requests.
-   **date-fns**: A modern JavaScript date utility library.
-   **Lucide React**: A beautiful, customizable icon library for React.
-   **OpenWeatherMap API**: For fetching current weather, forecast, air quality, and UV index data.
-   **Nominatim OpenStreetMap API**: For location search suggestions.
-   **gh-pages**: For deploying the application to GitHub Pages.

## Installation and Setup

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (LTS version recommended)
-   npm or Yarn

### 1. Clone the repository

```bash
git clone https://github.com/karthikpeketi/weatherApp.git
cd weatherApp
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env` file in the root of the project and add your OpenWeatherMap API key:

```
VITE_OPENWEATHER_API_KEY=your_openweathermap_api_key_here
```

You can obtain an API key from [OpenWeatherMap](https://openweathermap.org/api).

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open your browser and navigate to `http://localhost:5173` (or the port displayed in your terminal).

### 5. Build for production

```bash
npm run build
# or
yarn build
```

This will create a `dist` directory with the production-ready build.

### 6. Deploy to GitHub Pages

This project is configured for deployment to GitHub Pages using `gh-pages`.

First, ensure your `homepage` field in `package.json` is correctly set to your GitHub Pages URL (e.g., `https://yourusername.github.io/your-repo-name`).

Then, run the deploy script:

```bash
npm run deploy
# or
yarn deploy
```

## Project Structure

```
.
├── public/
├── src/
│   ├── api.js             # API service for OpenWeatherMap and Nominatim
│   ├── App.jsx            # Main application component
│   ├── index.css          # Global styles
│   ├── main.jsx           # Entry point for React app
│   ├── components/        # Reusable React components
│   │   ├── AirQualityCard.jsx
│   │   ├── ExportData.jsx
│   │   ├── FavoriteLocations.jsx
│   │   ├── ForecastCard.jsx
│   │   ├── LocationSuggestions.jsx
│   │   ├── ReusablePopup.jsx
│   │   ├── SunriseSunsetCard.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── UnitToggle.jsx
│   │   ├── VoiceSearch.jsx
│   │   ├── WeatherAlerts.jsx
│   │   ├── WeatherComparison.jsx
│   │   ├── WeatherHistory.jsx
│   │   ├── WeatherMaps.jsx
│   │   └── ui/            # UI components (Button, Card, etc.)
│   ├── constants/         # Application constants
│   │   └── design.js
│   └── utils/             # Utility functions (weather conversions, local storage)
│       └── weatherUtils.js
├── .env                   # Environment variables
├── .gitignore             # Git ignore file
├── index.html             # Main HTML file
├── package.json           # Project dependencies and scripts
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.app.json      # TypeScript configuration (if applicable)
└── vite.config.js         # Vite configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Karthik Peketi - [Your Email/GitHub Profile]

Project Link: [https://github.com/karthikpeketi/weatherApp](https://github.com/karthikpeketi/weatherApp)
