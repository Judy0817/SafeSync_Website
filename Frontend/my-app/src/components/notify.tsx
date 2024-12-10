import React, { useState, useEffect } from 'react';

interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  windChill: number;
  pressure: number;
  visibility: number;
  windDirection: string;
  windSpeed: number;
  precipitation: number;
}

const AlertSystem = () => {
  const [streetName, setStreetName] = useState(''); // Street name entered by the user
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null); // Weather data for the selected street
  const [severity, setSeverity] = useState<number | null>(null); // Severity predicted by the model
  const [errorMessage, setErrorMessage] = useState(''); // Error message

  // Function to fetch the geolocation (latitude and longitude) based on the street name
  const fetchGeolocation = async (streetName: string) => {
    try {
      const response = await fetch(`http://localhost:8080/weather/geolocation?street_name=${streetName}`);
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        // If latitude and longitude are returned, fetch the weather data
        fetchWeatherData(data.latitude, data.longitude);
      } else {
        setErrorMessage('No geolocation data found for this street.');
      }
    } catch (error) {
      console.error('Error fetching geolocation:', error);
      setErrorMessage('Error fetching geolocation data.');
    }
  };

  // Function to fetch weather data using the latitude and longitude
  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(`http://localhost:8080/weather/weather_data?latitude=${latitude}&longitude=${longitude}`);
      const data = await response.json();
      console.log('Fetched weather data:', data);  // Log the raw data

      // Ensure that the data fields are properly parsed and converted to numbers where needed
      setWeatherData({
        condition: data.weather || 'N/A', // Ensure fallback if data.weather is undefined
        temperature: parseFloat(data["temperature(F)"]) || 0, // Ensure parsing the value as number
        humidity: parseFloat(data["humidity(%)"]) || 0, // Ensure parsing as number
        windChill: parseFloat(data["wind_chill(F)"]) || 0, // Ensure parsing as number
        pressure: parseFloat(data["pressure(in)"]) || 0, // Ensure parsing as number
        visibility: parseFloat(data["visibility(mi)"]) || 0, // Ensure parsing as number
        windDirection: data.wind_direction || 'N/A', // Ensure fallback if wind_direction is missing
        windSpeed: parseFloat(data["wind_speed(mph)"]) || 0, // Ensure parsing as number
        precipitation: parseFloat(data["precipitation(in)"]) || 0, // Ensure parsing as number
      });

      // Simulate severity prediction (for testing)
      const predictedSeverity = 3.5; // Hardcoded for now. Replace with actual model prediction.
      setSeverity(predictedSeverity);

      setErrorMessage(''); // Reset any previous error message
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setErrorMessage('Error fetching weather data.');
    }
  };

  // Handle the search form submit
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (streetName.trim() === '') {
      setErrorMessage('Please enter a street name.');
      return;
    }
    fetchGeolocation(streetName); // Fetch the geolocation based on the street name
  };

  // Function to determine the severity color
  const getSeverityColor = (severity: number | null) => {
    if (severity === null) return 'black'; // Default color if severity is not available
    return severity > 3.0 ? 'red' : 'green';
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Street Weather Information</h2>

      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Enter street name"
          value={streetName}
          onChange={(e) => setStreetName(e.target.value)}
          style={{ padding: '8px', flex: 1}}
        />
        <button type="submit" style={{ padding: '8px', width: '150px' }}>
          Get Weather Data
        </button>
      </form>

      {/* Error Message */}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {/* Display Weather Data */}
      {weatherData ? (
        <div style={{ marginTop: '20px' }}>
          <h3>Weather for {streetName}</h3>
          <ul>
            <li>Weather Condition: {weatherData.condition}</li>
            <li>Temperature: {weatherData.temperature.toFixed(2)} °F</li>
            <li>Humidity: {weatherData.humidity}%</li>
            <li>Wind Chill: {weatherData.windChill.toFixed(2)} °F</li>
            <li>Pressure: {weatherData.pressure} in</li>
            <li>Visibility: {weatherData.visibility} mi</li>
            <li>Wind Direction: {weatherData.windDirection}</li>
            <li>Wind Speed: {weatherData.windSpeed} mph</li>
            <li>Precipitation: {weatherData.precipitation} in</li>
          </ul>

          {/* Display Severity */}
          {severity !== null && (
            <div style={{ color: getSeverityColor(severity) }}>
              <h4>Predicted Severity: {severity.toFixed(2)}</h4>
            </div>
          )}
        </div>
      ) : (
        <p></p>
      )}
    </div>
  );
};

export default AlertSystem;
