

import React from 'react';
import { Doughnut, Pie } from 'react-chartjs-2';
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

function Box5() {
  const labels = ['Accident Happend', 'Not Happend'];
  const data=  {
    labels: labels,
    datasets: [
      {
        label: 'Predicting Accident',
        data: [80,20],
        circumference:180,
        rotation:270,
        backgroundColor: ['rgb(153, 102, 255)','#7e7a7a'],
        
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


  return (

    <div className="container_box5">
      <div className="container6">
      <h1 className="box1-topic">2023 revenue compare to previous year</h1> 
      <div className="chart-Doughnut">
        <Doughnut data={data} />
      </div>
      </div>
    </div>
    
    
  );
}

export default Box5;