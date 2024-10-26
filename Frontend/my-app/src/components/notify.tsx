import React, { useState, useEffect } from 'react';

// Define the Street interface
interface Street {
  name: string;
  weather: {
    condition: string;
    temperature: number;
    humidity: number;
  };
  roadFeatures: {
    potholes: boolean;
    speedBumps: boolean;
  };
  severity: number;
}

const AlertSystem = () => {
  // State to store street data
  const [streetData, setStreetData] = useState<Street[]>([]);
  const [alerts, setAlerts] = useState<Street[]>([]); // State to store active alerts

  // Fetch street data (mocked from a JSON file)
  useEffect(() => {
    const fetchStreetData = async () => {
      try {
        const response = await fetch('/street.json');
        const data = await response.json();
        setStreetData(data.streets);
      } catch (error) {
        console.error('Error fetching street data:', error);
      }
    };
    fetchStreetData();
  }, []);

  // Function to trigger alerts based on severity
  const triggerAlert = (street: Street) => {
    if (street.severity >= 4) {
      setAlerts([street]); // Clear past alerts and add only the new one
    }
  };

  // Process the alerts for all streets
  const processAlerts = (streets: Street[]) => {
    setAlerts([]); // Clear all past alerts before processing new ones
    streets.forEach((street) => {
      triggerAlert(street);
    });
  };

  // Set up a continuous check for alerts (every hour)
  useEffect(() => {
    const intervalId = setInterval(() => {
      processAlerts(streetData);
    }, 60); // Check every 60 minutes (1 hour = 3600000 milliseconds)

    return () => clearInterval(intervalId); // Clear interval when the component is unmounted
  }, [streetData]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Street Alert Monitoring</h2>
      <p>Monitoring streets and triggering alerts based on severity...</p>

      {/* Display street data for reference */}
      {/* <ul style={{ listStyle: 'none', padding: 0 }}>
        {streetData.map((street) => (
          <li key={street.name}>
            {street.name} - Severity: {street.severity}
          </li>
        ))}
      </ul> */}

      {/* Display alert notifications */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <li key={index} style={getAlertStyle(alert.severity)}>
              <div>
                <strong>{alert.name} has a severity of {alert.severity}!</strong>
              </div>
              <div>Weather: {alert.weather.condition}</div>
              <div>Temperature: {alert.weather.temperature}°C</div>
              <div>Humidity: {alert.weather.humidity}%</div>
            </li>
          ))
        ) : (
          <li>No alerts to display</li>
        )}
      </ul>
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
