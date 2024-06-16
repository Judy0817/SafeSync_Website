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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/road_features');
      const responseData = response.data;

      console.log('Fetched data:', responseData);

      setData({
        labels: responseData.labels,
        datasets: [{
          label: 'Percentage of Accidents Involving Different Road Features',
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

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="container">
        <div className="container1">
          <h3 className="box1-topic">Revenue Actual vs Target</h3>
          <div className="twoboxes">
            <div className="raw1">
              <h1 className="money">$ 120,000</h1><h1 className="text">Revenue Target</h1>
            </div>
            <div className="raw2">
              <h1 className="money">$ 120,000</h1><h1 className="text">Revenue Target</h1>
            </div>
            <div className="raw3">
              <h1 className="money">$ 120,000</h1><h1 className="text">Revenue Target</h1>
            </div>
          </div>
        </div>

        <div className="container2">
          <h1 className="box1-topic">2023 Revenue Compare to Previous Year</h1> 
          <div className="chart">
            <Bar data={data} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Box1;
