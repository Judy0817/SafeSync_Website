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
        const response = await axios.get(`http://localhost:8080/time/accidents_${year}`);
        setGraphData({
          labels: response.data.labels,
          datasets: [
            {
              label: `Reports in ${year}`,
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
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        enabled: true, // Enable tooltip, but not displaying values on bars
      },
      // Disable data labels
      datalabels: {
        display: false, // Make sure data labels do not show on the bars
      },
    },
  };

  return (
    <div className="container3">
      <h1 className="box1-topic">No of Reports in {selectedYear} Moderates Over time</h1>
        <div>
          <label htmlFor="type-select">Select Year: </label>
          <select
            id="type-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="type-select"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

        </div>
      <div className="chart-Line">
        
        {graphData && <Line data={graphData} options={options} />}
      </div>
    </div>
  );
}

export default AccidentGraphs;
