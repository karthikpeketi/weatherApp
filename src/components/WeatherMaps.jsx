import { useState } from 'react';
import { Map, Layers, X } from 'lucide-react';

const WeatherMaps = ({ weather }) => {
  const [showMaps, setShowMaps] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState('temp_new');

  if (!weather) return null;

  const { lat, lon } = weather.coord;
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const mapLayers = [
    { id: 'temp_new', name: 'Temperature', description: 'Temperature map' },
    { id: 'precipitation_new', name: 'Precipitation', description: 'Precipitation map' },
    { id: 'pressure_new', name: 'Pressure', description: 'Pressure map' },
    { id: 'wind_new', name: 'Wind', description: 'Wind speed map' },
    { id: 'clouds_new', name: 'Clouds', description: 'Cloud coverage map' }
  ];

  const getMapUrl = (layer) => {
    const zoom = 10;
    const x = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    
    return `https://tile.openweathermap.org/map/${layer}/${zoom}/${x}/${y}.png?appid=${API_KEY}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMaps(!showMaps)}
        className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
        title="Weather Maps"
      >
        <Map className="h-5 w-5" />
      </button>

      {showMaps && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 text-white max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold">Weather Maps</h3>
              <button
                onClick={() => setShowMaps(false)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Layer Selection */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-5 w-5" />
                <span className="font-medium">Map Layer:</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {mapLayers.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => setSelectedLayer(layer.id)}
                    className={`p-3 rounded-lg text-sm transition-colors ${
                      selectedLayer === layer.id
                        ? 'bg-white/30 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {layer.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Map Display */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-center mb-4">
                <h4 className="text-lg font-medium">
                  {mapLayers.find(l => l.id === selectedLayer)?.name} Map
                </h4>
                <p className="text-sm opacity-70">
                  {weather.name}, {weather.sys.country}
                </p>
              </div>
              
              {API_KEY ? (
                <div className="relative">
                  <img
                    src={getMapUrl(selectedLayer)}
                    alt={`${selectedLayer} map`}
                    className="w-full h-64 md:h-96 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1hcCBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    Zoom: 10x
                  </div>
                </div>
              ) : (
                <div className="bg-gray-200 h-64 md:h-96 rounded-lg flex items-center justify-center">
                  <div className="text-gray-600 text-center">
                    <Map className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>API key required for weather maps</p>
                  </div>
                </div>
              )}
            </div>

            {/* Map Legend */}
            <div className="mt-4 text-sm opacity-70">
              <p>
                <strong>Note:</strong> Weather maps show real-time data for the selected location.
                Different layers provide various meteorological information.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherMaps;