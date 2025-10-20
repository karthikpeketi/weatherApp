import { useState, useEffect } from 'react';
import { Heart, X, MapPin } from 'lucide-react';
import { getFromLocalStorage, saveToLocalStorage } from '../utils/weatherUtils';
import ReusablePopup from './ReusablePopup';

const FavoriteLocations = ({ currentLocation, onLocationSelect, getModalPosition, showListOnHover = false }) => {
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Handle hover only for the MapPin button
  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);

  useEffect(() => {
    if (showListOnHover && !showFavorites) {
      setShowFavorites(hovered);
    }
  }, [hovered, showListOnHover, showFavorites]);

  useEffect(() => {
    const savedFavorites = getFromLocalStorage('favoriteLocations') || [];
    setFavorites(savedFavorites);
  }, []);

  // Add the current location as a favorite
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

  // Remove a favorite by id
  const removeFromFavorites = (id) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== id);
    setFavorites(updatedFavorites);
    saveToLocalStorage('favoriteLocations', updatedFavorites);
  };

  // Determine if the current location is already a favorite
  const isCurrentLocationFavorite = () => {
    if (!currentLocation) return false;
    return favorites.some(
      fav => fav.lat === currentLocation.coord.lat && fav.lon === currentLocation.coord.lon
    );
  };

  // Toggle the current location in / out of favorites
  const toggleFavorite = () => {
    if (!currentLocation) return;
    if (isCurrentLocationFavorite()) {
      const fav = favorites.find(
        f => f.lat === currentLocation.coord.lat && f.lon === currentLocation.coord.lon
      );
      if (fav) removeFromFavorites(fav.id);
    } else {
      addToFavorites();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Add to Favorites Button */}
      {currentLocation && (
        <button
          onClick={toggleFavorite}
          className={`p-2 rounded-full backdrop-blur-md transition-colors ${isCurrentLocationFavorite()
              ? 'bg-red-500/30 text-red-300'
              : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          title={isCurrentLocationFavorite() ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`h-5 w-5 ${isCurrentLocationFavorite() ? 'fill-current' : ''}`} />
        </button>
      )}

      {/* Show Favorites Button */}
      <button
        onMouseEnter={showListOnHover ? handleMouseEnter : undefined}
        onMouseLeave={showListOnHover ? handleMouseLeave : undefined}
        onClick={() => setShowFavorites(!showFavorites)}
        className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors"
        title="View favorite locations"
      >
        <MapPin className="h-5 w-5" />
        {favorites.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {favorites.length}
          </span>
        )}
      </button>

      {/* Favorites Modal */}
      <ReusablePopup
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
        title="Favorite Locations"
        titleIcon={<MapPin className="h-6 w-6" />}
        maxWidth="530px"
        maxHeight="80vh"
      >
        {favorites.length === 0 ? (
          <div className="text-center py-8 opacity-70">
            <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>No favorite locations yet</p>
            <p className="text-sm mt-2">Add locations to your favorites to access them quickly</p>
          </div>
        ) : (
          <div className="space-y-2">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-md rounded-lg hover:bg-white/10 transition-colors"
              >
                <button
                  onClick={() => {
                    onLocationSelect(favorite.lat, favorite.lon);
                    setShowFavorites(false);
                  }}
                  className="flex-1 text-left"
                >
                  <div className="text-white font-medium">
                    {favorite.name}
                  </div>
                  <div className="text-white/70 text-sm">
                    {favorite.country}
                  </div>
                </button>

                <button
                  onClick={() => removeFromFavorites(favorite.id)}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors ml-2"
                  title="Remove from favorites"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </ReusablePopup>
    </div>
  );
};

export default FavoriteLocations;