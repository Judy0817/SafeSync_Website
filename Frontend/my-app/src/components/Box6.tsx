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
} from 'chart.js';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
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

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/total_accidents'); // Update the endpoint if needed
      const responseData = response.data;

      console.log('Fetched data:', responseData);

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
        callbacks: {
          label: (tooltipItem: { label: any; raw: any; }) => `Year: ${tooltipItem.label}, Count: ${tooltipItem.raw}`,
        },
      },
    },
  };

  return (
    <div className="container_box3">
      <div className="container4">
        <h1 className="box1-topic">Total Accidents Per Year</h1>
        <div className="chart-Bar">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
}

export default Box6;
