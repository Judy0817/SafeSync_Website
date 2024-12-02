import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Legend,
  Tooltip,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Legend,
  Tooltip,
  Filler
);

interface CustomDataset {
  label: string;
  data: (number | { x: string; y: number })[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  fill: boolean;
}

const Box2: React.FC = () => {
  const [data, setData] = useState<{ labels: string[], datasets: CustomDataset[] }>({
    labels: [],
    datasets: [{
      label: 'Accident Data',
      data: [],
      backgroundColor: 'rgba(153, 102, 255, 0.5)',
      borderColor: 'rgb(153, 102, 255)',
      borderWidth: 1,
      fill: true,
    }]
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [streets, setStreets] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('city'); // To determine if city or street is selected

  // Fetch cities
  const fetchCities = async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      console.log('Fetching cities...');
      const response = await axios.get('http://localhost:8081/top_city');
      console.log('Response data:', response.data);
      if (Array.isArray(response.data)) {
        setCities(response.data);
      } else if (response.data.cities) {
        setCities(response.data.cities);
      } else {
        console.error('Unexpected data format:', response.data);
        setCities([]);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
      setError('Failed to load cities');
    } finally {
      setLoading(false); // Set loading to false after fetch attempt
    }
  };

  // Fetch streets
  const fetchStreets = async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      console.log('Fetching streets...');
      const response = await axios.get('http://localhost:8081/top_street');
      console.log('Response data:', response.data);
      if (Array.isArray(response.data)) {
        setStreets(response.data);
      } else if (response.data.streets) {
        setStreets(response.data.streets);
      } else {
        console.error('Unexpected data format:', response.data);
        setStreets([]);
      }
    } catch (err) {
      console.error('Error fetching streets:', err);
      setError('Failed to load streets');
    } finally {
      setLoading(false); // Set loading to false after fetch attempt
    }
  };

  useEffect(() => {
    fetchCities();
    fetchStreets();
  }, []);

  useEffect(() => {
    if (selectedType === 'city') {
      fetchData('top_city'); // Fetch data for the top 20 cities automatically
    } else if (selectedType === 'street') {
      fetchData('top_street'); // Fetch data for the top 20 streets when selected
    }
  }, [selectedType]);

  const handleTypeChange = (type: string) => {
    console.log('Type changed to:', type); // Debug log
    setSelectedType(type);
    setData({ labels: [], datasets: [] }); // Reset chart data
  };

  const fetchData = async (endpoint: string) => {
    console.log('Fetching data for:', endpoint); // Debug log
    try {
      const response = await axios.get(`http://localhost:8081/${endpoint}`);
      const responseData = response.data;

      console.log('Data Response:', responseData); // Log the response data for chart

      setData({
        labels: responseData.labels,
        datasets: [{
          label: selectedType === 'city' ? 'Accidents in Top 20 Cities' : 'Accidents on Top 20 Streets',
          data: responseData.data,
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgb(153, 102, 255)',
          borderWidth: 1,
          fill: true,
        }]
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error loading data');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        enabled: true, // Enable tooltip, but not displaying values on bars
      },
      // Disable data labels
      datalabels: {
        display: false, // Make sure data labels do not show on the bars
      },
    },
  };

  return (
    <div className="container3">
      <h1 className="box1-topic">Total Accident Data In City and Street</h1>

      <div>
        <label htmlFor="type-select">Select Type:</label>
        <select id="type-select" onChange={(e) => handleTypeChange(e.target.value)}>
          <option value="city">City</option>
          <option value="street">Street</option>
        </select>
      </div>

      <div className="chart-Line">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

export default Box2;
