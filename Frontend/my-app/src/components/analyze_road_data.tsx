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
} from '@mui/material';
import { TrafficOutlined } from '@mui/icons-material';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminRoadFeatureAnalysis: React.FC = () => {
  const [roadData, setRoadData] = useState<any[]>([]); // Array of street data
  const [featureCombinations, setFeatureCombinations] = useState<any>({}); // Store feature combinations with severity
  const [selectedStreet, setSelectedStreet] = useState('00-199 FAIR LAWN PKWY');
  const [searchTerm, setSearchTerm] = useState(''); // Used to filter the streets while typing
  const [accidentRisk, setAccidentRisk] = useState<number | null>(null); // Updated to handle null value
  const [streetNames, setStreetNames] = useState<string[]>([]); // To store all street names
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]); // Array to track active features

  const featureNames = [
    "Bump", "Crossing", "Give_Way", "Junction", "No_Exit", "Railway", "Roundabout", "Station", "Stop", "Traffic_Calming", "Traffic_Signal"
  ];

  // Fetch all street names
  useEffect(() => {
    fetch('http://localhost:8080/json/street_names')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched street names:', data); // Check the fetched street names
        setStreetNames(data); // Store all the street names in state
      })
      .catch((error) => console.error('Error fetching street names:', error));
  }, []);

  // Fetch road features with severity data
  useEffect(() => {
    fetch(`http://localhost:8080/json/road_features_with_severity?street_name=${encodeURIComponent(selectedStreet)}`)
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched road data:', data); // Check the fetched data
        setRoadData(data); // Set the fetched road data
      })
      .catch((error) => console.error('Error fetching the road feature data:', error));

    // Fetch feature combinations data
    fetch('/average_severities_combinations.json')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched feature combinations:', data); // Check the fetched combinations
        setFeatureCombinations(data); // Set the feature combinations data
      })
      .catch((error) => console.error('Error fetching the feature combinations data:', error));
  }, [selectedStreet]);

  const toggleFeature = (feature: string) => {
    // Find the street data for the selected street and toggle the feature value
    const updatedStreetData = roadData.map((streetData) => {
      if (streetData.street_name === selectedStreet) {
        return {
          ...streetData,
          [feature]: !streetData[feature], // Toggle the feature value
        };
      }
      return streetData;
    });
  
    // Update the roadData state
    setRoadData(updatedStreetData);
  };

  useEffect(() => {
    // After updating the road data, find the selected street's data
    const selectedStreetData = roadData.find((data) => data.street_name === selectedStreet);
  
    // If the street data exists, update the activeFeatures
    if (selectedStreetData) {
      const newActiveFeatures = featureNames.filter(
        (feature) => selectedStreetData[feature] === true
      );
  
      setActiveFeatures(newActiveFeatures); // Set the active features state
    }
  }, [roadData, selectedStreet]); // Only trigger this effect when roadData or selectedStreet changes

  
 const calculateRisk = (selectedStreetData: any, featureCombinations: any): number => {
    console.log('Selected street data:', selectedStreetData);

    // Create a list of active features (value of 1 for selected features)
    const activeFeatureKeys = featureLabels
      .map((feature) => selectedStreetData[feature] ? 1 : 0)
      .map((value, index) => (value === 1 ? featureLabels[index] : null)) // Get feature names where value is 1
      .filter((feature) => feature !== null); // Filter out null values

    console.log('Active features selected:', activeFeatureKeys); // Debug: Active features being selected

    // Default severity value if no features are selected
    let predictedSeverity = 2; // Default value

    // If no active features are selected, return the default severity value
    if (activeFeatureKeys.length === 0) {
      console.log('No active features selected. Returning default severity of 2.');
      return predictedSeverity;
    }

    // Normalize the feature names (capitalize the first letter of each word and join by ' AND ')
    const normalizedFeatureKeys = activeFeatureKeys.map((feature) =>
      feature!.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') // Non-null assertion here
    );

    // Create the combination string from selected active features
    const featureCombination = normalizedFeatureKeys.join(' AND ') + ' = True';
    console.log(`Checking combination: ${featureCombination}`); // Debug: Combination being checked

    // Log all keys in the featureCombinations data to check for any discrepancies
    console.log('Available feature combinations keys:', Object.keys(featureCombinations));

    // Check if the normalized combination exists in the fetched featureCombinations data
    if (featureCombinations[featureCombination]) {
      predictedSeverity = featureCombinations[featureCombination];
      console.log(`Combination found: ${featureCombination} => Severity: ${predictedSeverity}`); // Debug: Combination found
    } else {
      console.log(`Combination not found: ${featureCombination}. Returning default severity of 2.`);
    }

    // Final debug log: Return the calculated severity
    console.log('Final predicted severity:', predictedSeverity);
    return predictedSeverity;
};


  
  const handlePredictSeverity = () => {
    // Get the selected street data
    const selectedStreetData = roadData.find((data) => data.street_name === selectedStreet);
    if (selectedStreetData && featureCombinations) {
      // Calculate the risk based on selected features and feature combinations
      const newSeverity = calculateRisk(selectedStreetData, featureCombinations);
      setAccidentRisk(newSeverity); // Update the predicted severity
    }
  };

  const handleStreetChange = (newStreet: string) => {
    setSelectedStreet(newStreet);
    setSearchTerm(newStreet);
  };

  // Find the street data for the selected street
  const selectedStreetData = roadData.find((data) => data.street_name === selectedStreet);

  if (!selectedStreetData || !Object.keys(featureCombinations).length) {
    return <Typography>Loading...</Typography>;
  }

  const featureLabels = Object.keys(selectedStreetData).filter(
    (feature) => feature !== 'average_severity' && feature !== 'street_name'
  );

  const featureValues = featureLabels.map((feature) => (selectedStreetData[feature] ? 1 : 0));

  return (
<Box sx={{
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: 0,
    p: 0,
    alignItems: 'center', // Align items to center
    justifyContent: 'center', // Center content horizontally
    height: '100vh', // Full viewport height for vertical centering
  }}>
  {/* Left Section */}
  <Box sx={{ flex: 1, maxWidth: { md: '500px' }, ml: 30 }}>
    <Typography variant="h5" gutterBottom>
      Road Feature Analysis
    </Typography>

    <FormControl fullWidth sx={{ mb: 2 }}>
      <Autocomplete
        options={streetNames} // Street names fetched from the API
        value={selectedStreet} // The selected street value
        onChange={(event, newValue) => {
          if (newValue) {
            handleStreetChange(newValue); // Update the selected street
          }
        }}
        inputValue={searchTerm} // The input search term for filtering
        onInputChange={(event, newInputValue) => {
          setSearchTerm(newInputValue); // Update search term for input
        }}
        renderInput={(params) => (
          <TextField {...params} label="Search and Select Street" variant="outlined" />
        )}
        getOptionLabel={(option) => option} // Ensure street name is displayed
      />
    </FormControl>

    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Selected Street: {selectedStreet}
      </Typography>

      <FormGroup>
        <Grid container spacing={1}>
          {featureLabels.map((feature) => (
            <Grid item xs={6} key={feature}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedStreetData[feature]}
                    onChange={() => toggleFeature(feature)}
                  />
                }
                label={feature.charAt(0).toUpperCase() + feature.slice(1).replace(/_/g, ' ')} // Correct label formatting
              />
            </Grid>
          ))}
        </Grid>
      </FormGroup>

      <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
        Average Severity: {selectedStreetData.average_severity}
      </Typography>
      <Button variant="contained" color="primary" sx={{ padding: '10px 20px' }} startIcon={<TrafficOutlined />} onClick={handlePredictSeverity}>
        Predict Severity
      </Button>
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

    </Paper>
  </Box>

  {/* Right Section */}
  <Box sx={{ flex: 1, display: 'block', flexDirection: 'column', alignItems: 'center', gap: 2, ml:10 }}>
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      <Bar
        data={{
          labels: featureLabels, // All features will be shown on the X-axis
          datasets: [
            {
              label: 'Road Features',
              data: featureValues, // Only true features will have a bar value of 1
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
      sx={{ mt: 2, ml: 20  }}
      startIcon={<TrafficOutlined />}
    >
      Simulate Traffic Changes
    </Button>
  </Box>
</Box>

    
  );
};

export default AdminRoadFeatureAnalysis;
