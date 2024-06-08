import React from 'react';
import { Line } from 'react-chartjs-2';
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

function Box2() {
  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  const data: { labels: string[]; datasets: CustomDataset[] } = {
    labels: labels,
    datasets: [
      {
        label: 'Expenses by Month',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgb(153, 102, 255)',
        borderWidth: 2,
        fill: true,
        pointBorderColor: 'black',
        
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      y: {
        // min:3,
        // max:6
      },
    },
  };

  return (

    <div className="container3">
      <h1 className="box1-topic">2023 revenue compare to previous year</h1> 
      <div className="chart-Line">
        <Line data={data} options={options} />
      </div>
    </div>
    
  );
}

export default Box2;