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
  pointBorderColor?: string;
  tension?: number;
}

const Box2: React.FC = () => {
  const [data, setData] = useState<{ labels: string[], datasets: CustomDataset[] }>({
    labels: [],
    datasets: [{
      label: 'Percentage of Accidents Involving Different Road Features',
      data: [],
      backgroundColor: 'rgb(153, 102, 255)',
      borderColor: 'rgb(153, 102, 255)',
      borderWidth: 1,
      fill: true,
    }]
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/top_city');
        const responseData = response.data;

        console.log('Fetched data:', responseData);

        setData({
          labels: responseData.labels,
          datasets: [{
            label: '',
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

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const options = {
    plugins: {
      datalabels: {
        display: false, // Disable datalabels plugin
      },
    },
  };

  return (
    <div className="container3">
      <h1 className="box1-topic">No Of Accidents In Top 20 Cities</h1>
      <div className="chart-Line">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

export default Box2;
