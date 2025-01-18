export interface Location {
  name: string;
  display_name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface WeatherData {
  weather: {
    id: number;
    main: string;
    description: string;
  }[];
  main: {
    temp: number;
    temp_max: number;
    temp_min: number;
    humidity: number;
  };
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
  };
  name: string;
  sys: {
    country: string;
  };
}

// Weather condition backgrounds mapping
export const weatherBackgrounds: Record<string, string> = {
  // Clear
  Clear: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&q=80',
  // Clouds
  Clouds: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&q=80',
  // Rain
  Rain: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&q=80',
  // Thunderstorm
  Thunderstorm: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&q=80',
  // Snow
  Snow: 'https://images.unsplash.com/photo-1478265409131-1f65c88f965c?auto=format&fit=crop&q=80',
  // Mist/Fog
  Mist: 'https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?auto=format&fit=crop&q=80',
  Fog: 'https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?auto=format&fit=crop&q=80',
  // Default
  default: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&q=80'
};