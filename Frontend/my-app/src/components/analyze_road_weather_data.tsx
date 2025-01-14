import React, { useState } from 'react';
import { Box, Typography, FormControl, FormGroup, FormControlLabel, Checkbox, Paper, Grid, Button, TextField, Autocomplete } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { TrafficOutlined } from '@mui/icons-material';

const windDirections = [
  'Calm', 'SW', 'SSW', 'WSW', 'WNW', 'NW', 'West', 'NNW', 'NNE', 'South', 'North',
  'Variable', 'SE', 'SSE', 'ESE', 'East', 'NE', 'ENE', 'E', 'W', 'S', 'VAR', 'CALM', 'N'
];

const weatherConditions = [
  'Light Rain', 'Overcast', 'Mostly Cloudy', 'Rain', 'Light Snow', 'Haze', 'Scattered Clouds',
  'Partly Cloudy', 'Clear', 'Snow', 'Light Freezing Drizzle', 'Light Drizzle', 'Fog', 
  'Shallow Fog', 'Heavy Rain', 'Light Freezing Rain', 'Cloudy', 'Drizzle', 'Light Rain Showers', 
  'Mist', 'Smoke', 'Patches of Fog', 'Light Freezing Fog', 'Light Haze', 'Light Thunderstorms and Rain',
  'Thunderstorms and Rain', 'Fair', 'Volcanic Ash', 'Blowing Sand', 'Blowing Dust / Windy', 
  'Widespread Dust', 'Fair / Windy', 'Rain Showers', 'Mostly Cloudy / Windy', 'Light Rain / Windy',
  'Hail', 'Heavy Drizzle', 'Showers in the Vicinity', 'Thunderstorm', 'Light Rain Shower', 
  'Light Rain with Thunder', 'Partly Cloudy / Windy', 'Thunder in the Vicinity', 'T-Storm', 
  'Heavy Thunderstorms and Rain', 'Thunder', 'Heavy T-Storm', 'Funnel Cloud'
];

const AdminRoadFeatureAnalysis: React.FC = () => {
  const [streetData, setStreetData] = useState<any>({
    Bump: false, Crossing: false, Give_Way: false, Junction: false, No_Exit: false,
    Railway: false, Roundabout: false, Station: false, Stop: false, Traffic_Calming: false, Traffic_Signal: false,
  });
  const [weatherData, setWeatherData] = useState({
    temperature: 75,
    pressure: 1013,
    wind_direction: 'Calm',
    wind_speed: 15,
    weather_condition: 'Clear',
    wind_chill:19,
    humidity:45
  });
  const [accidentRisk, setAccidentRisk] = useState<number | null>(null);

  const handleWeatherChange = (key: string, value: string | number) => {
    setWeatherData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePredictSeverity = () => {
    const queryParams = new URLSearchParams({
      temperature: weatherData.temperature.toString(),
      pressure: weatherData.pressure.toString(),
      wind_direction: weatherData.wind_direction,
      wind_speed: weatherData.wind_speed.toString(),
      weather_condition: weatherData.weather_condition,
      wind_chill:weatherData.wind_chill.toString(),
      humidity:weatherData.humidity.toString(),
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

    fetch(`http://localhost:8080/json/calculate_severity?${queryParams}`)
      .then((response) => response.json())
      .then((data) => {
        setAccidentRisk(data.severity); // Assuming the response contains a 'severity' field
      })
      .catch((error) => console.error('Error fetching severity data:', error));
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" gutterBottom>Road Feature + Weather Analysis</Typography>
        <Paper sx={{ p: 2 }}>
          <FormGroup>
            <Grid container spacing={1}>
              {Object.keys(streetData).map((feature) => (
                <Grid item xs={6} key={feature}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={streetData[feature]}
                        onChange={() => setStreetData((prev: { [x: string]: any; }) => ({ ...prev, [feature]: !prev[feature] }))}
                      />
                    }
                    label={feature.replace(/_/g, ' ')}
                  />
                </Grid>
              ))}
            </Grid>
          </FormGroup>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>Weather Data:</Typography>
          <TextField
            label="Temperature (°F)"
            type="number"
            value={weatherData.temperature}
            onChange={(e) => handleWeatherChange('temperature', +e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Pressure (hPa)"
            type="number"
            value={weatherData.pressure}
            onChange={(e) => handleWeatherChange('pressure', +e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Wind Speed (mph)"
            type="number"
            value={weatherData.wind_speed}
            onChange={(e) => handleWeatherChange('wind_speed', +e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Autocomplete
            options={windDirections}
            value={weatherData.wind_direction}
            onChange={(e, value) => handleWeatherChange('wind_direction', value || '')}
            renderInput={(params) => <TextField {...params} label="Wind Direction" />}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Autocomplete
            options={weatherConditions}
            value={weatherData.weather_condition}
            onChange={(e, value) => handleWeatherChange('weather_condition', value || '')}
            renderInput={(params) => <TextField {...params} label="Weather Condition" />}
            fullWidth
          />
          <TextField
            label="Wind Chill (F)"
            type="number"
            value={weatherData.wind_chill}
            onChange={(e) => handleWeatherChange('wind_chill', +e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Humidity (%)"
            type="number"
            value={weatherData.humidity
            }
            onChange={(e) => handleWeatherChange('humidity', +e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
        </Paper>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Bar
          data={{
            labels: Object.keys(streetData),
            datasets: [{
              label: 'Features Enabled',
              data: Object.values(streetData).map((enabled) => (enabled ? 1 : 0)),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            }],
          }}
        />
        <Typography variant="subtitle1" color={accidentRisk && accidentRisk > 3 ? 'error' : 'primary'}  gutterBottom sx={{ mt: 1, fontWeight: 'bold'}}>
          Predicted Severity: {accidentRisk || 'N/A'}
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
  );
};

export default AdminRoadFeatureAnalysis;
