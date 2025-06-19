import { Sun, Cloud, Droplets, Snowflake, Zap, CloudRain, CloudSnow, Eye } from 'lucide-react';

const WeatherIcon = ({ 
  condition, 
  size = 'md', 
  className = '' 
}) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
    xl: 'h-24 w-24',
  };
  
  const iconClasses = `${sizes[size]} ${className}`;
  
  const getIcon = () => {
    switch (condition?.toLowerCase()) {
      case 'clear':
        return <Sun className={iconClasses} />;
      case 'clouds':
        return <Cloud className={iconClasses} />;
      case 'rain':
        return <CloudRain className={iconClasses} />;
      case 'drizzle':
        return <Droplets className={iconClasses} />;
      case 'snow':
        return <CloudSnow className={iconClasses} />;
      case 'thunderstorm':
        return <Zap className={iconClasses} />;
      case 'mist':
      case 'fog':
      case 'haze':
        return <Eye className={iconClasses} />;
      default:
        return <Sun className={iconClasses} />;
    }
  };
  
  return getIcon();
};

export default WeatherIcon;