import { useState, useEffect, useRef } from "react";
import { X, Cloud, Thermometer, Wind, Droplets } from "lucide-react";
import { format } from "date-fns";
import { searchLocations, getWeather } from "./api";
import { Location, WeatherData, weatherBackgrounds } from "./types";

function App() {
	const [query, setQuery] = useState("");
	const [locations, setLocations] = useState<Location[]>([]);
	const [weather, setWeather] = useState<WeatherData | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isLocationSelected, setIsLocationSelected] = useState<boolean>(false);
	const searchRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	const getWeatherAtLocation = async (latitude: number, longitude: number) => {
		try {
			setLoading(true);
			setError("");
			const weatherData = await getWeather(latitude, longitude);
			if (weatherData) {
				setWeather(weatherData);
			} else {
				setError("Failed to fetch weather data");
				searchInputRef.current?.focus();
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

	const handleLocationSelect = async (location: Location) => {
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
		if(query != "") {
			setQuery("");
			setIsLocationSelected(false);
			setShowSuggestions(false);
			searchInputRef.current?.focus();
		}
	}
	return (
		<div
			className="min-h-screen w-full bg-cover bg-center bg-no-repeat transition-all duration-1000"
			style={{
				backgroundImage: `url("${getBackgroundImage()}")`,
			}}
		>
			<div className="min-h-screen bg-black/30 backdrop-blur-sm px-[15px] md:px-[25px] xl:px-[40px]">
				{/* Header with Logo and Search */}
				<div className="min-h-[15vh] flex items-center justify-between mb-12">
					<div className="text-white font-bold text-2xl">
						Weather<span className="text-yellow-400">⚡</span>
					</div>
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
							<div className="bg-red absolute mt-2 w-full bg-white/90 backdrop-blur-md rounded-lg shadow-lg overflow-auto max-h-96">
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

				{error && (
					<div className="text-red-400 text-center mb-4 bg-red-900/20 backdrop-blur-sm p-4 rounded-lg">
						{error}
					</div>
				)}

				{loading ? (
					<div className="text-white text-center">Loading...</div>
				) : weather ? (
					// Main Weather Display
					<div className="min-h-[78vh] md:flex md:flex-row md:justify-between md:items-center">
						<div className="text-white mb-12">
							<div className="text-8xl font-light mb-4">
								{Math.round(weather.main.temp)}°
							</div>
							<div className="text-3xl mb-2">
								{weather.name}, {weather.sys.country}
							</div>
							<div className="text-lg opacity-70">
								{format(new Date(), "HH:mm - EEEE, d MMM yy")}
							</div>
						</div>

						{/* Weather Details Card */}
						<div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-white max-w-md md:min-w-96 max-w-xl">
							<h2 className="text-xl mb-6">Weather Details</h2>

							<div className="text-center mb-8">
								<div className="text-lg font-medium mb-2">
									{weather.weather[0].description.toUpperCase()}
								</div>
							</div>

							<div className="space-y-6">
								<div className="flex justify-between items-center">
									<div className="flex items-center gap-2">
										<Thermometer className="h-5 w-5" />
										<span>Temp max</span>
									</div>
									<span>{Math.round(weather.main.temp_max)}°</span>
								</div>

								<div className="flex justify-between items-center">
									<div className="flex items-center gap-2">
										<Thermometer className="h-5 w-5" />
										<span>Temp min</span>
									</div>
									<span>{Math.round(weather.main.temp_min)}°</span>
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
							</div>
						</div>
					</div>
				) : (
					<div className="text-white text-center">
						No weather data available
					</div>
				)}
			</div>
		</div>
	);
}

export default App;
