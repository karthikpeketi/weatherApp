import { Sunrise, Sunset, Sun } from 'lucide-react';
import { formatTime } from '../utils/weatherUtils';
import { Card, CardHeader, CardContent, CardTitle } from './ui';

const SunriseSunsetCard = ({ weather, uvIndex }) => {
  if (!weather || !weather.sys) return null;

  const { sunrise, sunset } = weather.sys;
  const currentTime = Date.now() / 1000; // Current time in seconds
  
  const sunriseTime = formatTime(sunrise);
  const sunsetTime = formatTime(sunset);
  
  // Check if current time is between sunrise and sunset
  const isDaytime = currentTime > sunrise && currentTime < sunset;
  // Calculate total length of the day in seconds
  const dayLength = sunset - sunrise;
  // Calculate time elapsed since sunrise, if it's daytime
  const timeElapsed = isDaytime ? currentTime - sunrise : 0;
  // Calculate day progress percentage
  const dayProgress = isDaytime && dayLength > 0 ? (timeElapsed / dayLength) * 100 : 0;

  const getUVLevel = (uv) => {
    if (!uv) return { level: 'N/A', color: 'text-gray-400' };
    if (uv <= 2) return { level: 'Low', color: 'text-green-400' };
    if (uv <= 5) return { level: 'Moderate', color: 'text-yellow-400' };
    if (uv <= 7) return { level: 'High', color: 'text-orange-400' };
    if (uv <= 10) return { level: 'Very High', color: 'text-red-400' };
    return { level: 'Extreme', color: 'text-purple-400' };
  };

  const uvLevel = getUVLevel(uvIndex?.value);

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-6">
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-6 w-6" />
          Sun & UV
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {/* Sunrise & Sunset */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <Sunrise className="h-8 w-8 mx-auto mb-2 text-orange-400" />
            <div className="text-sm opacity-70 mb-1">Sunrise</div>
            <div className="text-lg font-semibold">{sunriseTime}</div>
          </div>
          
          <div className="text-center">
            <Sunset className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <div className="text-sm opacity-70 mb-1">Sunset</div>
            <div className="text-lg font-semibold">{sunsetTime}</div>
          </div>
        </div>

        {/* Day Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm opacity-70 mb-2">
            <span>Day Progress</span>
            <span>{isDaytime ? `${Math.round(dayProgress)}%` : 'Night'}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-400 to-yellow-400 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${dayProgress}%` }}
            ></div>
          </div>
        </div>

        {/* UV Index */}
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-70">UV Index</span>
            <span className={`font-semibold ${uvLevel.color}`}>
              {uvLevel.level}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {uvIndex?.value ? Math.round(uvIndex.value) : 'N/A'}
            </span>
            <div className="text-xs opacity-60 text-right">
              {uvIndex?.value && (
                <>
                  {uvIndex.value <= 2 && "Minimal protection needed"}
                  {uvIndex.value > 2 && uvIndex.value <= 5 && "Wear sunscreen"}
                  {uvIndex.value > 5 && uvIndex.value <= 7 && "Seek shade, wear protection"}
                  {uvIndex.value > 7 && uvIndex.value <= 10 && "Avoid sun exposure"}
                  {uvIndex.value > 10 && "Extreme caution required"}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Day Length */}
        <div className="mt-4 text-center">
          <div className="text-sm opacity-70">Day Length</div>
          <div className="font-semibold">
            {Math.floor(dayLength / 3600)}h {Math.floor((dayLength % 3600) / 60)}m
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SunriseSunsetCard;