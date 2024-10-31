import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import './AccidentGraphs.css'; // Import custom styles

const AccidentGraphs: React.FC = () => {
    const [selectedCity, setSelectedCity] = useState<string>('Wind_Direction');
  const [graphData, setGraphData] = useState<any>(null);
  const cities = ['Temperature(F)', 'Wind_Chill(F)', 'Humidity(%)', 'Pressure(in)', 'Visibility(mi)', 'Wind_Direction', 'Wind_Speed(mph)', 'Precipitation(in)', 'Weather_Condition']; // Replace with actual city names

  useEffect(() => {
    const fetchData = async (city: string) => {
      if (!city) return;

      try {
        const response = await axios.get(`http://localhost:8080/weather_conditions_count?weather_feature=${city}`);
        setGraphData({
          labels: response.data.labels,
          datasets: [
            {
              label: `Top 10 Streets by Accident Count in ${city}`,
              data: response.data.data,
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(selectedCity);
  }, [selectedCity]);

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
      <h1 className="box1-topic">Top 10 values by Accident Count in Different Weather Features</h1>
      <label htmlFor="city-select">Select Weather Feature: </label>
      <select
        id="city-select"
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
        className="type-select"
      >
        <option value="">Choose a weather feature</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      <div className="chart-bar">
        
        {graphData && <Bar data={graphData} options={options} />}
      </div>
    </div>
  );
};

export default AccidentGraphs;
