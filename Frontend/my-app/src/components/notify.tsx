import React, { useState, useEffect } from 'react';

// Define the Street interface
interface Street {
  name: string;
  weather: {
    condition: string;
    temperature: number;
    humidity: number;
    windChill: number;
    pressure: number;
    visibility: number;
    windDirection: string;
    windSpeed: number;
    precipitation: number;
  };
  severity: number;
}

const AlertSystem = () => {
  const [streetData, setStreetData] = useState<Street[]>([]); // All street data
  const [alerts, setAlerts] = useState<Street[]>([]); // Alerts for the selected street
  const [searchTerm, setSearchTerm] = useState(''); // Search input
  const [filteredStreets, setFilteredStreets] = useState<Street[]>([]); // Filtered streets based on search
  const [selectedStreet, setSelectedStreet] = useState<Street | null>(null); // Selected street from search

  // Function to fetch street data (weather data)
  const fetchStreetData = async () => {
    try {
      const response = await fetch('/weatherData.json'); // Fetch data from the public folder
      const data: Street[] = await response.json();
      setStreetData(data);
    } catch (error) {
      console.error('Error fetching street data:', error);
    }
  };

  // Fetch the street data every minute
  useEffect(() => {
    fetchStreetData();
    const interval = setInterval(fetchStreetData, 60000); // Fetch data every 60 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  // Update filtered streets based on search term
  useEffect(() => {
    if (searchTerm) {
      const matches = streetData.filter(street =>
        street.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStreets(matches);
    } else {
      setFilteredStreets([]);
    }
  }, [searchTerm, streetData]);

  // Handle street selection and display alerts for the selected street
  const handleStreetSelect = (street: Street) => {
    setSelectedStreet(street);
    setAlerts([street]); // Display selected street's severity alert
    setSearchTerm(''); // Clear search term after selection
    setFilteredStreets([]); // Clear filtered results after selection
  };

  // Helper function to apply severity-based styles
  const getSeverityStyle = (severity: number) => {
    if (severity >= 4) {
      return {
        color: 'red',
        fontWeight: 'bold',
      };
    }
    return {
      color: 'green',
    };
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Street Alert Monitoring</h2>
      <p>Search and select a street to view alerts based on severity...</p>

      {/* Search Bar for selecting a street */}
      <input
        type="text"
        placeholder="Search street..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
      />

      {/* Dropdown for filtered streets */}
      {filteredStreets.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, border: '1px solid #ddd', borderRadius: '4px' }}>
          {filteredStreets.map((street, index) => (
            <li
              key={index}
              onClick={() => handleStreetSelect(street)}
              style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#f8f9fa', borderBottom: '1px solid #ddd' }}
            >
              {street.name}
            </li>
          ))}
        </ul>
      )}

      {/* Display alert for the selected street */}
      {selectedStreet ? (
        <div style={{ marginTop: '20px' }}>
          <h3>Alerts for {selectedStreet.name}</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <li key={index} style={getSeverityStyle(alert.severity)}>
                  <div>
                    <strong>{alert.name} has a severity of {alert.severity}!</strong>
                  </div>
                  <div>Weather: {alert.weather.condition}</div>
                  <div>Temperature: {alert.weather.temperature}°F</div>
                  <div>Humidity: {alert.weather.humidity}%</div>
                  <div>Wind Chill: {alert.weather.windChill}°F</div>
                  <div>Pressure: {alert.weather.pressure} in</div>
                  <div>Visibility: {alert.weather.visibility} mi</div>
                  <div>Wind Direction: {alert.weather.windDirection}</div>
                  <div>Wind Speed: {alert.weather.windSpeed} mph</div>
                  <div>Precipitation: {alert.weather.precipitation} in</div>
                </li>
              ))
            ) : (
              <li>No alerts to display for this street</li>
            )}
          </ul>
        </div>
      ) : (
        <p>Select a street to view alerts</p>
      )}
    </div>
  );
};

export default AlertSystem;
