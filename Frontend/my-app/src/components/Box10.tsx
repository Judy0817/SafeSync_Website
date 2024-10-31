import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import './AccidentGraphs.css'; // Import custom styles

const AverageWeatherConditions: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/average_weather_severity');
        setChartData({
          labels: response.data.severities,
          datasets: [
            {
              label: 'Temperature (°F)',
              data: response.data.temperatures,
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
            },
            {
              label: 'Humidity (%)',
              data: response.data.humidities,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
            {
              label: 'Wind Speed (mph)',
              data: response.data.wind_speeds,
              backgroundColor: 'rgba(255, 206, 86, 0.6)',
            },
            {
              label: 'Visibility (mi)',
              data: response.data.visibilities,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherData();
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
      <h1 className="box1-topic">Average Weather Conditions by Severity Level</h1>
      <div className="chart-Line">
        {chartData && <Bar data={chartData} options={options} />}
      </div>
    </div>
  );
};

export default AverageWeatherConditions;
