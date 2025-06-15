import { useState, useEffect } from 'react';
import { Map, RefreshCw, X } from 'lucide-react';
import { createPortal } from 'react-dom';

const WeatherMaps = ({ weather, getModalPosition }) => {
  const [showMaps, setShowMaps] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState('temp_new');
  const [mapError, setMapError] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [showCities, setShowCities] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lon: 0 });

  useEffect(() => {
    if (getModalPosition) {
      const rect = getModalPosition();
      document.documentElement.style.setProperty('--window-width', `${window.innerWidth}px`);
    }
  }, [getModalPosition]);

  useEffect(() => {
    if (weather) {
      setMapCenter({ lat: weather.coord.lat, lon: weather.coord.lon });
    }
  }, [weather]);

  // Handle escape key press and body scroll for custom popup
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showMaps) {
        setShowMaps(false);
      }
    };

    if (showMaps) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Restore original styles
      document.body.style.overflow = '';
    };
  }, [showMaps]);

  if (!weather) return null;

  const { lat, lon } = mapCenter;
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const handleMapLoad = () => {
    setMapLoading(false);
    setMapError(false);
  };

  const handleMapError = () => {
    setMapLoading(false);
    setMapError(true);
  };

  const getMapUrl = () => {
    const tileSize = Math.pow(2, zoomLevel);
    const tileX = Math.floor((lon + 180) / 360 * tileSize);
    const tileY = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * tileSize);
    
    return `https://tile.openweathermap.org/map/${selectedLayer}/${zoomLevel}/${tileX}/${tileY}.png?appid=${API_KEY}`;
  };

  const getInteractiveMapUrl = () => {
    const citiesParam = showCities ? 'true' : 'false';
    return `https://openweathermap.org/weathermap?basemap=map&cities=${citiesParam}&layer=${selectedLayer}&lat=${lat}&lon=${lon}&zoom=${zoomLevel}`;
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowMaps(false);
    }
  };

  const customPopup = showMaps ? (
    <div 
      className="fixed inset-0 w-screen h-screen bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-2"
      onClick={handleBackdropClick}
    >
      <div className="w-full h-full bg-white/10 backdrop-blur-md rounded-2xl text-white flex flex-col overflow-hidden">
        {/* Minimal Header */}
        <div className="flex items-center justify-between p-4 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Map className="h-6 w-6" />
            <h3 className="text-xl font-semibold">Weather Map - {weather.name}, {weather.sys.country}</h3>
          </div>
          <button
            onClick={() => setShowMaps(false)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Close map"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Full Screen Map Display */}
        <div className="flex-1 p-4 pt-2">
          {API_KEY ? (
            <div className="relative w-full h-full">
              <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100">
                {mapLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                    <div className="text-center text-white">
                      <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4" />
                      <p className="text-lg">Loading weather map...</p>
                    </div>
                  </div>
                )}
                
                {mapError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                    <div className="text-center text-white">
                      <Map className="h-16 w-16 mx-auto mb-4 opacity-70" />
                      <p className="text-lg mb-4">Map temporarily unavailable</p>
                      <button
                        onClick={() => {
                          setMapError(false);
                          setMapLoading(true);
                        }}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg"
                      >
                        Retry Loading Map
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    {/* Interactive Map using iframe for better functionality */}
                    <iframe
                      key={`${selectedLayer}-${lat}-${lon}-${zoomLevel}-${showCities}`}
                      src={getInteractiveMapUrl()}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      title={`${selectedLayer} weather map`}
                      className="rounded-lg"
                      onLoad={handleMapLoad}
                      onError={handleMapError}
                      style={{ display: mapLoading ? 'none' : 'block' }}
                      allow="fullscreen"
                    />
                    
                    {/* Fallback: Use tile approach if iframe fails */}
                    {mapError && (
                      <img
                        src={getMapUrl()}
                        alt={`${selectedLayer} weather map`}
                        className="w-full h-full object-cover rounded-lg"
                        onLoad={handleMapLoad}
                        onError={() => {
                          console.error('Both iframe and tile approaches failed');
                          setMapError(true);
                          setMapLoading(false);
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-900/50 backdrop-blur-sm h-full rounded-lg flex items-center justify-center">
              <div className="text-white text-center">
                <Map className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">API key required for weather maps</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMaps(!showMaps)}
        className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
        title="Weather Maps"
      >
        <Map className="h-5 w-5" />
      </button>

      {/* Custom Fullscreen Popup */}
      {customPopup && createPortal(customPopup, document.body)}
    </div>
  );
};

export default WeatherMaps;