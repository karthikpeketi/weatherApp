import { Wind, AlertCircle } from 'lucide-react';
import { getAirQualityLevel } from '../utils/weatherUtils';

const AirQualityCard = ({ airQuality }) => {
  if (!airQuality || !airQuality.list || airQuality.list.length === 0) {
    return null;
  }

  const data = airQuality.list[0];
  const aqi = data.main.aqi;
  const components = data.components;
  
  const aqiLevel = getAirQualityLevel(aqi * 50); // Convert to US AQI scale approximation

  const pollutants = [
    { name: 'CO', value: components.co, unit: 'μg/m³', label: 'Carbon Monoxide' },
    { name: 'NO₂', value: components.no2, unit: 'μg/m³', label: 'Nitrogen Dioxide' },
    { name: 'O₃', value: components.o3, unit: 'μg/m³', label: 'Ozone' },
    { name: 'SO₂', value: components.so2, unit: 'μg/m³', label: 'Sulfur Dioxide' },
    { name: 'PM2.5', value: components.pm2_5, unit: 'μg/m³', label: 'Fine Particles' },
    { name: 'PM10', value: components.pm10, unit: 'μg/m³', label: 'Coarse Particles' }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Wind className="h-6 w-6" />
        <h3 className="text-xl font-semibold">Air Quality</h3>
      </div>

      {/* AQI Level */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold mb-2">
          {aqi}
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${aqiLevel.bg} ${aqiLevel.color}`}>
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">{aqiLevel.level}</span>
        </div>
      </div>

      {/* Pollutants Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {pollutants.map((pollutant) => (
          <div key={pollutant.name} className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-sm opacity-70 mb-1">{pollutant.name}</div>
            <div className="font-semibold text-lg">
              {pollutant.value ? pollutant.value.toFixed(1) : 'N/A'}
            </div>
            <div className="text-xs opacity-60">{pollutant.unit}</div>
          </div>
        ))}
      </div>

      {/* Health Recommendations */}
      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <h4 className="font-medium mb-2">Health Recommendations</h4>
        <p className="text-sm opacity-80">
          {aqi <= 2 && "Air quality is good. Perfect for outdoor activities."}
          {aqi === 3 && "Air quality is moderate. Sensitive individuals should consider limiting outdoor activities."}
          {aqi === 4 && "Air quality is poor. Everyone should limit outdoor activities."}
          {aqi === 5 && "Air quality is very poor. Avoid outdoor activities."}
        </p>
      </div>
    </div>
  );
};

export default AirQualityCard;