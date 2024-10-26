import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import {
  Box,
  Typography,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Grid,
  Button,
  TextField,
  Autocomplete,
  InputLabel,
} from '@mui/material';
import { TrafficOutlined } from '@mui/icons-material';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminRoadFeatureAnalysis: React.FC = () => {
  const [roadData, setRoadData] = useState<any>({});
  const [featureCombinations, setFeatureCombinations] = useState<any>({});
  const [selectedCity, setSelectedCity] = useState('00-199 FAIR LAWN PKWY');
  const [searchTerm, setSearchTerm] = useState('');
  const [accidentRisk, setAccidentRisk] = useState(5); // Default severity

  // Fetch the road feature data from the public directory
  useEffect(() => {
    fetch('/street_road_features_with_severity.json')
      .then((response) => response.json())
      .then((data) => setRoadData(data))
      .catch((error) => console.error('Error fetching the road feature data:', error));

    // Fetch the road feature combinations data
    fetch('/average_severities_combinations.json') // Adjust the path to your JSON file
      .then((response) => response.json())
      .then((data) => setFeatureCombinations(data))
      .catch((error) => console.error('Error fetching the road feature combinations data:', error));
  }, []);

  const toggleFeature = (feature: string) => {
    setRoadData((prevRoadData: { [x: string]: { [x: string]: any; }; }) => {
      const updatedCityData = {
        ...prevRoadData[selectedCity],
        [feature]: !prevRoadData[selectedCity][feature], // Toggle the checkbox state
      };

      // Update the roadData state
      return {
        ...prevRoadData,
        [selectedCity]: updatedCityData,
      };
    });

    // Recalculate risk severity after updating the feature
    setAccidentRisk(calculateRisk(roadData[selectedCity], featureCombinations));
  };

  const calculateRisk = (features: any, featureCombinations: any): number => {
    const activeFeatures = Object.keys(features).filter(feature => features[feature]);
    console.log("Active Features:", activeFeatures); // Debugging log

    // Return default severity if no features are active
    if (activeFeatures.length === 0) return 5; 

    // Generate keys for single features and combinations
    const allKeys: string[] = [];
    activeFeatures.forEach((feature) => {
      allKeys.push(`${feature} = True`);
    });

    // Function to create combinations of features
    const createCombinations = (arr: string[]): string[] => {
      const combinations: string[] = [];
      const n = arr.length;

      for (let i = 1; i < (1 << n); i++) { 
        const combination: string[] = [];
        for (let j = 0; j < n; j++) {
          if (i & (1 << j)) {
            combination.push(arr[j]);
          }
        }
        if (combination.length > 1) {
          combinations.push(`${combination.join(' AND ')} = True`);
        }
      }
      return combinations;
    };

    // Add combinations of two or more active features
    allKeys.push(...createCombinations(activeFeatures));

    console.log("All Keys to Check:", allKeys); // Debugging log

    // Lookup the severity based on the generated keys
    let severity = 5; // Default severity if no matches are found
    for (const key of allKeys) {
      if (featureCombinations[key] !== undefined) {
        severity = featureCombinations[key];
        console.log("Found Severity for Key:", key, "Severity:", severity); // Debugging log
        break; // Use the first matching severity found
      }
    }

    return severity;
  };

  if (!roadData[selectedCity] || !Object.keys(featureCombinations).length) {
    return <Typography>Loading...</Typography>; // Loading state while data is being fetched
  }

  const featureLabels = Object.keys(roadData[selectedCity]).filter((feature) => feature !== 'accidentRisk' && feature !== 'Average_Severity');
  const featureValues = featureLabels.map((feature) => (roadData[selectedCity][feature] ? 1 : 0)); // Use 1 for enabled, 0 for disabled

  // Filter and sort city names based on the search term
  const filteredCities = Object.keys(roadData)
    .filter((city) => city.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  return (
    <Box sx={{ padding: '10px', maxWidth: '400px', margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Road Feature Analysis
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel></InputLabel>
        <Autocomplete
          options={filteredCities}
          value={selectedCity}
          onChange={(event, newValue) => {
            if (newValue) {
              setSelectedCity(newValue);
              setSearchTerm(newValue); // Update search term to reflect selected city
              setAccidentRisk(calculateRisk(roadData[newValue], featureCombinations)); // Recalculate risk for the new city
            }
          }}
          inputValue={searchTerm}
          onInputChange={(event, newInputValue) => {
            setSearchTerm(newInputValue); // Update search term as user types
          }}
          renderInput={(params) => (
            <TextField {...params} label="Search and Select City" variant="outlined" />
          )}
          getOptionLabel={(option) => option} // Display the city name
          sx={{ mb: 2 }} // Additional styles can be added here
        />
      </FormControl>

      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Selected City: {selectedCity}
        </Typography>

        <FormGroup>
          <Grid container spacing={1}>
            {Object.keys(roadData[selectedCity]).map((feature) =>
              feature !== 'accidentRisk' && feature !== 'Average_Severity' ? (
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
