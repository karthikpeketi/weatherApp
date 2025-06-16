import { useState, useEffect, useRef } from "react";
import { X, Cloud, Thermometer, Wind, Droplets, Sun, Snowflake, Zap } from "lucide-react";
import { format } from "date-fns";
import { searchLocations, getWeather, getForecast, getAirQuality, getUVIndex, getWeatherAlerts } from "./api";
import { celsiusToFahrenheit, getFromLocalStorage, saveToLocalStorage } from "./utils/weatherUtils";
import { v4 as uuidv4 } from 'uuid';

// Import new components
import ForecastCard from "./components/ForecastCard";
import WeatherAlerts from "./components/WeatherAlerts";
import FavoriteLocations from "./components/FavoriteLocations";
import WeatherMaps from "./components/WeatherMaps";
import UnitToggle from "./components/UnitToggle";
import AirQualityCard from "./components/AirQualityCard";
import SunriseSunsetCard from "./components/SunriseSunsetCard";
import WeatherComparison from "./components/WeatherComparison";
import VoiceSearch from "./components/VoiceSearch";
import WeatherHistory from "./components/WeatherHistory";
import LocationSuggestions from "./components/LocationSuggestions";

function App() {
	const [weather, setWeather] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [selectedLocation, setSelectedLocation] = useState(null);
	const searchRef = useRef(null);

	// New state for additional features
	const [forecast, setForecast] = useState(null);
	const [airQuality, setAirQuality] = useState(null);
	const [uvIndex, setUVIndex] = useState(null);
	const [alerts, setAlerts] = useState([]);
	const [unit, setUnit] = useState(getFromLocalStorage('temperatureUnit') || 'celsius');
	const [isDarkTheme, setIsDarkTheme] = useState(getFromLocalStorage('isDarkTheme') || false);
	const [showHourlyForecast, setShowHourlyForecast] = useState(false);

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

	useEffect(() => {
		window.saveWeatherToHistory = (weatherData) => {
			const newEntry = {
				id: uuidv4(),
				location: weatherData.name,
				country: weatherData.sys.country,
				weather: weatherData,
				timestamp: Date.now(),
				lat: weatherData.coord.lat,
				lon: weatherData.coord.lon,
			};
			const history = getFromLocalStorage('weatherHistory') || [];
			const newHistory = [newEntry, ...history.slice(0, 49)]; // Keep last 50 entries
			saveToLocalStorage('weatherHistory', newHistory);
		};
	}, []);

	useEffect(() => {
		if (selectedLocation) {
			getWeatherAtLocation(selectedLocation.lat, selectedLocation.lon);
		}
	}, [selectedLocation]);

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
				}
			);
		} else {
			setError("Geolocation is not supported by your browser");
		}
	}, []);

	const handleLocationSelect = (location) => {
		setSelectedLocation(location);
	};

	const getBackgroundImage = () => {
		if (!weather) return weatherBackgrounds.default;
		const condition = weather.weather[0].main;
		return weatherBackgrounds[condition] || weatherBackgrounds.default;
	};



	// New handler functions
	const handleUnitChange = (newUnit) => {
		setUnit(newUnit);
		saveToLocalStorage('temperatureUnit', newUnit);
	};

	const handleVoiceLocationFound = (location) => {
		setSelectedLocation(location);
	};

	const handleFavoriteLocationSelect = (lat, lon) => {
		getWeatherAtLocation(lat, lon);
	};

	// Temperature conversion helper
	const convertTemperature = (temp) => {
		return unit === 'fahrenheit' ? Math.round(celsiusToFahrenheit(temp)) : Math.round(temp);
	};
	const getModalPosition = () => {
		return searchRef.current?.getBoundingClientRect();
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
				<div className="flex flex-col sm:flex-row justify-between items-center mb-6">
				    <h1 className="text-3xl font-bold text-center text-white mb-6 mt-4">Weatherwise</h1>
					{/* Search and Controls */}
					<div className="flex flex-col sm:flex-row gap-4">
						{/* Control Buttons */}
						<div className="flex items-center gap-2">
							<UnitToggle unit={unit} onUnitChange={handleUnitChange} />
							<FavoriteLocations 
								currentLocation={weather} 
								onLocationSelect={handleFavoriteLocationSelect} 
							/>
							<WeatherMaps weather={weather} getModalPosition={getModalPosition} />
							<WeatherComparison currentWeather={weather} />
							<WeatherHistory setSelectedLocation={setSelectedLocation} />
							
							
						</div>
						{/* Location search */}
						<div className="flex items-center gap-2">
							<LocationSuggestions
								placeholder="Search Location..."
								onLocationSelect={handleLocationSelect}
								showIcon={true}
								showClearButton={true}
								showFilters={true}
								autoFocus={error ? true : false}
								className="flex-1"
								inputClassName="py-2"
							/>
							<VoiceSearch onLocationFound={handleVoiceLocationFound} />
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
					<div className="fixed inset-0 flex items-center justify-center z-50">
						<div className="text-white text-center select-none">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
							<p className="text-lg">Loading weather data...</p>
						</div>
					</div>
				) : weather ? (
					<div className="space-y-8">
						{/* Main Weather Display */}
						<div className="md:flex md:flex-row md:justify-between md:items-start select-none cursor-text gap-8">
							<div className="text-white mb-8 md:mb-0">
								{weather && (
									<div className="flex items-center gap-2">
										<div className="text-5xl">
											{weather.weather[0].main === 'Clear' && <Sun className="h-16 w-16 md:h-20 md:w-20" />}
											{weather.weather[0].main === 'Clouds' && <Cloud className="h-16 w-16 md:h-20 md:w-20" />}
											{weather.weather[0].main === 'Rain' && <Droplets className="h-16 w-16 md:h-20 md:w-20" />}
											{weather.weather[0].main === 'Snow' && <Snowflake className="h-16 w-16 md:h-20 md:w-20" />}
											{weather.weather[0].main === 'Thunderstorm' && <Zap className="h-16 w-16 md:h-20 md:w-20" />}
										</div>
										<h1 className="text-5xl font-bold">
											{unit === 'celsius' ? Math.round(weather.main.temp) : celsiusToFahrenheit(weather.main.temp)}
											<span>°{unit === 'celsius' ? 'C' : 'F'}</span>
										</h1>
									</div>
								)}
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
							{/* UV Card */}
							{uvIndex && <SunriseSunsetCard weather={weather} uvIndex={uvIndex} />}
							
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
