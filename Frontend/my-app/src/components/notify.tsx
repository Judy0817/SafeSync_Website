import React, { useState, useEffect } from 'react';

interface RoadFeatures {
  crossings: boolean;
  give_way: boolean;
  junction: boolean;
  no_exit: boolean;
  railway: boolean;
  roundabout: boolean;
  speed_bumps: boolean;
  station: boolean;
  stop: boolean;
  traffic_calming: boolean;
  traffic_signal: boolean;
}

interface WeatherDataModel {
  condition: string;
  temperature: number;
  humidity: number;
  windChill: number;
  pressure: number;
  visibility: number;
  windDirection: string;
  windSpeed: number;
  precipitation: number;
  severity: number;
  roadFeatures: RoadFeatures;
}

const AlertSystem = () => {
  const [streetName, setStreetName] = useState('');
  const [weatherDataModel, setWeatherDataModel] = useState<WeatherDataModel | null>(null);
  const [predictedSeverity, setPredictedSeverity] = useState<number | null>(null); // New state for predicted severity
  const [errorMessage, setErrorMessage] = useState('');
  const [streetNames, setStreetNames] = useState<string[]>([]);
  const [filteredStreetNames, setFilteredStreetNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchStreetNames = async () => {
      try {
        const response = await fetch('http://localhost:8080/json/street_names');
        const data = await response.json();
        setStreetNames(data);
      } catch (error) {
        console.error('Error fetching street names:', error);
        setErrorMessage('Error fetching street names.');
      }
    };

    fetchStreetNames();
  }, []);

  useEffect(() => {
    if (streetName.trim() === '') {
      setFilteredStreetNames([]);
    } else {
      const filtered = streetNames.filter((street) =>
        street.toLowerCase().includes(streetName.toLowerCase())
      );
      setFilteredStreetNames(filtered);
    }
  }, [streetName, streetNames]);

  const fetchGeolocation = async (streetName: string) => {
    try {
      const response = await fetch(`http://localhost:8080/weather/geolocation?street_name=${streetName}`);
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        fetchWeatherData(streetName, data.latitude, data.longitude);
      } else {
        setErrorMessage('No geolocation data found for this street.');
      }
    } catch (error) {
      console.error('Error fetching geolocation:', error);
      setErrorMessage('Error fetching geolocation data.');
    }
  };

  const fetchWeatherData = async (streetName: string, latitude: number, longitude: number) => {
    try {
      const response = await fetch(`http://localhost:8080/json/road_features_with_weather?street_name=${streetName}&latitude=${latitude}&longitude=${longitude}`);
      const data = await response.json();
      console.log('Fetched weather data:', data);

      const weather = data.weather;
      const roadFeatures = data.road_features;

      setWeatherDataModel({
        condition: weather.weather || 'N/A',
        temperature: parseFloat(weather["temperature(F)"]) || 0,
        humidity: parseFloat(weather["humidity(%)"]) || 0,
        windChill: parseFloat(weather["wind_chill(F)"]) || 0,
        pressure: parseFloat(weather["pressure(in)"]) || 0,
        visibility: parseFloat(weather["visibility(mi)"]) || 0,
        windDirection: weather.wind_direction || 'N/A',
        windSpeed: parseFloat(weather["wind_speed(mph)"]) || 0,
        precipitation: parseFloat(weather["precipitation(in)"]) || 0,
        severity: weather.severity || 0,
        roadFeatures: roadFeatures,
      });

      setErrorMessage('');
      fetchPredictedSeverity(weather, roadFeatures);  // Fetch predicted severity based on weather and road features
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setErrorMessage('Error fetching weather data.');
    }
  };

  const fetchPredictedSeverity = async (weather: any, roadFeatures: RoadFeatures) => {
    try {
      const params = new URLSearchParams({
        temperature: weather["temperature(F)"].toString(),
        pressure: weather["pressure(in)"].toString(),
        wind_direction: weather.wind_direction,
        wind_speed: weather["wind_speed(mph)"].toString(),
        weather_condition: weather.weather,
        bumplse: roadFeatures.speed_bumps ? 'true' : 'false',
        junction: roadFeatures.junction ? 'true' : 'false',
        no_exit: roadFeatures.no_exit ? 'true' : 'false',
        railway: roadFeatures.railway ? 'true' : 'false',
        roundabout: roadFeatures.roundabout ? 'true' : 'false',
        station: roadFeatures.station ? 'true' : 'false',
        stop: roadFeatures.stop ? 'true' : 'false',
        traffic_calming: roadFeatures.speed_bumps ? 'true' : 'false', // Assuming 'traffic_calming' is based on speed bumps
        traffic_signal: 'false', // You can update this based on actual data
      });

      const response = await fetch(`http://localhost:8080/json/calculate_severity?${params.toString()}`);
      const data = await response.json();

      if (data.severity) {
        setPredictedSeverity(data.severity);  // Store the predicted severity in state
      } else {
        setPredictedSeverity(null); // No severity returned
      }
    } catch (error) {
      console.error('Error fetching predicted severity:', error);
      setErrorMessage('Error fetching predicted severity.');
    }
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (streetName.trim() === '') {
      setErrorMessage('Please enter a street name.');
      return;
    }
    fetchGeolocation(streetName);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Street Weather and Road Features Information</h2>

      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Enter street name"
          value={streetName}
          onChange={(e) => setStreetName(e.target.value)}
          style={{ padding: '8px', flex: 1 }}
        />
        <button type="submit" style={{ padding: '8px', width: '150px' }}>
          Get Weather Data
        </button>
      </form>

      {filteredStreetNames.length > 0 && (
        <ul style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '5px' }}>
          {filteredStreetNames.map((street, index) => (
            <li
              key={index}
              onClick={() => {
                setStreetName(street);
                setFilteredStreetNames([]);
                fetchGeolocation(street);
              }}
              style={{ cursor: 'pointer', padding: '5px', backgroundColor: '#f9f9f9', margin: '5px 0' }}
            >
              {street}
            </li>
          ))}
        </ul>
      )}

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {weatherDataModel ? (
        <div style={{ marginTop: '20px' }}>
          <h3>Weather and Road Features for {streetName}</h3>
          <ul>
            <li>Weather Condition: {weatherDataModel.condition}</li>
            <li>Temperature: {weatherDataModel.temperature.toFixed(2)} °F</li>
            <li>Humidity: {weatherDataModel.humidity}%</li>
            <li>Wind Chill: {weatherDataModel.windChill.toFixed(2)} °F</li>
            <li>Pressure: {weatherDataModel.pressure} in</li>
            <li>Visibility: {weatherDataModel.visibility} mi</li>
            <li>Wind Direction: {weatherDataModel.windDirection}</li>
            <li>Wind Speed: {weatherDataModel.windSpeed} mph</li>
            <li>Precipitation: {weatherDataModel.precipitation} in</li>
            <li>Severity: {weatherDataModel.severity.toFixed(2)}</li>
          </ul>

          <h4>Road Features:</h4>
          <ul>
            <li>Crossings: {weatherDataModel.roadFeatures.crossings ? 'Yes' : 'No'}</li>
            <li>Give Way: {weatherDataModel.roadFeatures.give_way ? 'Yes' : 'No'}</li>
            <li>Junction: {weatherDataModel.roadFeatures.junction ? 'Yes' : 'No'}</li>
            <li>No Exit: {weatherDataModel.roadFeatures.no_exit ? 'Yes' : 'No'}</li>
            <li>Railway: {weatherDataModel.roadFeatures.railway ? 'Yes' : 'No'}</li>
            <li>Roundabout: {weatherDataModel.roadFeatures.roundabout ? 'Yes' : 'No'}</li>
            <li>Speed Bumps: {weatherDataModel.roadFeatures.speed_bumps ? 'Yes' : 'No'}</li>
            <li>Station: {weatherDataModel.roadFeatures.station ? 'Yes' : 'No'}</li>
            <li>Stop: {weatherDataModel.roadFeatures.stop ? 'Yes' : 'No'}</li>
          </ul>

          {/* Display Predicted Severity */}
          {predictedSeverity !== null ? (
            <div style={{ marginTop: '20px' }}>
              <h4>Predicted Severity: {predictedSeverity}</h4>
              <p style={{ color: predictedSeverity >= 4 ? 'red' : 'green' }}>
                {predictedSeverity >= 4 ? 'High severity risk' : 'Low severity risk'}
              </p>
            </div>
          ) : (
            <p>Loading predicted severity...</p>
          )}
        </div>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default AlertSystem;
