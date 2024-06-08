

import React from 'react';
import { Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  PointElement,
  Legend,
  Tooltip,

} from 'chart.js';
import IncomeStatement from './Incomestatement';

ChartJS.register(
  ArcElement,
  PointElement,
  Legend,
  Tooltip,
);

function Box3() {
  const labels = ['January', 'February', 'March', 'April'];
  const data=  {
    labels: labels,
    datasets: [
      {
        label: 'Expenses by Month',
        data: [65, 59, 80, 81],
        backgroundColor: ['rgb(153, 102, 255)','rgba(211, 133, 222, 0.8)','rgba(222, 133, 179, 0.8)','aqua'],
        
      },
    ],
  };

  const legendOptions = {
    align: 'center', // Align the legend to the center
    position: 'bottom', // Place the legend at the bottom
    labels: {
      boxWidth: 10, // Adjust box width if needed
      padding: 15, // Adjust padding if needed
    },
  };

  const options = {
    plugins: {
      legend: legendOptions,
    },
  };
  const revenue = 50000;
  const expenses = 30000;


  return (

    <div className="container_box3">
      <div className="container4">
      <h1 className="box1-topic">2023 revenue compare to previous year</h1> 
      <div className="chart-Pie">
        <Pie data={data} />
      </div>
      </div>

      <div className="container5">
      <IncomeStatement revenue={revenue} expenses={expenses} />
      </div>
    </div>
    
    
  );
}

export default Box3;