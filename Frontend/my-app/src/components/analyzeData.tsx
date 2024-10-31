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
  const [initialSeverity, setInitialSeverity] = useState(5);
  const [accidentRisk, setAccidentRisk] = useState(5);

  // Feature names to display
  const featureNames = [
    "Bump",
    "Crossing",
    "Give_Way",
    "Junction",
    "No_Exit",
    "Railway",
    "Roundabout",
    "Station",
    "Stop",
    "Traffic_Calming",
    "Traffic_Signal",
  ];

  // Helper function to format feature names consistently
  // Fetch data from JSON files
  useEffect(() => {
    fetch('/street_road_features_with_severity.json')
      .then((response) => response.json())
      .then((data) => setRoadData(data))
      .catch((error) => console.error('Error fetching the road feature data:', error));

    fetch('/average_severities_combinations.json')
      .then((response) => response.json())
      .then((data) => setFeatureCombinations(data))
      .catch((error) => console.error('Error fetching the road feature combinations data:', error));
  }, []);

  const toggleFeature = (feature: string) => {
    setRoadData((prevRoadData: { [x: string]: { [x: string]: any; }; }) => {
      const updatedCityData = {
        ...prevRoadData[selectedCity],
        [feature]: !prevRoadData[selectedCity][feature],
      };

      const updatedRoadData = {
        ...prevRoadData,
        [selectedCity]: updatedCityData,
      };

      const newSeverity = calculateRisk(updatedCityData, featureCombinations);
      setAccidentRisk(newSeverity);

      return updatedRoadData;
    });
  };

  const calculateRisk = (features: any, featureCombinations: any): number => {
    const activeFeatures = Object.keys(features)
      .filter((feature) => features[feature])
      .map((feature) => featureNames.includes(feature) ? feature : feature); // Format feature names to match JSON keys
  
    if (activeFeatures.length === 0) return initialSeverity;
  
    const allKeys: string[] = [];
    activeFeatures.forEach((feature) => {
      allKeys.push(`${feature} = True`);
    });
  
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
  
    allKeys.push(...createCombinations(activeFeatures));
  
    let severity = initialSeverity; // Default to initial severity if no match found
    for (const key of allKeys) {
      if (featureCombinations[key] !== undefined) {
        severity = featureCombinations[key];
        break; // Use the first matching severity value
      }
    }
  
    return severity;
  };

  const handleCityChange = (newCity: string) => {
    setSelectedCity(newCity);
    setSearchTerm(newCity);
    const cityData = roadData[newCity];
    
    // Get Average_Severity from the city data
    const severity = cityData?.Average_Severity || 5; // Default if not found
    setInitialSeverity(severity); // Set the initial severity based on the Average_Severity
    setAccidentRisk(severity); // Update the accident risk with the same value
  };

  if (!roadData[selectedCity] || !Object.keys(featureCombinations).length) {
    return <Typography>Loading...</Typography>;
  }

  const featureLabels = Object.keys(roadData[selectedCity]).filter(
    (feature) => feature !== 'accidentRisk' && feature !== 'Average_Severity'
  );
  const featureValues = featureLabels.map((feature) =>
    roadData[selectedCity][feature] ? 1 : 0
  );

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
              handleCityChange(newValue);
            }
          }}
          inputValue={searchTerm}
          onInputChange={(event, newInputValue) => {
            setSearchTerm(newInputValue);
          }}
          renderInput={(params) => (
            <TextField {...params} label="Search and Select Street" variant="outlined" />
          )}
          getOptionLabel={(option) => option}
          sx={{ mb: 2 }}
        />
      </FormControl>

      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Selected Street: {selectedCity}
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
                    label={featureNames[featureNames.indexOf(feature)]}
                  />
                </Grid>
              ) : null
            )}
          </Grid>
        </FormGroup>

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
          Severity: {roadData[selectedCity]?.Average_Severity || 'Loading...'}
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
          Predicted Severity: {accidentRisk}
        </Typography>
      </Paper>

      {/* New Box to display feature names */}


      <Box sx={{ mt: 2 }}>
        <Bar
          data={{
            labels: featureLabels.map((feature) => featureNames[featureNames.indexOf(feature)]),
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
          width={300}
          height={200}
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
