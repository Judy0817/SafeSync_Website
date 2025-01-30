import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import './AccidentGraphs.css'; // Import custom styles

const WindSpeedGraph: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchWindSpeedData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/weather/average_wind_speed'); // Update this endpoint as necessary
        const data = response.data.average_wind_speeds;

        // Prepare labels and data for the chart
        const labels = [...new Set(data.map((item: any) => item.time_of_day))]; // Unique time_of_day
        const datasets = [];

        // Group by severity level and create datasets
        for (let severity = 1; severity <= 4; severity++) {
          const severityData = data.filter((item: any) => item.severity === severity);
          const averageWindSpeeds = labels.map((time) => {
            const found = severityData.find((item: any) => item.time_of_day === time);
            return found ? found.average_wind_speed : 0; // Default to 0 if no data
          });

          datasets.push({
            label: `Severity ${severity}`,
            data: averageWindSpeeds,
            backgroundColor: `rgba(${(severity * 60) % 255}, ${(severity * 100) % 255}, ${(severity * 200) % 255}, 0.6)`,
          });
        }

        setChartData({
          labels,
          datasets,
        });
      } catch (error) {
        console.error('Error fetching wind speed data:', error);
      }
    };

    fetchWindSpeedData();
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
      <h1 className="box1-topic">Average Wind Speed by Time of Day and Severity Level</h1>
      <div className="chart-Line">
        {chartData && <Bar data={chartData} options={options} />}
      </div>
    </div>
  );
};

export default WindSpeedGraph;