import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2, Globe, Building2, Home, TreePine, Map, Flag, MapPinned } from 'lucide-react';
import { searchLocations } from '../api';

const LocationSuggestions = ({
  placeholder = "Search Location...",
  onLocationSelect,
  onQueryChange,
  initialQuery = "",
  maxResults = 8,
  showIcon = true,
  showClearButton = true,
  className = "",
  inputClassName = "",
  suggestionsClassName = "",
  disabled = false,
  autoFocus = false,
  debounceMs = 300,
  showFilters = true
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [locations, setLocations] = useState([]);
  const [allLocations, setAllLocations] = useState([]); // Store all results for filtering
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLocationSelected, setIsLocationSelected] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Debounced search effect
  useEffect(() => {
    const fetchLocations = async () => {
      if (query.length >= 2 && !isLocationSelected) {
        setLoading(true);
        try {
          const results = await searchLocations(query);
          setAllLocations(results); // Store all results
          const limitedResults = results.slice(0, maxResults);
          setLocations(limitedResults);
          setShowSuggestions(limitedResults.length > 0);
          setActiveFilter('all'); // Reset filter when new search
        } catch (error) {
          console.error('Error searching locations:', error);
          setAllLocations([]);
          setLocations([]);
          setShowSuggestions(false);
        } finally {
          setLoading(false);
        }
      } else {
        setAllLocations([]);
        setLocations([]);
        setShowSuggestions(false);
        setLoading(false);
        setActiveFilter('all');
      }
    };

    const timeoutId = setTimeout(fetchLocations, debounceMs);
    return () => clearTimeout(timeoutId);
  }, [query, isLocationSelected, maxResults, debounceMs]);

  // Notify parent of query changes
  useEffect(() => {
    if (onQueryChange) {
      onQueryChange(query);
    }
  }, [query, onQueryChange]);

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsLocationSelected(false);
  };

  const handleLocationSelect = (location) => {
    setQuery(location.display_name);
    setIsLocationSelected(true);
    setShowSuggestions(false);
    
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const handleClear = () => {
    setQuery("");
    setIsLocationSelected(false);
    setShowSuggestions(false);
    setLocations([]);
    setAllLocations([]);
    setActiveFilter('all');
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (onQueryChange) {
      onQueryChange("");
    }
  };

  const handleInputFocus = () => {
    if (query.length >= 2 && locations.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Format location display name for better readability
  const formatLocationName = (displayName) => {
    const parts = displayName.split(',');
    if (parts.length > 3) {
      // Show first part (city/place) and last 2 parts (state/province, country)
      return `${parts[0]}, ${parts[1]}, ${parts.slice(-2).join(', ')}`;
    }
    return displayName;
  };

  // Extract location type from display name or class
  const getLocationType = (location) => {
    const type = location.type || location.class || '';
    const displayName = location.display_name.toLowerCase();
    
    if (type === 'city' || displayName.includes('city')) return 'City';
    if (type === 'town' || displayName.includes('town')) return 'Town';
    if (type === 'village' || displayName.includes('village')) return 'Village';
    if (type === 'state' || type === 'administrative') return 'Region';
    if (type === 'country') return 'Country';
    return 'Place';
  };

  // Filter locations based on active filter
  const filterLocations = (locations, filter) => {
    if (filter === 'all') return locations;
    
    return locations.filter(location => {
      const locationType = getLocationType(location).toLowerCase();
      return locationType === filter.toLowerCase();
    });
  };

  // Get available filter types from current results
  const getAvailableFilters = () => {
    const types = new Set();
    allLocations.forEach(location => {
      types.add(getLocationType(location).toLowerCase());
    });
    return Array.from(types);
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    const filtered = filterLocations(allLocations, filter);
    const limitedResults = filtered.slice(0, maxResults);
    setLocations(limitedResults);
  };

  // Filter options with icons
  const filterOptions = [
    { key: 'all', label: 'All', icon: Globe },
    { key: 'city', label: 'Cities', icon: Building2 },
    { key: 'town', label: 'Towns', icon: Home },
    { key: 'village', label: 'Villages', icon: TreePine },
    { key: 'region', label: 'Regions', icon: Map },
    { key: 'country', label: 'Countries', icon: Flag },
    { key: 'place', label: 'Places', icon: MapPinned }
  ];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`w-full bg-white/20 backdrop-blur-md text-white placeholder-white/70 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 transition-all ${
            showIcon ? 'pl-12' : ''
          } ${
            showClearButton || loading ? 'pr-12' : ''
          } ${inputClassName}`}
        />
        
        {/* Search Icon */}
        {showIcon && (
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-white/70" />
        )}
        
        {/* Loading or Clear Button */}
        <div className="absolute right-3 top-3.5">
          {loading ? (
            <Loader2 className="h-5 w-5 text-white/70 animate-spin" />
          ) : showClearButton && query && (
            <button
              onClick={handleClear}
              className="text-white/70 hover:text-white transition-colors"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && allLocations.length > 0 && (
        <div className={`absolute mt-2 w-full bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20 overflow-hidden z-50 ${suggestionsClassName}`}>
          {/* Filter Buttons */}
          {showFilters && allLocations.length > 0 && (
            <div className="px-4 py-3 border-b border-white/20 bg-gray-50/80">
              <div className="flex flex-wrap gap-2">
                {filterOptions.map(option => {
                  const availableTypes = getAvailableFilters();
                  const isAvailable = option.key === 'all' || availableTypes.includes(option.key);
                  const isActive = activeFilter === option.key;
                  
                  if (!isAvailable) return null;
                  
                  return (
                    <button
                      key={option.key}
                      onClick={() => handleFilterChange(option.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                        isActive
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-sm'
                      }`}
                      type="button"
                    >
                      <option.icon className="h-3 w-3" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="max-h-80 overflow-y-auto">
            {locations.map((location, index) => (
              <button
                key={`${location.lat}-${location.lon}-${index}`}
                onClick={() => handleLocationSelect(location)}
                className="w-full px-4 py-3 text-left hover:bg-white/60 transition-colors border-b border-white/10 last:border-0 focus:outline-none focus:bg-white/60"
                type="button"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-600 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 font-medium text-sm leading-tight">
                      {formatLocationName(location.display_name)}
                    </div>
                    <div className="text-gray-600 text-xs mt-1 flex items-center gap-2">
                      <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs">
                        {getLocationType(location)}
                      </span>
                      {location.lat && location.lon && (
                        <span className="text-gray-500">
                          {parseFloat(location.lat).toFixed(2)}, {parseFloat(location.lon).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Footer with result count */}
          <div className="px-4 py-2 bg-gray-100/80 border-t border-white/20">
            <div className="text-xs text-gray-600 text-center">
              {activeFilter === 'all' 
                ? `${locations.length} location${locations.length !== 1 ? 's' : ''} found`
                : `${locations.length} ${activeFilter}${locations.length !== 1 ? 's' : ''} found`
              }
              {locations.length === maxResults && ` (showing first ${maxResults})`}
              {activeFilter !== 'all' && allLocations.length > 0 && (
                <span className="text-gray-500"> • {allLocations.length} total results</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !loading && query.length >= 2 && allLocations.length === 0 && (
        <div className={`absolute mt-2 w-full bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20 p-4 z-50 ${suggestionsClassName}`}>
          <div className="text-center text-gray-600">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No locations found for "{query}"</p>
            <p className="text-xs text-gray-500 mt-1">Try a different search term</p>
          </div>
        </div>
      )}

      {/* No filtered results message */}
      {showSuggestions && !loading && allLocations.length > 0 && locations.length === 0 && activeFilter !== 'all' && (
        <div className={`absolute mt-2 w-full bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20 overflow-hidden z-50 ${suggestionsClassName}`}>
          {/* Show filter buttons */}
          {showFilters && (
            <div className="px-4 py-3 border-b border-white/20 bg-gray-50/80">
              <div className="flex flex-wrap gap-2">
                {filterOptions.map(option => {
                  const availableTypes = getAvailableFilters();
                  const isAvailable = option.key === 'all' || availableTypes.includes(option.key);
                  const isActive = activeFilter === option.key;
                  
                  if (!isAvailable) return null;
                  
                  return (
                    <button
                      key={option.key}
                      onClick={() => handleFilterChange(option.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                        isActive
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-sm'
                      }`}
                      type="button"
                    >
                      <option.icon className="h-3 w-3" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="p-4 text-center text-gray-600">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No {activeFilter}s found for "{query}"</p>
            <p className="text-xs text-gray-500 mt-1">Try selecting a different filter or search term</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSuggestions;