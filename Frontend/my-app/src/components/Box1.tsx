import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Box1 = () => {
  const [data, setData] = useState({
    labels: [],
    datasets: [{
      label: 'Percentage of Accidents Involving Different Road Features',
      data: [],
      backgroundColor: 'rgb(153, 102, 255)',
      borderColor: 'rgb(153, 102, 255)',
      borderWidth: 1
    }]
  });

  const [top3, setTop3] = useState<{ feature: string, percentage: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8082/road_features');
      const responseData = response.data;

      console.log('Fetched data:', responseData);

      setData({
        labels: responseData.labels,
        datasets: [{
          label: '',
          data: responseData.data,
          backgroundColor: 'rgb(153, 102, 255)',
          borderColor: 'rgb(153, 102, 255)',
          borderWidth: 1
        }]
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error loading data');
      setLoading(false);
    }
  };

  const fetchTop3Data = async () => {
    try {
      const response = await axios.get('http://localhost:8082/top3_road_features');
      const responseData = response.data;

      console.log('Fetched top 3 data:', responseData);

      setTop3(responseData);
    } catch (err) {
      console.error('Error fetching top 3 data:', err);
      setError('Error loading data');
    }
  };

  useEffect(() => {
    fetchData();
    fetchTop3Data();
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
    <div className="container">
      <div className="container1">
        <h3 className="box1-topic">Top 3 Features</h3>
        <div className="twoboxes">
          {top3.map((item, index) => (
            <div key={index} className={`raw${index + 1}`}>
              <h1 className="money"> {item.percentage.toLocaleString()} %</h1>
              <h1 className="text">{item.feature}</h1>
            </div>
          ))}
        </div>
      </div>

      <div className="container2">
        <h1 className="box1-topic">Percentage of Accidents Involving Different Road Features</h1> 
        <div className="chart">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default Box1;
