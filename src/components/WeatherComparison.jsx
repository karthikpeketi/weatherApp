import { useState } from 'react';
import { BarChart3, X, Plus } from 'lucide-react';
import { getWeather, searchLocations as apiSearchLocations } from '../api';
import ReusablePopup from './ReusablePopup';

const WeatherComparison = ({ currentWeather }) => {
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonLocations, setComparisonLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchLocations = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const data = await apiSearchLocations(query);
      // Limit to 5 results for the comparison component
      setSearchResults(data.slice(0, 5));
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    }
  };

  const addLocationForComparison = async (location) => {
    setLoading(true);
    try {
      const weatherData = await getWeather(location.lat, location.lon);
      if (weatherData) {
        const newLocation = {
          id: Date.now(),
          name: weatherData.name,
          country: weatherData.sys.country,
          weather: weatherData
        };
        setComparisonLocations(prev => [...prev, newLocation]);
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching weather for comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeLocation = (id) => {
    setComparisonLocations(prev => prev.filter(loc => loc.id !== id));
  };

  const allLocations = currentWeather ? [
    {
      id: 'current',
      name: currentWeather.name,
      country: currentWeather.sys.country,
      weather: currentWeather,
      isCurrent: true
    },
    ...comparisonLocations
  ] : comparisonLocations;

  return (
    <div className="relative">
      <button
        onClick={() => setShowComparison(!showComparison)}
        className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
        title="Compare Weather"
      >
        <BarChart3 className="h-5 w-5" />
      </button>

      <ReusablePopup
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        title="Weather Comparison"
        titleIcon={<BarChart3 className="h-6 w-6" />}
        maxWidth="max-w-4xl"
      >
        {/* Add Location Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search location to compare..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchLocations(e.target.value);
              }}
              className="w-full bg-white/20 backdrop-blur-md text-white placeholder-white/70 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Plus className="absolute right-3 top-3.5 text-white/70 h-5 w-5" />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white/90 backdrop-blur-md rounded-lg shadow-lg overflow-hidden">
              {searchResults.map((location, index) => (
                <button
                  key={index}
                  onClick={() => addLocationForComparison(location)}
                  disabled={loading}
                  className="w-full px-4 py-3 text-left hover:bg-white/50 transition-colors border-b border-white/10 last:border-0 text-gray-800"
                >
                  {location.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comparison Table */}
        {allLocations.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-3">Location</th>
                  <th className="text-center p-3">Temperature</th>
                  <th className="text-center p-3">Feels Like</th>
                  <th className="text-center p-3">Humidity</th>
                  <th className="text-center p-3">Wind</th>
                  <th className="text-center p-3">Condition</th>
                  <th className="text-center p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {allLocations.map((location) => (
                  <tr key={location.id} className={`border-b border-white/10 ${location.isCurrent ? 'bg-white/10' : ''}`}>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">
                          {location.name}
                          {location.isCurrent && (
                            <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-sm opacity-70">{location.country}</div>
                      </div>
                    </td>
                    <td className="text-center p-3">
                      <div className="text-xl font-bold">
                        {Math.round(location.weather.main.temp)}°
                      </div>
                    </td>
                    <td className="text-center p-3">
                      {Math.round(location.weather.main.feels_like)}°
                    </td>
                    <td className="text-center p-3">
                      {location.weather.main.humidity}%
                    </td>
                    <td className="text-center p-3">
                      {Math.round(location.weather.wind.speed * 3.6)} km/h
                    </td>
                    <td className="text-center p-3">
                      <div className="flex flex-col items-center">
                        <img
                          src={`https://openweathermap.org/img/wn/${location.weather.weather[0].icon}@2x.png`}
                          alt={location.weather.weather[0].description}
                          className="w-8 h-8"
                        />
                        <div className="text-xs opacity-70">
                          {location.weather.weather[0].main}
                        </div>
                      </div>
                    </td>
                    <td className="text-center p-3">
                      {!location.isCurrent && (
                        <button
                          onClick={() => removeLocation(location.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Remove from comparison"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {allLocations.length === 0 && (
          <div className="text-center py-12 opacity-70">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Add locations to compare weather conditions</p>
          </div>
        )}
      </ReusablePopup>
    </div>
  );
};

export default WeatherComparison;