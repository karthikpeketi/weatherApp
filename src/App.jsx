import { useState, useEffect, useRef } from "react";
import { X, Cloud, Thermometer, Wind, Droplets, Settings } from "lucide-react";
import { format } from "date-fns";
import { searchLocations, getWeather, getForecast, getAirQuality, getUVIndex, getWeatherAlerts } from "./api";
import { celsiusToFahrenheit, getFromLocalStorage, saveToLocalStorage } from "./utils/weatherUtils";

// Import new components
import ForecastCard from "./components/ForecastCard";
import WeatherAlerts from "./components/WeatherAlerts";
import FavoriteLocations from "./components/FavoriteLocations";
import WeatherMaps from "./components/WeatherMaps";
import UnitToggle from "./components/UnitToggle";
import ThemeToggle from "./components/ThemeToggle";
import AirQualityCard from "./components/AirQualityCard";
import SunriseSunsetCard from "./components/SunriseSunsetCard";
import WeatherComparison from "./components/WeatherComparison";
import VoiceSearch from "./components/VoiceSearch";
import WeatherHistory from "./components/WeatherHistory";
import ExportData from "./components/ExportData";

function App() {
	const [query, setQuery] = useState("");
	const [locations, setLocations] = useState([]);
	const [weather, setWeather] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isLocationSelected, setIsLocationSelected] = useState(false);
	const searchRef = useRef(null);
	const searchInputRef = useRef(null);

	// New state for additional features
	const [forecast, setForecast] = useState(null);
	const [airQuality, setAirQuality] = useState(null);
	const [uvIndex, setUVIndex] = useState(null);
	const [alerts, setAlerts] = useState([]);
	const [unit, setUnit] = useState(getFromLocalStorage('temperatureUnit') || 'celsius');
	const [isDarkTheme, setIsDarkTheme] = useState(getFromLocalStorage('isDarkTheme') || false);
	const [showHourlyForecast, setShowHourlyForecast] = useState(false);
	const [showSettings, setShowSettings] = useState(false);

	// Weather condition backgrounds mapping
	const weatherBackgrounds = {
		// Clear
		Clear:
			"https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&q=80",
		// Clouds
		Clouds:
			"https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80",
		// Rain
		Rain: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&q=80",
		// Thunderstorm
		Thunderstorm:
			"https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&q=80",
		// Snow
		Snow: "https://images.unsplash.com/photo-1478265409131-1f65c88f965c?auto=format&fit=crop&q=80",
		// Mist/Fog
		Mist: "https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?auto=format&fit=crop&q=80",
		Fog: "https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?auto=format&fit=crop&q=80",
		// Default
		default:
			"https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&q=80",
	};

	const getWeatherAtLocation = async (latitude, longitude) => {
		try {
			setLoading(true);
			setError("");
			
			// Fetch all weather data
			const [weatherData, forecastData, airQualityData, uvData, alertsData] = await Promise.allSettled([
				getWeather(latitude, longitude),
				getForecast(latitude, longitude),
				getAirQuality(latitude, longitude),
				getUVIndex(latitude, longitude),
				getWeatherAlerts(latitude, longitude)
			]);

			if (weatherData.status === 'fulfilled' && weatherData.value) {
				setWeather(weatherData.value);
				
				// Save to history
				if (window.saveWeatherToHistory) {
					window.saveWeatherToHistory(weatherData.value);
				}
			} else {
				setError("Failed to fetch weather data");
				searchInputRef.current?.focus();
				return;
			}

			// Set additional data if available
			if (forecastData.status === 'fulfilled' && forecastData.value) {
				setForecast(forecastData.value);
			}

			if (airQualityData.status === 'fulfilled' && airQualityData.value) {
				setAirQuality(airQualityData.value);
			}

			if (uvData.status === 'fulfilled' && uvData.value) {
				setUVIndex(uvData.value);
			}

			if (alertsData.status === 'fulfilled' && alertsData.value && alertsData.value.alerts) {
				setAlerts(alertsData.value.alerts);
			}

		} catch (err) {
			setError("Failed to fetch weather data");
			searchInputRef.current?.focus();
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					getWeatherAtLocation(
						position.coords.latitude,
						position.coords.longitude
					);
				},
				(error) => {
					console.error("Geolocation error:", error.message);
					setError("Please enter your location manually");
					searchInputRef.current?.focus();
				}
			);
		} else {
			setError("Geolocation is not supported by your browser");
			searchInputRef.current?.focus();
		}
	}, []);

	useEffect(() => {
		const fetchLocations = async () => {
			if (query.length >= 2 && !isLocationSelected) {
				try {
					const results = await searchLocations(query);
					setLocations(results);
					setShowSuggestions(true);
				} catch (err) {
					setLocations([]);
				}
			} else {
				setLocations([]);
				setShowSuggestions(false);
			}
		};

		const timeoutId = setTimeout(fetchLocations, 300);
		return () => clearTimeout(timeoutId);
	}, [query]);

	const handleLocationSelect = async (location) => {
		setQuery(location.display_name);
		setIsLocationSelected(true);
		setShowSuggestions(false);
		await getWeatherAtLocation(location.lat, location.lon);
	};

	const getBackgroundImage = () => {
		if (!weather) return weatherBackgrounds.default;
		const condition = weather.weather[0].main;
		return weatherBackgrounds[condition] || weatherBackgrounds.default;
	};

	const handleOnClearLocation = () => {
		if (query != "") {
			setQuery("");
			setIsLocationSelected(false);
			setShowSuggestions(false);
			searchInputRef.current?.focus();
		}
	};

	// New handler functions
	const handleUnitChange = (newUnit) => {
		setUnit(newUnit);
		saveToLocalStorage('temperatureUnit', newUnit);
	};

	const handleThemeChange = () => {
		const newTheme = !isDarkTheme;
		setIsDarkTheme(newTheme);
		saveToLocalStorage('isDarkTheme', newTheme);
	};

	const handleVoiceLocationFound = (location) => {
		setQuery(location.display_name);
		setIsLocationSelected(true);
		setShowSuggestions(false);
		getWeatherAtLocation(location.lat, location.lon);
	};

	const handleFavoriteLocationSelect = (lat, lon) => {
		getWeatherAtLocation(lat, lon);
	};

	// Temperature conversion helper
	const convertTemperature = (temp) => {
		return unit === 'fahrenheit' ? Math.round(celsiusToFahrenheit(temp)) : Math.round(temp);
	};
	return (
		<div
			className={`min-h-screen w-full bg-cover bg-center bg-no-repeat transition-all duration-1000 ${
				isDarkTheme ? 'brightness-75' : ''
			}`}
			style={{
				backgroundImage: `url("${getBackgroundImage()}")`,
			}}
		>
			<div className="min-h-screen bg-black/30 backdrop-blur-sm px-[15px] md:px-[25px] xl:px-[40px]">
				{/* Header with Logo, Search, and Controls */}
				<div className="min-h-[15vh] flex items-center justify-between mb-6">
					<div className="text-white font-bold text-2xl select-none">
						Weather<span className="text-yellow-400">⚡</span>
					</div>
					
					{/* Search and Controls */}
					<div className="flex items-center gap-4">
						{/* Control Buttons */}
						<div className="flex items-center gap-2">
							<UnitToggle unit={unit} onUnitChange={handleUnitChange} />
							{/* <ThemeToggle isDark={isDarkTheme} onThemeChange={handleThemeChange} /> */}
							<VoiceSearch onLocationFound={handleVoiceLocationFound} />
							<FavoriteLocations 
								currentLocation={weather} 
								onLocationSelect={handleFavoriteLocationSelect} 
							/>
							<WeatherMaps weather={weather} />
							<WeatherComparison currentWeather={weather} />
							<WeatherHistory />
							<ExportData weather={weather} forecast={forecast} />
							
							<button
								onClick={() => setShowSettings(!showSettings)}
								className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
								title="Settings"
							>
								<Settings className="h-5 w-5" />
							</button>
						</div>

						{/* Location search */}
						<div className="relative z-50" ref={searchRef}>
							<input
								ref={searchInputRef}
								type="text"
								placeholder="Search Location..."
								className="w-full md:w-[300px] bg-white/20 backdrop-blur-md text-white placeholder-white/70 px-4 py-2 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-white/50"
								value={query}
								onChange={(e) => {
									setIsLocationSelected(false);
									setQuery(e.target.value);
								}}
								onFocus={() => query.length >= 2 && setShowSuggestions(true)}
							/>
							<button onClick={handleOnClearLocation}>
								<X className="absolute right-3 top-2.5 text-white/70 h-5 w-5" />
							</button>

							{/* Location Suggestions */}
							{showSuggestions && locations.length > 0 && (
								<div className="absolute mt-2 w-full bg-white/90 backdrop-blur-md rounded-lg shadow-lg overflow-auto max-h-96">
									{locations.map((location, index) => (
										<div
											key={`${location.lat}-${location.lon}-${index}`}
											className="px-4 py-3 hover:bg-white/50 cursor-pointer transition-colors border-b border-white/10 last:border-0"
											onClick={() => handleLocationSelect(location)}
										>
											<div className="text-gray-800 font-medium">
												{location.display_name}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Weather Alerts */}
				<WeatherAlerts alerts={alerts} />

				{error && (
					<div className="text-red-400 text-center mb-4 bg-red-900/20 backdrop-blur-sm p-4 rounded-lg">
						{error}
					</div>
				)}

				{loading ? (
					<div className="text-white text-center select-none">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
						Loading weather data...
					</div>
				) : weather ? (
					<div className="space-y-8">
						{/* Main Weather Display */}
						<div className="md:flex md:flex-row md:justify-between md:items-start select-none cursor-text gap-8">
							<div className="text-white mb-8 md:mb-0">
								<div className="text-8xl font-light mb-4">
									{convertTemperature(weather.main.temp)}°{unit === 'fahrenheit' ? 'F' : 'C'}
								</div>
								<div className="text-3xl mb-2">
									{weather.name}, {weather.sys.country}
								</div>
								<div className="text-lg opacity-70 mb-4">
									{format(new Date(), "HH:mm - EEEE, d MMM yy")}
								</div>
								<div className="text-lg font-medium">
									{weather.weather[0].description.toUpperCase()}
								</div>
								<div className="text-sm opacity-70 mt-2">
									Feels like {convertTemperature(weather.main.feels_like)}°{unit === 'fahrenheit' ? 'F' : 'C'}
								</div>
							</div>

							{/* Weather Details Card */}
							<div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-white max-w-md md:min-w-96">
								<h2 className="text-xl mb-6">Weather Details</h2>

								<div className="space-y-6">
									<div className="flex justify-between items-center">
										<div className="flex items-center gap-2">
											<Thermometer className="h-5 w-5" />
											<span>Temp max</span>
										</div>
										<span>{convertTemperature(weather.main.temp_max)}°{unit === 'fahrenheit' ? 'F' : 'C'}</span>
									</div>

									<div className="flex justify-between items-center">
										<div className="flex items-center gap-2">
											<Thermometer className="h-5 w-5" />
											<span>Temp min</span>
										</div>
										<span>{convertTemperature(weather.main.temp_min)}°{unit === 'fahrenheit' ? 'F' : 'C'}</span>
									</div>

									<div className="flex justify-between items-center">
										<div className="flex items-center gap-2">
											<Droplets className="h-5 w-5" />
											<span>Humidity</span>
										</div>
										<span>{weather.main.humidity}%</span>
									</div>

									<div className="flex justify-between items-center">
										<div className="flex items-center gap-2">
											<Cloud className="h-5 w-5" />
											<span>Cloudy</span>
										</div>
										<span>{weather.clouds.all}%</span>
									</div>

									<div className="flex justify-between items-center">
										<div className="flex items-center gap-2">
											<Wind className="h-5 w-5" />
											<span>Wind</span>
										</div>
										<span>{Math.round(weather.wind.speed * 3.6)}km/h</span>
									</div>

									<div className="flex justify-between items-center">
										<div className="flex items-center gap-2">
											<Thermometer className="h-5 w-5" />
											<span>Pressure</span>
										</div>
										<span>{weather.main.pressure} hPa</span>
									</div>

									<div className="flex justify-between items-center">
										<div className="flex items-center gap-2">
											<Cloud className="h-5 w-5" />
											<span>Visibility</span>
										</div>
										<span>{weather.visibility ? (weather.visibility / 1000).toFixed(1) : 'N/A'} km</span>
									</div>
								</div>
							</div>
						</div>

						{/* Additional Weather Cards */}
						<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
							{/* Sunrise/Sunset & UV Card */}
							<SunriseSunsetCard weather={weather} uvIndex={uvIndex} />
							
							{/* Air Quality Card */}
							{airQuality && <AirQualityCard airQuality={airQuality} />}
						</div>

						{/* Forecast Toggle Buttons */}
						{forecast && (
							<div className="flex justify-center gap-4 mb-6">
								<button
									onClick={() => setShowHourlyForecast(false)}
									className={`px-6 py-3 rounded-lg backdrop-blur-md transition-colors ${
										!showHourlyForecast 
											? 'bg-white/30 text-white' 
											: 'bg-white/10 text-white/70 hover:bg-white/20'
									}`}
								>
									5-Day Forecast
								</button>
								<button
									onClick={() => setShowHourlyForecast(true)}
									className={`px-6 py-3 rounded-lg backdrop-blur-md transition-colors ${
										showHourlyForecast 
											? 'bg-white/30 text-white' 
											: 'bg-white/10 text-white/70 hover:bg-white/20'
									}`}
								>
									24-Hour Forecast
								</button>
							</div>
						)}

						{/* Forecast Cards */}
						{forecast && (
							<ForecastCard forecast={forecast} isHourly={showHourlyForecast} />
						)}
					</div>
				) : (
					<div className="text-white text-center select-none">
						<div className="text-6xl mb-4">🌤️</div>
						<div className="text-xl mb-2">No weather data available</div>
						<div className="text-sm opacity-70">Search for a location to get started</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default App;
