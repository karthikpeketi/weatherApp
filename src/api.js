import axios from 'axios';

// Replace this with your actual OpenWeatherMap API key
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org';

export const searchLocations = async (query) => {
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

export const getWeather = async (lat, lon) => {
  
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

// Get 5-day weather forecast
export const getForecast = async (lat, lon) => {
  if (!API_KEY) {
    console.error('OpenWeatherMap API key is not configured');
    return null;
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast:', error.message);
    return null;
  }
};

// Get air quality data
export const getAirQuality = async (lat, lon) => {
  if (!API_KEY) {
    console.error('OpenWeatherMap API key is not configured');
    return null;
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching air quality:', error.message);
    return null;
  }
};

// Get UV Index
export const getUVIndex = async (lat, lon) => {
  if (!API_KEY) {
    console.error('OpenWeatherMap API key is not configured');
    return null;
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching UV index:', error.message);
    return null;
  }
};

// Get weather alerts
export const getWeatherAlerts = async (lat, lon) => {
  if (!API_KEY) {
    console.error('OpenWeatherMap API key is not configured');
    return null;
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=${API_KEY}&units=metric`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching weather alerts:', error.message);
    return null;
  }
};