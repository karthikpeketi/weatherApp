import { useState, useEffect } from 'react';
import { History, Calendar, Clock } from 'lucide-react';
import { getFromLocalStorage, saveToLocalStorage } from '../utils/weatherUtils';
import { format, formatDistanceToNow } from 'date-fns';
import ReusablePopup from './ReusablePopup';

const WeatherHistory = ({ setSelectedLocation }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  // Load history from localStorage (already cleaned by App.jsx)
  useEffect(() => {
    const loadHistory = () => {
      const savedHistory = getFromLocalStorage('weatherHistory') || [];
      setHistory(savedHistory);
    };

    loadHistory();

    // Listen for storage changes to keep component in sync
    const handleStorageChange = () => {
      loadHistory();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener for when history is updated by the app
    window.addEventListener('weatherHistoryUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('weatherHistoryUpdated', handleStorageChange);
    };
  }, []);

  const clearHistory = () => {
    setHistory([]);
    saveToLocalStorage('weatherHistory', []);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('weatherHistoryUpdated'));
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

  const getTimeAgo = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  const groupedHistory = groupHistoryByDate(history);

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
        maxWidth="70%"
      >
        {history.length === 0 ? (
          <div className="text-center py-12 opacity-70">
            <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No recent weather history</p>
            <p className="text-sm mt-2 opacity-80">Search for locations to build your weather history</p>
            <p className="text-xs mt-1 opacity-60">History is automatically kept for 3 days</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <p className="text-sm opacity-70">
                Showing {history.length} recent searches (last 3 days)
              </p>
            </div>
            
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
                      key={entry.id || index} 
                      className="bg-white/5 backdrop-blur-md rounded-2xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => {
                        if (setSelectedLocation && entry.coords) {
                          setSelectedLocation({ lat: entry.coords.lat, lon: entry.coords.lon });
                        }
                        setShowHistory(false);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-lg">{entry.location}</div>
                          <div className="flex items-center gap-2 text-sm opacity-80 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{getTimeAgo(entry.timestamp)}</span>
                          </div>
                          <div className="text-xs opacity-60 mt-1">
                            {format(new Date(entry.timestamp), 'HH:mm')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">{Math.round(entry.temperature)}°</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="text-sm font-medium">
                          {entry.condition}
                        </div>
                        <div className="opacity-70 capitalize text-sm">{entry.description}</div>
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