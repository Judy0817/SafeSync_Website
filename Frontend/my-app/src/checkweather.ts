import axios from 'axios';

const OPENWEATHER_API_KEY = '2601fcbe1411562dc72d4050e299d2c7'; // Replace with your OpenWeather API key
const STREET_NAME = 'Street A'; // Replace with a street name you want to test

// Function to fetch weather data for a specific street (hardcoded street name)
async function checkWeatherData() {
  try {
    // Make the API request to OpenWeather
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${STREET_NAME}&appid=${OPENWEATHER_API_KEY}&units=imperial`);
    
    // If the request is successful, print the weather data
    const data = response.data;
    console.log(`Weather data for ${STREET_NAME}:`);
    console.log('Condition:', data.weather[0].description);
    console.log('Temperature:', data.main.temp, '°F');
    console.log('Humidity:', data.main.humidity, '%');
    console.log('Wind Speed:', data.wind.speed, 'mph');
    console.log('Pressure:', data.main.pressure, 'hPa');
    console.log('Visibility:', data.visibility / 1609, 'miles'); // Convert visibility from meters to miles
    
  } catch (error) {
    // If there’s an error (like invalid API key or incorrect street name), log it
    console.error('Error fetching weather data:', error);
  }
}

// Call the function to check the weather data
checkWeatherData();
