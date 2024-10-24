import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  Chart as ChartJS,
  ArcElement,
  PointElement,
  Legend,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  PointElement,
  Legend,
  Tooltip,
  ChartDataLabels // Register the datalabels plugin
);

const Box3 = () => {
  const [data, setData] = useState({
    labels: [],
    datasets: [{
      label: 'Weather Condition Distribution',
      data: [],
      backgroundColor: [
        'rgb(153, 102, 255)',
        'rgba(211, 133, 222, 0.8)',
        'rgba(222, 133, 179, 0.8)',
        'aqua',
        'rgb(255, 159, 64)',
        'rgb(75, 192, 192)',
        'rgb(255, 99, 132)',
      ],
      borderColor: 'rgba(255, 255, 255, 0.6)',
      borderWidth: 1,
    }]
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/weather_conditions');
      const responseData = response.data;

      console.log('Fetched data:', responseData);

      setData({
        labels: responseData.labels,
        datasets: [{
          label: 'Weather Condition Distribution',
          data: responseData.data,
          backgroundColor: [
            'rgb(153, 102, 255)',
            'rgba(211, 133, 222, 0.8)',
            'rgba(222, 133, 179, 0.8)',
            'aqua',
            'rgb(255, 159, 64)',
            'rgb(75, 192, 192)',
            'rgb(255, 99, 132)',
          ],
          borderColor: 'rgba(255, 255, 255, 0.6)',
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
    plugins: {
      datalabels: {
        formatter: (value: number, context: any) => {
          const sum = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / sum) * 100).toFixed(1) + '%';
          return percentage;
        },
        color: '#fff',
        labels: {
          title: {
            font: {
              weight: 'bold' as 'bold' | 'normal' | 'bolder' | 'lighter'
            }
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem: any) {
            const data = tooltipItem.dataset.data;
            const total = data.reduce((acc: number, curr: number) => acc + curr, 0);
            const currentValue = data[tooltipItem.dataIndex];
            const percentage = Math.floor(((currentValue / total) * 100) + 0.5);         
            return `${tooltipItem.label}: ${percentage}% (${currentValue})`;
          }
        }
      }
    }
  };

  return (
    <div className="container_box3">
      <div className="container4">
        <h1 className="box1-topic">Weather Condition Distribution</h1>
        <div className="chart-Doughnut">
          <Doughnut data={data} options={options} />
        </div>
      </div>
    </div>
  );
}

export default Box3;
