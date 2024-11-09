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

  // Fetch street data from JSON format
  useEffect(() => {
    const fetchStreetData = async () => {
      try {
        const response = await fetch('/average_street_weather.json');
        const data = await response.json();

        // Convert JSON object to array of Street objects
        const streetsArray = Object.entries(data).map(([name, values]: [string, any]) => ({
          name,
          weather: {
            condition: values.Weather_Condition,
            temperature: values['Temperature(F)'],
            humidity: values['Humidity(%)'],
            windChill: values['Wind_Chill(F)'],
            pressure: values['Pressure(in)'],
            visibility: values['Visibility(mi)'],
            windDirection: values.Wind_Direction,
            windSpeed: values['Wind_Speed(mph)'],
            precipitation: values['Precipitation(in)'],
          },
          severity: values.Severity,
        }));

        setStreetData(streetsArray);
      } catch (error) {
        console.error('Error fetching street data:', error);
      }
    };
    fetchStreetData();
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
                <li key={index} style={getAlertStyle(alert.severity)}>
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

// A helper function to style alerts based on severity
const getAlertStyle = (severity: number) => {
  let backgroundColor;
  switch (true) {
    case severity >= 5:
      backgroundColor = '#f8d7da'; // Red for critical alerts
      break;
    case severity === 4:
      backgroundColor = '#fff3cd'; // Yellow for moderate alerts
      break;
    default:
      backgroundColor = '#f8f9fa'; // Default color for no alert
      break;
  }
  return {
    margin: '10px 0',
    padding: '15px',
    borderRadius: '8px',
    backgroundColor,
    border: '1px solid #ddd',
  };
};

export default AlertSystem;
