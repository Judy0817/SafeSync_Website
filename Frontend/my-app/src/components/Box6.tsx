import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  // Import datalabels plugin if you are using it
  // Datalabels,
} from 'chart.js';

// Register the necessary components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  // Register the datalabels plugin if you use it
  // Datalabels,
);

const Box6 = () => {
  const [data, setData] = useState({
    labels: [],
    datasets: [{
      label: 'Total Accidents Per Year',
      data: [],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }]
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [average, setAverage] = useState<number | null>(null);
  const [median, setMedian] = useState<number | null>(null);
  const [percentageChanges, setPercentageChanges] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8083/total_accidents'); // Update the endpoint if needed
      const responseData = response.data;

      console.log('Fetched data:', responseData);

      const accidentData = responseData.data;

      // Calculate Average
      const avg = accidentData.reduce((sum: number, val: number) => sum + val, 0) / accidentData.length;
      setAverage(avg);

      // Calculate Median
      const sortedData = [...accidentData].sort((a, b) => a - b);
      const medianValue = sortedData.length % 2 === 0
        ? (sortedData[sortedData.length / 2 - 1] + sortedData[sortedData.length / 2]) / 2
        : sortedData[Math.floor(sortedData.length / 2)];
      setMedian(medianValue);

      // Calculate Year-to-Year Percentage Change
      const percentChanges = accidentData.slice(1).map((currentValue: number, i: number) => {
        const previousValue = accidentData[i];
        const change = ((currentValue - previousValue) / previousValue * 100).toFixed(2);
        return `${responseData.labels[i + 1]}: ${change}% change`;
      });
      setPercentageChanges(percentChanges);

      // Update Chart Data
      setData({
        labels: responseData.labels,
        datasets: [{
          label: 'Total Accidents Per Year',
          data: responseData.data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        }]
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error loading data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    <div className="container_box3">
      <div className="statistics-summary" style={{ display: 'flex' }}>
        <div className="left-side" style={{ flex: 1, paddingRight: '10px' }}>
          <p><strong>Average Accidents:</strong> {average?.toFixed(2)}</p>
          <p><strong>Median Accidents:</strong> {median}</p>
          <ul>
            {percentageChanges.map((change, index) => (
              <li key={index}>{change}</li>
            ))}
          </ul>
        </div>
        <div className="container2">
        <h1 className="box1-topic">Total Accidents Per Year</h1> 
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
}

export default Box6;
