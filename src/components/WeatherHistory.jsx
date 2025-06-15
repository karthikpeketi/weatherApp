import { useState, useEffect } from 'react';
import { History, Calendar } from 'lucide-react';
import { getFromLocalStorage, saveToLocalStorage } from '../utils/weatherUtils';
import { format } from 'date-fns';
import ReusablePopup from './ReusablePopup';

const WeatherHistory = ({ setSelectedLocation }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = getFromLocalStorage('weatherHistory') || [];
    setHistory(savedHistory);
  }, []);

  const saveWeatherToHistory = (weatherData) => {
    if (!weatherData) return;

    const locationString = `${weatherData.name}, ${weatherData.sys.country}`;
    
    // Check if this location already exists in history
    const isDuplicate = history.some(entry => 
      entry.location === locationString
    );

    if (!isDuplicate) {
      const historyEntry = {
        id: Date.now(),
        location: locationString,
        temperature: weatherData.main.temp,
        condition: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        timestamp: Date.now(),
        coords: weatherData.coord
      };

      const updatedHistory = [historyEntry, ...history.slice(0, 49)];
      setHistory(updatedHistory);
      saveToLocalStorage('weatherHistory', updatedHistory);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    saveToLocalStorage('weatherHistory', []);
  };

  const groupHistoryByDate = (historyData) => {
    const grouped = {};
    historyData.forEach(entry => {
      const date = format(new Date(entry.timestamp), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(entry);
    });
    return grouped;
  };

  const groupedHistory = groupHistoryByDate(history);

  // Expose the save function to parent component
  useEffect(() => {
    window.saveWeatherToHistory = saveWeatherToHistory;
    return () => {
      delete window.saveWeatherToHistory;
    };
  }, [history]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
        title="Weather History"
      >
        <History className="h-5 w-5" />
        {history.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {history.length > 99 ? '99+' : history.length}
          </span>
        )}
      </button>

      <ReusablePopup
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        title="Weather History"
        titleIcon={<History className="h-6 w-6" />}
        maxWidth="max-w-4xl"
      >
        {history.length === 0 ? (
          <div className="text-center py-12 opacity-70">
            <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No weather history yet</p>
            <p className="text-sm mt-2">Search for locations to build your weather history</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedHistory).map(([date, entries]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/20">
                  <Calendar className="h-4 w-4" />
                  <h4 className="font-semibold">
                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  </h4>
                  <span className="text-sm opacity-70">({entries.length} searches)</span>
                </div>
                
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {entries.map((entry, index) => (
                    <div 
                      key={index} 
                      className="bg-white/5 backdrop-blur-md rounded-2xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => {
                        if (setSelectedLocation) {
                          setSelectedLocation({ lat: entry.coords.lat, lon: entry.coords.lon });
                        }
                        setShowHistory(false);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-lg">{entry.location}</div>
                          <div className="text-sm opacity-80">{format(new Date(entry.timestamp), 'HH:mm')}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">{Math.round(entry.temperature)}°</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="text-sm">
                          {entry.condition}
                        </div>
                        <div className="opacity-70 capitalize">{entry.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {history.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={clearHistory}
              className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Clear All History
            </button>
          </div>
        )}
      </ReusablePopup>
    </div>
  );
};

export default WeatherHistory;