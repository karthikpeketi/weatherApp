import { Thermometer } from 'lucide-react';

const UnitToggle = ({ unit, onUnitChange }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-white/20 backdrop-blur-md rounded-full p-1 flex">
        <button
          onClick={() => onUnitChange('celsius')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            unit === 'celsius'
              ? 'bg-white text-gray-800'
              : 'text-white hover:bg-white/20'
          }`}
        >
          °C
        </button>
        <button
          onClick={() => onUnitChange('fahrenheit')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            unit === 'fahrenheit'
              ? 'bg-white text-gray-800'
              : 'text-white hover:bg-white/20'
          }`}
        >
          °F
        </button>
      </div>
    </div>
  );
};

export default UnitToggle;