import axios from 'axios';

// Replace this with your actual OpenWeatherMap API key
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

if (!API_KEY) {
  console.error('OpenWeatherMap API key is missing. Please set VITE_OPENWEATHER_API_KEY in your environment variables.');
}

const BASE_URL = 'https://api.openweathermap.org';

const handleApiError = (error, endpoint) => {
  if (error.response) {
    console.error(`Error ${endpoint}:`, error.response.status, error.response.data.message);
    if (error.response.status === 401) {
      console.error('Invalid API key. Please check your OpenWeatherMap API key configuration.');
    }
  } else {
    console.error(`Error ${endpoint}:`, error.message);
  }
  return null;
};

export const searchLocations = async (query) => {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
    );
    const data = await response.json();
    return data; // Return the API response data
  } catch (error) {
    console.error('An unexpected error occurred while fetching locations');
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
    return handleApiError(error, 'fetching weather');
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
    return handleApiError(error, 'fetching forecast');
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
    return handleApiError(error, 'fetching air quality');
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
    return handleApiError(error, 'fetching UV index');
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
    return handleApiError(error, 'fetching weather alerts');
  }
};