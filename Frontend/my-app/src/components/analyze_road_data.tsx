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
  const [selectedStreet, setSelectedStreet] = useState('BRICE RD,REYNOLDSBURG,FRANKLIN');
  const [searchTerm, setSearchTerm] = useState(''); // Used to filter the streets while typing
  const [accidentRisk, setAccidentRisk] = useState<number | null>(null); // Updated to handle null value
  const [streetNames, setStreetNames] = useState<string[]>([]); // To store all street names
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]); // Array to track active features

  const featureNames = [
    "Bump", "Crossing", "Give_Way", "Junction", "No_Exit", "Railway", "Roundabout", "Station", "Stop", "Traffic_Calming", "Traffic_Signal"
  ];


  useEffect(() => {
    fetch('http://localhost:8080/json/street_names')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched street names:', data); // Check the fetched street names
        setStreetNames(data); // Store all the street names in state
      })
      .catch((error) => console.error('Error fetching street names:', error));
  }, []);

  useEffect(() => {
    const [streetName, cityName, countyName] = selectedStreet.split(',');
    console.log('Fetching road data for:', streetName, cityName, countyName);

    fetch(`http://localhost:8080/json/road_features_with_severity?street_name=${encodeURIComponent(streetName)}&city_name=${encodeURIComponent(cityName)}&county_name=${encodeURIComponent(countyName)}`)
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched road data:', data); // Log the road data
        if (data && Array.isArray(data) && data.length > 0) {
          setRoadData(data);
        } else {
          console.log('No data available for the selected street.');
          setRoadData([]); // Set empty if no data
        }
      })
      .catch((error) => {
        console.error('Error fetching road feature data:', error);
        setRoadData([]); // Set empty if there is an error fetching
      });

    // Fetch feature combinations data
    fetch('/average_severities_combinations.json')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched feature combinations:', data); // Log the feature combinations data
        if (data && Object.keys(data).length > 0) {
          setFeatureCombinations(data);
        } else {
          console.log('No feature combinations data found.');
          setFeatureCombinations({});
        }
      })
      .catch((error) => {
        console.error('Error fetching the feature combinations data:', error);
        setFeatureCombinations({});
      });
  }, [selectedStreet]);

  const toggleFeature = (feature: string) => {
    
    const updatedStreetData = roadData.map((streetData) => {
      const full_name = streetData.street_name+','+streetData.city_name+','+streetData.county_name;
      if (full_name === selectedStreet) {
        
        return {
          ...streetData,
          [feature]: !streetData[feature], // Toggle the feature value
        };
      }
      return streetData;
    });
    setRoadData(updatedStreetData);
  };

  useEffect(() => {
    // console.log('test', roadData);
    const selectedStreetData = roadData.find((data) => {
      const [streetName, cityName, countyName] = selectedStreet.split(',');
      // console.log('test 2', streetName, countyName, cityName);
      return (
        data.street_name === streetName &&
        data.city_name === cityName &&
        data.county_name === countyName
      );
    });

    if (selectedStreetData) {
      // console.log('test', selectedStreetData);
      const newActiveFeatures = featureNames.filter(
        (feature) => selectedStreetData[feature] === true
      );

      setActiveFeatures(newActiveFeatures); // Set the active features state
    }
  }, [roadData, selectedStreet]); 

  const calculateRisk = (selectedStreetData: any, featureCombinations: any): number => {
    console.log('Selected street data:', selectedStreetData);
  
    // Check if featureNames and selectedStreetData are populated
    if (!featureNames || !Array.isArray(featureNames)) {
      console.error('Error: featureNames is not an array.');
      return 2;
    }
    
    if (!selectedStreetData || typeof selectedStreetData !== 'object') {
      console.error('Error: selectedStreetData is not a valid object.');
      return 2;
    }
  
    // Log feature names to verify if they match the keys in selectedStreetData
    console.log('Feature Names:', featureNames);
  
    const activeFeatureKeys = featureNames
    .filter((feature) => {
      const featureKey = feature.toLowerCase();
      const value = selectedStreetData[featureKey];
      console.log(`Feature "${feature}" (normalized) value: ${value}`);
      return value; // Ensure it's truthy (non-null, non-undefined)
    })
    .map((feature) => {
      console.log(`Feature "${feature}" is active.`);
      return feature;
    });
  
  
    console.log('Active features selected:', activeFeatureKeys);
  
    let predictedSeverity = 2;
  
    if (activeFeatureKeys.length === 0) {
      console.log('No active features selected. Returning default severity of 2.');
      return predictedSeverity;
    }
  
    const normalizedFeatureKeys = activeFeatureKeys.map((feature) =>
      feature.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    );
  
    const featureCombination = normalizedFeatureKeys.join(' AND ') + ' = True';
    console.log(`Checking combination: ${featureCombination}`);
  
    console.log('Available feature combinations keys:', Object.keys(featureCombinations));
  
    if (featureCombinations[featureCombination]) {
      predictedSeverity = featureCombinations[featureCombination];
      console.log(`Combination found: ${featureCombination} => Severity: ${predictedSeverity}`);
    } else {
      console.log(`Combination not found: ${featureCombination}. Returning default severity of 2.`);
    }
  
    console.log('Final predicted severity:', predictedSeverity);
    return predictedSeverity;
  };
  
  

  const handlePredictSeverity = () => {
    const selectedStreetData = roadData.find((data) => {
      const [streetName, cityName, countyName] = selectedStreet.split(',');
      return (
        data.street_name === streetName &&
        data.city_name === cityName &&
        data.county_name === countyName
      );
    });
    console.log('setelected' ,selectedStreetData);
    if (selectedStreetData && featureCombinations) {
      const newSeverity = calculateRisk(selectedStreetData, featureCombinations);
      setAccidentRisk(newSeverity);
    }
  };

  const handleStreetChange = (newStreet: string) => {
    setSelectedStreet(newStreet.toUpperCase());
    setSearchTerm(newStreet.toUpperCase());
  };

  const selectedStreetData = roadData.find((data) => {
    const [streetName, cityName, countyName] = selectedStreet.split(',');
    return (
      data.street_name === streetName &&
      data.city_name === cityName &&
      data.county_name === countyName
    );
  });

  if (!selectedStreetData) {
    return <Typography>Loading...</Typography>;
  }

  const featureLabels = Object.keys(selectedStreetData).filter(
    (feature) => feature !== 'average_severity' && feature !== 'street_name' && feature !== 'city_name' && feature !== 'county_name'
  );

  const featureValues = featureLabels.map((feature) => (selectedStreetData[feature] ? 1 : 0));

  console.log('Feature Labels:', featureLabels);
  console.log('Feature Values:', featureValues);

  return (
    <Box sx={{ p: 3, display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', backgroundColor: '#f9f9f9', borderRadius: '10px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
      <Box sx={{ flex: 1, maxWidth: '500px' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5', marginBottom: '15px' }}>
          Road Feature Analysis
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
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

        <Paper elevation={3} sx={{ p: 3, backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
          <Typography variant="h6" sx={{ fontSize: '1.2rem', marginBottom: '20px', color: '#333' }}>
            Selected Street: {selectedStreet}
          </Typography>

          <FormGroup>
            <Grid container spacing={2}>
              {featureLabels.map((feature) => (
                <Grid item xs={6} key={feature}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedStreetData[feature]}
                        onChange={() => toggleFeature(feature)}
                        sx={{ color: '#3f51b5' }}
                      />
                    }
                    label={feature.charAt(0).toUpperCase() + feature.slice(1).replace(/_/g, ' ')}
                  />
                </Grid>
              ))}
            </Grid>
          </FormGroup>

          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold', fontSize: '1.2rem', color: accidentRisk !== null && accidentRisk >= 3 ? 'red' : 'green' }}>
            Current Severity: {parseFloat(selectedStreetData.average_severity).toFixed(3)}
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ flex: 1, maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: 600 }}>
          <Bar
            data={{
              labels: featureLabels,
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
                  max: 1,
                },
              },
            }}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePredictSeverity}
            sx={{
              width: '100%',
              fontWeight: 'bold',
              fontSize: '1rem',
              backgroundColor: accidentRisk !== null && accidentRisk >= 3 ? '#e57373' : '#81c784',
            }}
            startIcon={<TrafficOutlined />}
          >
            Predict Accident Risk
          </Button>

          {accidentRisk !== null && (
            <Typography variant="h6" sx={{ mt: 2, fontSize: '1.4rem', fontWeight: 'bold', textAlign: 'center', color: accidentRisk >= 3 ? 'red' : 'green' }}>
              Predicted Severity: {accidentRisk.toFixed(3)}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};
export default AdminRoadFeatureAnalysis;
