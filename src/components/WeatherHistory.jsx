import { useState, useEffect } from 'react';
import { History, X, Calendar } from 'lucide-react';
import { getFromLocalStorage, saveToLocalStorage } from '../utils/weatherUtils';
import { format } from 'date-fns';

const WeatherHistory = () => {
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = getFromLocalStorage('weatherHistory') || [];
    setHistory(savedHistory);
  }, []);

  const saveWeatherToHistory = (weatherData) => {
    if (!weatherData) return;

    const historyEntry = {
      id: Date.now(),
      location: `${weatherData.name}, ${weatherData.sys.country}`,
      temperature: weatherData.main.temp,
      condition: weatherData.weather[0].main,
      description: weatherData.weather[0].description,
      timestamp: Date.now(),
      coords: weatherData.coord
    };

    const updatedHistory = [historyEntry, ...history.slice(0, 49)]; // Keep last 50 entries
    setHistory(updatedHistory);
    saveToLocalStorage('weatherHistory', updatedHistory);
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

      {showHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 text-white max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History className="h-6 w-6" />
                <h3 className="text-2xl font-semibold">Weather History</h3>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

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
                      {entries.map((entry) => (
                        <div key={entry.id} className="bg-white/5 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-medium text-sm">{entry.location}</div>
                              <div className="text-xs opacity-70">
                                {format(new Date(entry.timestamp), 'HH:mm')}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                {Math.round(entry.temperature)}°
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-sm">
                            <div className="font-medium">{entry.condition}</div>
                            <div className="opacity-70 capitalize">{entry.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherHistory;