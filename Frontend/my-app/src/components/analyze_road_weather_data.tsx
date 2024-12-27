import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Box, Typography, FormControl, FormGroup, FormControlLabel, Checkbox, Paper, Grid, Button, TextField, Autocomplete } from '@mui/material';
import { TrafficOutlined } from '@mui/icons-material';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminRoadFeatureAnalysis: React.FC = () => {
  const [streetData, setStreetData] = useState<any>({
    Bump: false,
    Crossing: false,
    Give_Way: false,
    Junction: false,
    No_Exit: false,
    Railway: false,
    Roundabout: false,
    Station: false,
    Stop: false,
    Traffic_Calming: false,
    Traffic_Signal: false,
  });
  const [selectedStreet, setSelectedStreet] = useState('00-199 FAIR LAWN PKWY');
  const [weatherData, setWeatherData] = useState({
    temperature: 75,
    pressure: 1013,
    wind_direction: 'N',
    wind_speed: 15,
    weather_condition: 'Clear',
  });
  const [accidentRisk, setAccidentRisk] = useState<number | null>(null);

  const featureNames = [
    'Bump', 'Crossing', 'Give_Way', 'Junction', 'No_Exit', 'Railway', 'Roundabout', 'Station', 'Stop', 'Traffic_Calming', 'Traffic_Signal'
  ];

  const handleWeatherChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, feature: string) => {
    setWeatherData((prevData) => ({
      ...prevData,
      [feature]: event.target.value,
    }));
  };

  const toggleFeature = (feature: string) => {
    setStreetData((prevState: { [x: string]: any; }) => ({
      ...prevState,
      [feature]: !prevState[feature], // Toggle the feature value
    }));
  };

  const handlePredictSeverity = () => {
    const queryParams = new URLSearchParams({
      temperature: weatherData.temperature.toString(),
      pressure: weatherData.pressure.toString(),
      wind_direction: weatherData.wind_direction,
      wind_speed: weatherData.wind_speed.toString(),
      weather_condition: weatherData.weather_condition,
      bump: streetData.Bump ? 'true' : 'false',
      crossing: streetData.Crossing ? 'true' : 'false',
      give_way: streetData.Give_Way ? 'true' : 'false',
      junction: streetData.Junction ? 'true' : 'false',
      no_exit: streetData.No_Exit ? 'true' : 'false',
      railway: streetData.Railway ? 'true' : 'false',
      roundabout: streetData.Roundabout ? 'true' : 'false',
      station: streetData.Station ? 'true' : 'false',
      stop: streetData.Stop ? 'true' : 'false',
      traffic_calming: streetData.Traffic_Calming ? 'true' : 'false',
      traffic_signal: streetData.Traffic_Signal ? 'true' : 'false',
    });

    fetch(`http://localhost:8080/calculate_severity?${queryParams}`)
      .then((response) => response.json())
      .then((data) => {
        setAccidentRisk(data.severity); // Assuming the response contains a 'severity' field
      })
      .catch((error) => console.error('Error fetching severity data:', error));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, p: 2, ml:40 }}>
      {/* Left Section */}
      <Box sx={{ flex: 1, maxWidth: { md: '500px' }, ml: 2 }}>
        <Typography variant="h5" gutterBottom>
          Road Feature + Weather Analysis
        </Typography>

        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>

          <FormGroup>
            <Grid container spacing={1}>
              {featureNames.map((feature) => (
                <Grid item xs={6} key={feature}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={streetData[feature] || false}
                        onChange={() => toggleFeature(feature)}
                      />
                    }
                    label={feature.charAt(0).toUpperCase() + feature.slice(1).replace(/_/g, ' ')}
                  />
                </Grid>
              ))}
            </Grid>
          </FormGroup>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
            Adjust Weather Data:
          </Typography>

          <TextField
            label="Temperature (°F)"
            type="number"
            value={weatherData.temperature}
            onChange={(event) => handleWeatherChange(event, 'temperature')}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Pressure (hPa)"
            type="number"
            value={weatherData.pressure}
            onChange={(event) => handleWeatherChange(event, 'pressure')}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Wind Speed (mph)"
            type="number"
            value={weatherData.wind_speed}
            onChange={(event) => handleWeatherChange(event, 'wind_speed')}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Wind Direction"
            value={weatherData.wind_direction}
            onChange={(event) => handleWeatherChange(event, 'wind_direction')}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Weather Condition"
            value={weatherData.weather_condition}
            onChange={(event) => handleWeatherChange(event, 'weather_condition')}
            fullWidth
            sx={{ mb: 2 }}
          />
        </Paper>
      </Box>

      

      {/* Right Section */}
      <Box sx={{ flex: 1, display: 'block', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 600 }}>
          <Bar
            data={{
              labels: featureNames,
              datasets: [
                {
                  label: 'Road Features',
                  data: featureNames.map((feature) => (streetData[feature] ? 1 : 0)),
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { position: 'top' } },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    callback: (value) => (value === 1 ? 'Enabled' : 'Disabled'),
                  },
                },
              },
            }}
            width={300}
            height={200}
          />
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{
              mt: 1,
              fontWeight: 'bold',
              color: accidentRisk !== null && accidentRisk >= 3 ? 'red' : 'green',
            }}
          >
            Predicted Severity: {accidentRisk !== null ? accidentRisk : 'Not calculated yet'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ padding: '10px 20px' }}
            startIcon={<TrafficOutlined />}
            onClick={handlePredictSeverity}
          >
            Predict Severity
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminRoadFeatureAnalysis;
