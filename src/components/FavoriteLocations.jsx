import { useState, useEffect } from 'react';
import { Heart, X, MapPin } from 'lucide-react';
import { getFromLocalStorage, saveToLocalStorage } from '../utils/weatherUtils';

const FavoriteLocations = ({ currentLocation, onLocationSelect }) => {
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    const savedFavorites = getFromLocalStorage('favoriteLocations') || [];
    setFavorites(savedFavorites);
  }, []);

  const addToFavorites = () => {
    if (!currentLocation) return;
    
    const newFavorite = {
      id: Date.now(),
      name: currentLocation.name,
      country: currentLocation.sys.country,
      lat: currentLocation.coord.lat,
      lon: currentLocation.coord.lon,
      addedAt: new Date().toISOString()
    };

    const isAlreadyFavorite = favorites.some(
      fav => fav.lat === newFavorite.lat && fav.lon === newFavorite.lon
    );

    if (!isAlreadyFavorite) {
      const updatedFavorites = [...favorites, newFavorite];
      setFavorites(updatedFavorites);
      saveToLocalStorage('favoriteLocations', updatedFavorites);
    }
  };

  const removeFromFavorites = (id) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== id);
    setFavorites(updatedFavorites);
    saveToLocalStorage('favoriteLocations', updatedFavorites);
  };

  const isCurrentLocationFavorite = () => {
    if (!currentLocation) return false;
    return favorites.some(
      fav => fav.lat === currentLocation.coord.lat && fav.lon === currentLocation.coord.lon
    );
  };

  return (
    <div className="relative">
      {/* Add to Favorites Button */}
      {currentLocation && (
        <button
          onClick={addToFavorites}
          disabled={isCurrentLocationFavorite()}
          className={`p-2 rounded-full backdrop-blur-md transition-colors ${
            isCurrentLocationFavorite() 
              ? 'bg-red-500/30 text-red-300' 
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
          title={isCurrentLocationFavorite() ? 'Already in favorites' : 'Add to favorites'}
        >
          <Heart className={`h-5 w-5 ${isCurrentLocationFavorite() ? 'fill-current' : ''}`} />
        </button>
      )}

      {/* Show Favorites Button */}
      <button
        onClick={() => setShowFavorites(!showFavorites)}
        className="ml-2 p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
        title="View favorite locations"
      >
        <MapPin className="h-5 w-5" />
        {favorites.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {favorites.length}
          </span>
        )}
      </button>

      {/* Favorites Dropdown */}
      {showFavorites && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white/90 backdrop-blur-md rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-white/20">
            <h3 className="text-gray-800 font-semibold">Favorite Locations</h3>
          </div>
          
          {favorites.length === 0 ? (
            <div className="p-4 text-gray-600 text-center">
              No favorite locations yet
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="flex items-center justify-between p-3 hover:bg-white/50 border-b border-white/10 last:border-0"
                >
                  <button
                    onClick={() => {
                      onLocationSelect(favorite.lat, favorite.lon);
                      setShowFavorites(false);
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="text-gray-800 font-medium">
                      {favorite.name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {favorite.country}
                    </div>
                  </button>
                  
                  <button
                    onClick={() => removeFromFavorites(favorite.id)}
                    className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                    title="Remove from favorites"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FavoriteLocations;