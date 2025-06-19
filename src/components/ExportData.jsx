import { Download } from 'lucide-react';
import { exportWeatherData } from '../utils/weatherUtils';

const ExportData = ({ weather, forecast }) => {
  const handleExport = () => {
    if (!weather) {
      alert('No weather data to export');
      return;
    }
    
    exportWeatherData(weather, forecast);
  };

  return (
    <button
      onClick={handleExport}
      disabled={!weather}
      className={`p-2 rounded-full backdrop-blur-md transition-colors ${
        weather 
          ? 'bg-white/20 text-white hover:bg-white/30' 
          : 'bg-white/10 text-white/50 cursor-not-allowed'
      }`}
      title="Export weather data"
    >
      <Download className="h-5 w-5" />
    </button>
  );
};

export default ExportData;