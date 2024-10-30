import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import './AccidentGraphs.css'; // Import custom styles

const AccidentGraphs: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2019);
  const [graphData, setGraphData] = useState<any>(null);

  const years = [2019, 2020, 2021, 2022, 2023];

  useEffect(() => {
    const fetchData = async (year: number) => {
      try {
        const response = await axios.get(`http://localhost:8080/accidents_${year}`);
        setGraphData({
          labels: response.data.labels,
          datasets: [
            {
              label: `Accidents in ${year}`,
              data: response.data.data,
              borderColor: year === 2019 ? '#1E90FF' : year === 2020 ? '#32CD32': year === 2021 ? '#32CD32': year === 2022 ? '#32CD32' : '#FF4500',
              backgroundColor: year === 2019 
                ? 'rgba(30, 144, 255, 0.2)' 
                : year === 2020 
                ? 'rgba(50, 205, 50, 0.2)' 
                : 'rgba(255, 69, 0, 0.2)',
              fill: true,
              tension: 0.1, // Smooth curve
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(selectedYear);
  }, [selectedYear]);

  const options = {
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#333', // Change legend label color
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#333',
        bodyColor: '#333',
      },
    },
    responsive: true,
    maintainAspectRatio: false, // Allow chart to adjust height
    scales: {
      x: {
        grid: {
          color: '#e0e0e0',
        },
      },
      y: {
        grid: {
          color: '#e0e0e0',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="accident-graphs-container">
      <div className="year-select-container">
        <label htmlFor="year-select">Select Year: </label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="year-select"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="graph-container">
        <h3 className="graph-title">Accidents in {selectedYear}</h3>
        {graphData && <Line data={graphData} options={options} />}
      </div>
    </div>
  );
}

export default AccidentGraphs;
