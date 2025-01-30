import { Autocomplete, Box, FormControl, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";

interface RoadWeatherData {
  road_features: {
    bump: boolean;
    crossing: boolean;
    give_way: boolean;
    junction: boolean;
    no_exit: boolean;
    railway: boolean;
    roundabout: boolean;
    station: boolean;
    stop: boolean;
    traffic_calming: boolean;
    traffic_signal: boolean;
  };
  weather: {
    humidity: string;
    precipitation: string;
    pressure: string;
    severity: number;
    temperature: string;
    visibility: string;
    weather: string; // Weather condition like "scattered clouds"
    wind_chill: string;
    wind_direction: string;
    wind_speed: string;
  };
}

const RoadWeatherSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering street names
  const [streetNames, setStreetNames] = useState<string[]>([]); // All available street names
  const [selectedStreet, setSelectedStreet] = useState<string>(""); // Selected street name
  const [roadWeatherData, setRoadWeatherData] = useState<RoadWeatherData | null>(null);
  const [error, setError] = useState<string>("");
  const [calculatedSeverity, setCalculatedSeverity] = useState<number | null>(null); // New state for severity

  // Fetch all street names for dropdown suggestions
  useEffect(() => {
    const fetchStreetNames = async () => {
      try {
        const response = await fetch("http://localhost:8080/json/street_names");
        if (!response.ok) {
          throw new Error("Failed to fetch street names");
        }
        const data = await response.json();
        setStreetNames(data);
      } catch (err) {
        console.error("Error fetching street names", err);
      }
    };

    fetchStreetNames();
  }, []);

  const handleSearch = async () => {
    if (!selectedStreet.trim()) {
      setError("Please select or enter a valid street name.");
      return;
    }

    setError(""); // Clear any previous error message
    const [street_name, city_name, county_name] = selectedStreet.toUpperCase().split(",").map((s) => s.trim());

    try {
      const geolocationResponse = await fetch(
        `http://localhost:8080/json/geolocation?street_name=${street_name}&city_name=${city_name}&county_name=${county_name}`
      );
      if (!geolocationResponse.ok) {
        throw new Error("Failed to fetch geolocation data");
      }
      const { latitude, longitude } = await geolocationResponse.json();

      const roadWeatherResponse = await fetch(
        `http://localhost:8080/json/road_features_with_weather?street_name=${street_name}&city_name=${city_name}&county_name=${county_name}&latitude=${latitude}&longitude=${longitude}`
      );
      if (!roadWeatherResponse.ok) {
        throw new Error("Failed to fetch road and weather data");
      }
      const roadWeatherData = await roadWeatherResponse.json();

      // Correctly map the data from the fetched object to the weather object
      setRoadWeatherData({
        road_features: roadWeatherData.road_features,
        weather: {
          humidity: roadWeatherData.weather["humidity(%)"], // Use proper mapping
          precipitation: roadWeatherData.weather["precipitation(in)"],
          pressure: roadWeatherData.weather["pressure(in)"],
          severity: roadWeatherData.weather["severity"],
          temperature: roadWeatherData.weather["temperature(F)"], // Correct mapping
          visibility: roadWeatherData.weather["visibility(mi)"],
          weather: roadWeatherData.weather.weather,
          wind_chill: roadWeatherData.weather["wind_chill(F)"],
          wind_direction: roadWeatherData.weather.wind_direction,
          wind_speed: roadWeatherData.weather["wind_speed(mph)"],
        },
      });

      // Calculate the severity using the new endpoint
      const severityResponse = await fetch(
        `http://localhost:8080/json/calculate_severity?temperature=${roadWeatherData.weather["temperature(F)"]}&pressure=${roadWeatherData.weather["pressure(in)"]}&wind_direction=${roadWeatherData.weather.wind_direction}&wind_speed=${roadWeatherData.weather["wind_speed(mph)"]}&weather_condition=${roadWeatherData.weather.weather}&bump=${roadWeatherData.road_features.bump}&junction=${roadWeatherData.road_features.junction}&no_exit=${roadWeatherData.road_features.no_exit}&railway=${roadWeatherData.road_features.railway}&roundabout=${roadWeatherData.road_features.roundabout}&station=${roadWeatherData.road_features.station}&stop=${roadWeatherData.road_features.stop}&traffic_calming=${roadWeatherData.road_features.traffic_calming}&traffic_signal=${roadWeatherData.road_features.traffic_signal}`
      );
      if (!severityResponse.ok) {
        throw new Error("Failed to calculate severity");
      }
      const severityData = await severityResponse.json();
      setCalculatedSeverity(severityData.severity); // Set the calculated severity value
    } catch (err) {
      console.error("Error fetching road and weather data", err);
      setError("Failed to retrieve data. Please try again.");
    }
  };

  const handleStreetChange = (newStreet: string) => {
    setSelectedStreet(newStreet.toUpperCase());
    setSearchTerm(newStreet.toUpperCase());
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '20px'}}>Road and Weather Data Search</h1>



      <Box display="flex" alignItems="center" gap={2}>
        <FormControl fullWidth sx={{ mb: 0 }}>
          <Autocomplete
            options={streetNames}
            value={selectedStreet}
            onChange={(event, newValue) => newValue && handleStreetChange(newValue)}
            inputValue={searchTerm}
            onInputChange={(event, newInputValue) => setSearchTerm(newInputValue)}
            renderInput={(params) => (
              <TextField {...params} label="Search and Select Street" variant="outlined" sx={{ borderRadius: '5px', padding: '10px' }} />
            )}
            getOptionLabel={(option) => option}
          />
        </FormControl>

        <button
          onClick={handleSearch}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Get Weather Data
        </button>
      </Box>

      {error && <p style={{ color: "red" }}>{error}</p>}
      

      {roadWeatherData && (
        <div>
          <h3 style={{ textAlign: 'center', color: '#28a745', marginBottom: '20px'}} >Road Features for {selectedStreet}</h3>
          {calculatedSeverity !== null ? (
              calculatedSeverity > 2 ? (
                <div style={{ textAlign: 'start', color: 'red', fontWeight: 'bold', marginTop: '20px' }}>
                  <h2>⚠️ Warning: High Severity (Severity: {calculatedSeverity})</h2>
                </div>
              ) : (
                <div style={{ textAlign: 'start', color: 'green', fontWeight: 'bold', marginTop: '20px' }}>
                  <h2>✅ Severity is normal (Severity: {calculatedSeverity})</h2>
                </div>
              )
            ) : null}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between' }}>
            {Object.entries(roadWeatherData.road_features).map(([feature, isEnabled], index) => (
              <div key={index} style={{ flex: '0 0 30%', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <h4 style={{ color: '#007bff', marginBottom: '10px' }}>{feature.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</h4>
                <p>{isEnabled ? <span style={{ color: 'green' }}>✅</span> : <span style={{ color: 'red' }}>❌</span>}</p>
              </div>
            ))}
          </div>
          
          <h3 style={{ textAlign: 'center', color: '#28a745', marginBottom: '20px'}} >Weather Conditions for {selectedStreet}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {[
              { title: 'Weather Condition', value: roadWeatherData.weather.weather },
              { title: 'Temperature', value: `${roadWeatherData.weather.temperature}°F` },
              { title: 'Humidity', value: `${roadWeatherData.weather.humidity}%` },
              { title: 'Wind Chill', value: `${roadWeatherData.weather.wind_chill}°F` },
              { title: 'Pressure', value: `${roadWeatherData.weather.pressure} in` },
              { title: 'Wind Direction', value: roadWeatherData.weather.wind_direction },
              { title: 'Wind Speed', value: `${roadWeatherData.weather.wind_speed} mph` },
            ].map((weather, index) => (
              <div key={index} style={{ flex: '0 0 30%', marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <h4 style={{ color: '#007bff', marginBottom: '10px' }}>{weather.title}</h4>
                <p>{weather.value}</p>
              </div>
            ))}
          </div>
 
        </div>
      )}
    </div>
  );
};

export default RoadWeatherSearch;
