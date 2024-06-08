
import LineChart from './LineChart';
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
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

  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  const initialData = {
    labels: labels,
    datasets: [{
      label: 'Expenses by Month',
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: ['rgb(153, 102, 255)'],
      borderColor: ['rgb(153, 102, 255)'],
      borderWidth: 1
    }]
  };

  const [data, setData] = useState(initialData);

  const updateData = () => {
    setData({
      ...data,
      datasets: [{
        ...data.datasets[0],
        data: [1, 2, 4, 8, 16, 32, 64]
      }]
    });
    console.log('After Update:', data);
  };

  // Call updateData whenever you want to update the chart data
  // For example, you can call it in response to a button click or another event.
  // In this example, it's called when the component is mounted.

  useEffect(() => {
    updateData();
  }, []);

//postgresql
//go
  return (
    <div>
      <div className="container">
        <div className="container1">
          <h3 className="box1-topic">Revenu actual vs Target</h3>
         <div className="twoboxes">
            <div className="raw1">
              <h1 className="money">$ 120,000</h1><h1 className="text">Revenu Target</h1>
            </div>
            <div className="raw2">
              <h1 className="money">$ 120,000</h1><h1 className="text">Revenu Target</h1>
            </div>
            <div className="raw3">
              <h1 className="money">$ 120,000</h1><h1 className="text">Revenu Target</h1>
            </div>
         </div>
        </div>

        <div className="container2">
          <h1 className="box1-topic">2023 revenue compare to previous year</h1> 
         
          <div className="chart">
          <Bar data={data} />
          </div>
       
          <button onClick={updateData}>Update Data</button>
        </div>
      </div>
    </div>
  )
}

export default Box1
