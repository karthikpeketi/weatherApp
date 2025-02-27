import axios from 'axios';
import { Location, WeatherData } from './types';

// Replace this with your actual OpenWeatherMap API key
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org';

export const searchLocations = async (query: string): Promise<Location[]> => {
  if (!query.trim()) return [];
  
  if (!API_KEY) {
    console.error('OpenWeatherMap API key is not configured');
    return [];
  }
  
  try {
    // const response = await axios.get(
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
    );
    const data = await response.json();
    return data; // Return the API response data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching locations:', error.message);
    } else {
      console.error('An unexpected error occurred while fetching locations');
    }
    return []; // Return an empty array in case of an error
  }
  
};

export const getWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
  if (!API_KEY) {
    console.error('OpenWeatherMap API key is not configured');
    return null;
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching weather:', error.message);
    } else {
      console.error('Error fetching weather');
    }
    return null;
  }
};