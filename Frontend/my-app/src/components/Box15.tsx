import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

const DaywiseAccidentCountGraph: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchAccidentCountData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/day_wise_count'); // Update with correct endpoint
        const data = response.data.daywise_accident_counts;

        // Prepare labels and data for the chart
        const labels = data.map((item: any) => item.day_name);
        const accidentCounts = data.map((item: any) => item.accident_count);

        // Group by day type and set background color
        const backgroundColors = data.map((item: any) =>
          item.day_type === 'Weekday' ? 'rgba(54, 162, 235, 0.6)' : 'rgba(255, 99, 132, 0.6)'
        );

        setChartData({
          labels,
          datasets: [
            {
              label: 'Accident Count',
              data: accidentCounts,
              backgroundColor: backgroundColors,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching accident count data:', error);
      }
    };

    fetchAccidentCountData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
        legend: {
            display: true,
            labels: {
                color: '#333',
                font: { size: 14 },
            },
        },
        tooltip: {
            backgroundColor: '#fff',
            titleColor: '#333',
            bodyColor: '#333',
        },
        datalabels: {
            display: false, // Make sure data labels do not show on the bars
        },
    },
    scales: {
        x: {
            grid: { color: '#e0e0e0' },
        },
        y: {
            grid: { color: '#e0e0e0' },
            beginAtZero: true,
        },
    },
};

  return (
    <div className="container3">
      <h1 className="box1-topic">Accident Count by Day Name and Type</h1>
      <div className="chart-Line">
        {chartData && <Bar data={chartData} options={options} />}
      </div>
    </div>
  );
};

export default DaywiseAccidentCountGraph;
