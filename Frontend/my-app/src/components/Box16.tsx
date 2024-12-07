import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';

import {
  Chart as ChartJS,
  ArcElement,
  Legend,
  Tooltip,
} from 'chart.js';

ChartJS.register(ArcElement, Legend, Tooltip);

const WeekdayWeekendAccidentPieChart: React.FC = () => {
  const [data, setData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string;
      borderWidth: number;
    }[];
  }>({
    labels: ['Weekday', 'Weekend'],
    datasets: [{
      label: 'Accident Counts',
      data: [],
      backgroundColor: ['#36A2EB', '#FF6384'],
      borderColor: '#fff',
      borderWidth: 1,
    }],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/time/day_wise_count');
      const responseData = response.data.daywise_accident_counts; // Adjust this line if needed
  
      console.log('Fetched data:', responseData); // Log the fetched data
  
      // Aggregate counts
      let weekdayCount = 0;
      let weekendCount = 0;
  
      responseData.forEach((item: { day_type: string; accident_count: number }) => {
        if (item.day_type === 'Weekday') {
          weekdayCount += item.accident_count;
        } else if (item.day_type === 'Weekend') {
          weekendCount += item.accident_count;
        }
      });
  
      setData({
        labels: ['Weekday', 'Weekend'],
        datasets: [{
          label: 'Accident Counts',
          data: [weekdayCount, weekendCount],
          backgroundColor: ['#36A2EB', '#FF6384'],
          borderColor: '#fff',
          borderWidth: 1,
        }],
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
      legend: {
        display: true,
      },
      tooltip: {
        enabled: true,
      },
      datalabels: {
        anchor: 'center' as const,
        align: 'center' as const,
        formatter: (value: number, context: any) => {
          const total = context.chart.data.datasets[0].data.reduce((acc: any, val: any) => acc + val, 0);
          const percentage = ((value / total) * 100).toFixed(2);
          return `${percentage}%`; // Return the percentage as a string
        },
        color: '#fff', // Set color for the labels
        font: {
          weight: 'bold' as const, // Optional: make the font bold
        },
      },
    },
  };
  
  return (
    <div className="container_box3">
      <div className="container4">
        <h1 className="box1-topic">Accident Count: Weekday vs Weekend</h1>
        <div className="chart-Pie">
          <Pie data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default WeekdayWeekendAccidentPieChart;