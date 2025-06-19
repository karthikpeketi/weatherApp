import { AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';

const WeatherAlerts = ({ alerts }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  if (!alerts || alerts.length === 0) return null;

  const activeAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.start));

  const dismissAlert = (alertStart) => {
    setDismissedAlerts(prev => new Set([...prev, alertStart]));
  };

  const getAlertIcon = (event) => {
    const severityIcons = {
      'severe': AlertTriangle,
      'moderate': Info,
      'minor': Info
    };
    return severityIcons[event.toLowerCase()] || Info;
  };

  const getAlertColor = (severity) => {
    const colors = {
      'severe': 'bg-red-500/20 border-red-500 text-red-100',
      'moderate': 'bg-yellow-500/20 border-yellow-500 text-yellow-100',
      'minor': 'bg-blue-500/20 border-blue-500 text-blue-100'
    };
    return colors[severity] || 'bg-blue-500/20 border-blue-500 text-blue-100';
  };

  if (activeAlerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {activeAlerts.map((alert, index) => {
        const Icon = getAlertIcon(alert.event);
        const alertColor = getAlertColor(alert.severity || 'moderate');
        
        return (
          <div 
            key={`${alert.start}-${index}`}
            className={`${alertColor} border-l-4 p-4 rounded-lg backdrop-blur-md relative`}
          >
            <button
              onClick={() => dismissAlert(alert.start)}
              className="absolute top-2 right-2 opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="flex items-start gap-3 pr-8">
              <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm mb-1">
                  {alert.event || 'Weather Alert'}
                </h4>
                <p className="text-sm opacity-90 mb-2">
                  {alert.description}
                </p>
                <div className="text-xs opacity-70">
                  {alert.sender_name && (
                    <span>From: {alert.sender_name} • </span>
                  )}
                  <span>
                    {new Date(alert.start * 1000).toLocaleString()} - {' '}
                    {new Date(alert.end * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeatherAlerts;