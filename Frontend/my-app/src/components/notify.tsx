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
    weather_condition: string; // Weather condition like "scattered clouds"
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
          weather_condition: roadWeatherData.weather.weather,
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
          Get Severity
        </button>
      </Box>

      {error && <p style={{ color: "red" }}>{error}</p>}
      

      {roadWeatherData && (
  <div style={{ padding: '10px', backgroundColor: '#f4f6f9', borderRadius: '10px' }}>
    

    {calculatedSeverity !== null && (
      <div style={{ textAlign: 'center', fontWeight: 'bold', margin: '10px 0', padding: '10px', borderRadius: '8px', 
        backgroundColor: calculatedSeverity > 3 ? '#ffcccc' : '#d4edda', color: calculatedSeverity > 3 ? '#d9534f' : '#155724' }}>
        <h2>{calculatedSeverity > 3 ? `⚠️ High Severity (${calculatedSeverity.toFixed(3)})` : `✅ Normal Severity (${calculatedSeverity.toFixed(3)})`}</h2>
      </div>
    )}

<h4 style={{ textAlign: 'center', color: '#28a745' }}>Road Features for {selectedStreet}</h4>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', textAlign: 'center' }}>
      {Object.entries(roadWeatherData.road_features).map(([feature, isEnabled], index) => (
        <div key={index} style={{
          padding: '10px', borderRadius: '8px', backgroundColor: isEnabled ? '#e6ffe6' : '#ffe6e6', 
          border: `1px solid ${isEnabled ? '#28a745' : '#d9534f'}` }}>
          <h4 style={{ color: '#007bff', fontSize: '14px' }}>{feature.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h4>
          <p style={{ fontSize: '16px' }}>{isEnabled ? '✅' : '❌'}</p>
        </div>
      ))}
    </div>

    <h4 style={{ textAlign: 'center', color: '#28a745', marginTop: '10px' }}>Weather Conditions for {selectedStreet}</h4>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', textAlign: 'center' }}>
      {[
        { title: 'Condition', value: roadWeatherData.weather.weather_condition },
        { title: 'Temp', value: `${roadWeatherData.weather.temperature}°F` },
        { title: 'Humidity', value: `${roadWeatherData.weather.humidity}%` },
        { title: 'Wind Chill', value: `${roadWeatherData.weather.wind_chill}°F` },
        { title: 'Pressure', value: `${roadWeatherData.weather.pressure} in` },
        { title: 'Wind Dir', value: roadWeatherData.weather.wind_direction },
        { title: 'Wind Speed', value: `${roadWeatherData.weather.wind_speed} mph` },
      ].map((weather, index) => (
        <div key={index} style={{
          padding: '10px', borderRadius: '8px', backgroundColor: '#e0f7fa', 
          border: '1px solid #17a2b8' }}>
          <h4 style={{ color: '#007bff', fontSize: '14px' }}>{weather.title}</h4>
          <p style={{ fontSize: '14px' }}>{weather.value}</p>
        </div>
      ))}
    </div>
  </div>
)}


    </div>
  );
};

export default RoadWeatherSearch;
