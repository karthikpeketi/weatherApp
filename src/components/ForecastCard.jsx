import { formatDate, formatTime, getWeatherIcon } from '../utils/weatherUtils';
import { Card, CardHeader, CardContent, CardTitle } from './ui';

const ForecastCard = ({ forecast, isHourly = false }) => {
  if (!forecast) return null;

  const groupForecastByDay = (list) => {
    const grouped = {};
    list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return Object.values(grouped).slice(0, 5);
  };

  const getHourlyForecast = (list) => {
    return list.slice(0, 24);
  };

  const dailyForecasts = isHourly ? getHourlyForecast(forecast.list) : groupForecastByDay(forecast.list);

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle>
          {isHourly ? '24-Hour Forecast' : '5-Day Forecast'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className={`grid gap-4 ${isHourly ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5'}`}>
          {isHourly ? (
            dailyForecasts.map((item, index) => (
              <div key={index} className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-sm opacity-70 mb-2">
                  {formatTime(item.dt)}
                </div>
                <img 
                  src={getWeatherIcon(item.weather[0].icon)} 
                  alt={item.weather[0].description}
                  className="w-12 h-12 mx-auto mb-2"
                />
                <div className="font-semibold">
                  {Math.round(item.main.temp)}°
                </div>
                <div className="text-xs opacity-70 mt-1">
                  {item.weather[0].main}
                </div>
              </div>
            ))
          ) : (
            dailyForecasts.map((dayGroup, index) => {
              const dayItem = dayGroup[0];
              const maxTemp = Math.max(...dayGroup.map(item => item.main.temp_max));
              const minTemp = Math.min(...dayGroup.map(item => item.main.temp_min));
              
              return (
                <div key={index} className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="text-sm opacity-70 mb-2">
                    {formatDate(dayItem.dt)}
                  </div>
                  <img 
                    src={getWeatherIcon(dayItem.weather[0].icon)} 
                    alt={dayItem.weather[0].description}
                    className="w-16 h-16 mx-auto mb-2"
                  />
                  <div className="font-semibold mb-1">
                    {Math.round(maxTemp)}° / {Math.round(minTemp)}°
                  </div>
                  <div className="text-xs opacity-70">
                    {dayItem.weather[0].main}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastCard;