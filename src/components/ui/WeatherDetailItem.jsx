const WeatherDetailItem = ({ 
  icon: Icon, 
  label, 
  value, 
  className = '' 
}) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-white/80" />
        <span className="text-white/90">{label}</span>
      </div>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
};

export default WeatherDetailItem;