import { useState } from 'react';
import { BarChart3, X } from 'lucide-react';
import { getWeather } from '../api';
import ReusablePopup from './ReusablePopup';
import LocationSuggestions from './LocationSuggestions';

const WeatherComparison = ({ currentWeather }) => {
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonLocations, setComparisonLocations] = useState([]);
  const [loading, setLoading] = useState(false);

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
        maxWidth="60%"
      >
        {/* Add Location Search */}
        <div className="mb-6 mt-1">
          <LocationSuggestions
            placeholder="Search location to compare..."
            onLocationSelect={addLocationForComparison}
            maxResults={5}
            showIcon={true}
            showClearButton={true}
            showFilters={true}
            disabled={loading}
            className="w-full"
          />
        </div>

        {/* Comparison Table */}
        {allLocations.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full hidden sm:table">
              <thead className=" sm:table-header-group">
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

            <table className="w-full sm:hidden">
              <tbody>
                {allLocations.map((location) => (
                  <tr key={location.id} className={`border-b border-white/10 ${location.isCurrent ? 'bg-white/10' : ''} flex flex-col`}>
                    <td className="p-3 flex justify-between">
                      <div className="font-medium">Location</div>
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
                    <td className="p-3 flex justify-between">
                      <div className="font-medium">Temperature</div>
                      <div className="text-xl font-bold">
                        {Math.round(location.weather.main.temp)}°
                      </div>
                    </td>
                    <td className="p-3 flex justify-between">
                      <div className="font-medium">Feels Like</div>
                      <div>
                        {Math.round(location.weather.main.feels_like)}°
                      </div>
                    </td>
                    <td className="p-3 flex justify-between">
                      <div className="font-medium">Humidity</div>
                      <div>
                        {location.weather.main.humidity}%
                      </div>
                    </td>
                    <td className="p-3 flex justify-between">
                      <div className="font-medium">Wind</div>
                      <div>
                        {Math.round(location.weather.wind.speed * 3.6)} km/h
                      </div>
                    </td>
                    <td className="p-3 flex justify-between">
                      <div className="font-medium">Condition</div>
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
                    <td className="p-3 flex justify-between">
                      <div className="font-medium">Action</div>
                      <div>
                        {!location.isCurrent && (
                          <button
                            onClick={() => removeLocation(location.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Remove from comparison"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
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
