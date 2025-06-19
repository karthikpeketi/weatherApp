// Weather utility functions

export const celsiusToFahrenheit = (celsius) => {
  return Math.round((celsius * 9/5) + 32);
};

export const getAirQualityLevel = (aqi) => {
  if (aqi <= 50) return { level: 'Good', color: 'text-green-500', bg: 'bg-green-100' };
  if (aqi <= 100) return { level: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-100' };
  if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'text-orange-500', bg: 'bg-orange-100' };
  if (aqi <= 200) return { level: 'Unhealthy', color: 'text-red-500', bg: 'bg-red-100' };
  if (aqi <= 300) return { level: 'Very Unhealthy', color: 'text-purple-500', bg: 'bg-purple-100' };
  return { level: 'Hazardous', color: 'text-red-800', bg: 'bg-red-200' };
};

export const getUVLevel = (uv) => {
  if (uv <= 2) return { level: 'Low', color: 'text-green-500' };
  if (uv <= 5) return { level: 'Moderate', color: 'text-yellow-500' };
  if (uv <= 7) return { level: 'High', color: 'text-orange-500' };
  if (uv <= 10) return { level: 'Very High', color: 'text-red-500' };
  return { level: 'Extreme', color: 'text-purple-500' };
};

export const formatTime = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export const getWeatherIcon = (iconCode) => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

export const exportWeatherData = (weatherData, forecast) => {
  const data = {
    current: weatherData,
    forecast: forecast,
    exportedAt: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `weather-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Weather history management utilities
export const HISTORY_RETENTION_DAYS = 3;
export const HISTORY_RETENTION_MS = HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export const cleanupOldHistoryEntries = () => {
  const history = getFromLocalStorage('weatherHistory') || [];
  const currentTime = Date.now();
  const cutoffTime = currentTime - HISTORY_RETENTION_MS;
  
  // Filter out entries older than retention period
  const validEntries = history.filter(entry => {
    // Handle both old entries without timestamp and new entries with timestamp
    const entryTime = entry.timestamp || entry.id || 0;
    return entryTime > cutoffTime;
  });
  
  // Only update localStorage if we actually removed entries
  if (validEntries.length !== history.length) {
    saveToLocalStorage('weatherHistory', validEntries);
    console.log(`Cleaned up ${history.length - validEntries.length} old weather history entries`);
    
    // Dispatch custom event to notify components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('weatherHistoryUpdated'));
    }
    
    return validEntries.length;
  }
  
  return history.length;
};

export const addWeatherToHistory = (weatherData) => {
  if (!weatherData) return;

  const currentTime = Date.now();
  const cutoffTime = currentTime - HISTORY_RETENTION_MS;
  
  // Get existing history and clean it
  const existingHistory = getFromLocalStorage('weatherHistory') || [];
  const cleanHistory = existingHistory.filter(entry => {
    const entryTime = entry.timestamp || entry.id || 0;
    return entryTime > cutoffTime;
  });
  
  // Create new entry with timestamp
  const newEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    location: `${weatherData.name}, ${weatherData.sys.country}`,
    country: weatherData.sys.country,
    weather: weatherData,
    temperature: weatherData.main.temp,
    condition: weatherData.weather[0].main,
    description: weatherData.weather[0].description,
    timestamp: currentTime,
    coords: {
      lat: weatherData.coord.lat,
      lon: weatherData.coord.lon
    }
  };
  
  // Remove any existing entry for the same location to avoid duplicates
  const filteredHistory = cleanHistory.filter(entry => 
    entry.location !== newEntry.location
  );
  
  // Add new entry at the beginning
  const newHistory = [newEntry, ...filteredHistory];
  saveToLocalStorage('weatherHistory', newHistory);
  
  // Dispatch custom event to notify components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('weatherHistoryUpdated'));
  }
  
  return newHistory.length;
};