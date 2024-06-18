import React, { useState, useEffect } from 'react';
import { Doughnut, Pie } from 'react-chartjs-2';
import axios from 'axios';

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
);

// function Box3() {
//   const labels = ['January', 'February', 'March', 'April'];
//   const data=  {
//     labels: labels,
//     datasets: [
//       {
//         label: 'Expenses by Month',
//         data: [65, 59, 80, 81],
//         backgroundColor: ['rgb(153, 102, 255)','rgba(211, 133, 222, 0.8)','rgba(222, 133, 179, 0.8)','aqua'],
        
//       },
//     ],
//   };
//-----------------------------------------------
  const Box3 = () => {
    const [data, setData] = useState({
      labels: [],
      datasets: [{
        label: 'Percentage of Accidents Involving Different Road Features',
        data: [],
        backgroundColor: ['rgb(153, 102, 255)','rgba(211, 133, 222, 0.8)','rgba(222, 133, 179, 0.8)','aqua'],
        borderColor: 'rgb(153, 102, 255)',
        borderWidth: 1
      }]
    });
  
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | string>(null);
  
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/severity_distribution');
        const responseData = response.data;
  
        console.log('Fetched data:', responseData);
  
        setData({
          labels: responseData.labels,
          datasets: [{
            label: '',
            data: responseData.data,
            backgroundColor: ['rgb(153, 102, 255)','rgba(211, 133, 222, 0.8)','rgba(222, 133, 179, 0.8)','aqua'],
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

    <div className="container_box3">
      <div className="container4">
      <h1 className="box1-topic">Distribution of Accident Severity</h1> 
      <div className="chart-Pie">
        <Pie data={data} />
      </div>
      </div>
    </div>
    
    
  );
}

export default Box3;