import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import {
  Box,
  Typography,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Grid,
  Button,
} from '@mui/material';
import { TrafficOutlined } from '@mui/icons-material';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminRoadFeatureAnalysis: React.FC = () => {
  const [roadData, setRoadData] = useState<any>({});
  const [selectedCity, setSelectedCity] = useState('Street A');

  // Fetch the road feature data from the public directory
  useEffect(() => {
    fetch('/top_10_street.json')
      .then((response) => response.json())
      .then((data) => setRoadData(data))
      .catch((error) => console.error('Error fetching the road feature data:', error));
  }, []);

  const toggleFeature = (feature: string) => {
    setRoadData({
      ...roadData,
      [selectedCity]: {
        ...roadData[selectedCity],
        [feature]: !roadData[selectedCity][feature],
      },
    });
  };

  const calculateRisk = () => {
    const features = roadData[selectedCity];
    let risk = 5; // base risk
    Object.keys(features).forEach((feature) => {
      if (features[feature] && feature !== 'accidentRisk') {
        risk += 2; // Increase risk for each feature present
      }
    });
    return risk;
  };

  if (!roadData[selectedCity]) {
    return <Typography>Loading...</Typography>; // Loading state while data is being fetched
  }
  
  const featureLabels = Object.keys(roadData[selectedCity]).filter((feature) => feature !== 'severity');
  const featureValues = featureLabels.map((feature) => (roadData[selectedCity][feature] ? 1 : 0)); // Use 1 for enabled, 0 for disabled

  const accidentRisk = calculateRisk();

  return (
    <Box sx={{ padding: '10px', maxWidth: '400px', margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Road Feature Analysis
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select City</InputLabel>
        <Select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value as string)}
          label="Select City"
        >
          {Object.keys(roadData).map((city) => (
            <MenuItem key={city} value={city}>
              {city}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Selected City: {selectedCity}
        </Typography>

        <FormGroup>
          <Grid container spacing={1}>
            {Object.keys(roadData[selectedCity]).map((feature) =>
              feature !== 'accidentRisk' ? (
                <Grid item xs={6} key={feature}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={roadData[selectedCity][feature]}
                        onChange={() => toggleFeature(feature)}
                      />
                    }
                    label={feature.replace('_', ' ')}
                  />
                </Grid>
              ) : null
            )}
          </Grid>
        </FormGroup>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
          Severity: {accidentRisk}
        </Typography>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Feature Status Chart
        </Typography>
        <Bar
          data={{
            labels: featureLabels.map((feature) => feature.replace('_', ' ')),
            datasets: [
              {
                label: 'Road Features',
                data: featureValues,
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
          width={300} // Set width of the chart
          height={200} // Set height of the chart
        />
      </Box>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        startIcon={<TrafficOutlined />}
      >
        Simulate Traffic Changes
      </Button>
    </Box>
  );
};

export default AdminRoadFeatureAnalysis;
