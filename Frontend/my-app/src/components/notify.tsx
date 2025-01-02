import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'; // Importing Font Awesome icons


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
  <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
    <h2 style={{ textAlign: 'center', color: '#004085', marginBottom: '20px' }}>
      Street Weather and Road Features Information
    </h2>

    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
      <input
        type="text"
        placeholder="Enter street name"
        value={streetName}
        onChange={(e) => setStreetName(e.target.value)}
        style={{ padding: '10px', flex: 1, border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}
      />
      <button
        type="submit"
        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Get Weather Data
      </button>
    </form>

    {filteredStreetNames.length > 0 && (
      <ul style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', listStyle: 'none', marginTop: '10px' }}>
        {filteredStreetNames.map((street, index) => (
          <li
            key={index}
            onClick={() => {
              setStreetName(street);
              setFilteredStreetNames([]);
              fetchGeolocation(street);
            }}
            style={{ cursor: 'pointer', padding: '10px', backgroundColor: '#f1f1f1', margin: '5px 0', borderRadius: '4px', transition: 'background-color 0.3s' }}
          >
            {street}
          </li>
        ))}
      </ul>
    )}

    {errorMessage && <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>}

    {weatherDataModel ? (
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ textAlign: 'center', color: '#28a745', marginBottom: '20px' }}>
          Weather and Road Features for {streetName}
        </h3>

        {predictedSeverity !== null && (
          <div style={{ marginTop: '20px', textAlign: 'center', color: weatherDataModel.severity > 2 ? 'red' : 'green' }}>
            <h3>
              Severity: {predictedSeverity}
              {predictedSeverity > 2 ? (
                <FaExclamationTriangle style={{ color: 'red', marginLeft: '10px' }} />
              ) : (
                <FaCheckCircle style={{ color: 'green', marginLeft: '10px' }} />
              )}
            </h3>
          </div>
        )}

        {/* Weather Cards */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          {[
            { title: 'Condition', value: weatherDataModel.condition },
            { title: 'Temperature', value: `${weatherDataModel.temperature}°F` },
            { title: 'Humidity', value: `${weatherDataModel.humidity}%` },
            { title: 'Wind Chill', value: `${weatherDataModel.windChill}°F` },
            { title: 'Pressure', value: `${weatherDataModel.pressure} in` },
            { title: 'Visibility', value: `${weatherDataModel.visibility} mi` },
            { title: 'Wind Direction', value: weatherDataModel.windDirection },
            { title: 'Wind Speed', value: `${weatherDataModel.windSpeed} mph` },
            { title: 'Precipitation', value: `${weatherDataModel.precipitation} in` }
          ].map((weather, index) => (
            <div key={index} style={{ flex: '0 0 30%', marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <h4 style={{ color: '#007bff', marginBottom: '10px' }}>{weather.title}</h4>
              <p>{weather.value}</p>
            </div>
          ))}
        </div>

        {/* Road Feature Cards */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between' }}>
          {Object.entries(weatherDataModel.roadFeatures).map(([feature, isEnabled], index) => (
            <div key={index} style={{ flex: '0 0 30%', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
              <h4 style={{ color: '#007bff', marginBottom: '10px' }}>{feature.replace('_', ' ').toUpperCase()}</h4>
              <p>{isEnabled ? <span style={{ color: 'green' }}>✅</span> : <span style={{ color: 'red' }}>❌</span>}</p>
            </div>
          ))}
        </div>

        {/* Severity */}

      </div>
    ) : (
      <p style={{ textAlign: 'center', color: '#888' }}>No data available. Please search for a street name.</p>
    )}
  </div>
);

  
  
};

export default AlertSystem;
