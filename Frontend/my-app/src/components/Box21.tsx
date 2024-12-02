import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import './AccidentGraphs.css';

const WindSpeedGraph: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<number | null>(null);

  useEffect(() => {
    const fetchWindSpeedData = async () => {
      try {
        const response = await axios.get('http://localhost:8084/average_wind_speed');
        const data = response.data.average_wind_speeds;

        // Prepare labels and data for the bar chart
        const labels = [...new Set(data.map((item: any) => item.time_of_day))];
        const datasets = [];

        // Group by severity level for the bar chart
        for (let severity = 1; severity <= 4; severity++) {
          const severityData = data.filter((item: any) => item.severity === severity);
          const averageWindSpeeds = labels.map((time) => {
            const found = severityData.find((item: any) => item.time_of_day === time);
            return found ? found.average_wind_speed : 0;
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
          allData: data, // Store the full data for pie chart filtering
        });
      } catch (error) {
        console.error('Error fetching wind speed data:', error);
      }
    };

    fetchWindSpeedData();
  }, []);

  const handleSeverityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeverity(Number(event.target.value));
  };

  // Pie chart data for selected severity level
  const getPieChartData = () => {
    if (selectedSeverity === null || !chartData) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
          },
        ],
      };
    }

    const filteredData = chartData.allData.filter(
      (item: any) => item.severity === selectedSeverity
    );

    const labels = [...new Set(filteredData.map((item: any) => item.time_of_day))];
    const data = labels.map((time) => {
      const found = filteredData.find((item: any) => item.time_of_day === time);
      return found ? found.average_wind_speed : 0;
    });

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        },
      ],
    };
  };

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
            display: false, // Ensure data labels do not show on the bars
        },
    },
};

const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'left' as const, // Position the legend on the left side
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
        display: false, // Ensure data labels do not show on the bars
    },
    },

  };
  

  return (
    <div className="container_box3">
      <div className="container5">
      <h1 className="box1-topic">Average Wind Speed by Time of Day and Severity Level</h1>
      <div className="chart-controls">
        <label htmlFor="severity-select">Select Severity Level:</label>
        <select id="severity-select" onChange={handleSeverityChange}>
          <option value="">All Severities</option>
          <option value="1">Severity 1</option>
          <option value="2">Severity 2</option>
          <option value="3">Severity 3</option>
          <option value="4">Severity 4</option>
        </select>
      </div>
      <div className="chart-content">
        {selectedSeverity ? (
          getPieChartData() ? (
            <div className='chart-content-pie'>
                <Pie data={getPieChartData()} options={pieChartOptions}/>
            </div>
            
          ) : (
            <p>No data available for the selected severity.</p>
          )
        ) : (
          chartData && <Bar data={chartData} options={options} />
        )}
      </div>
    </div>
    </div>
  );
};

export default WindSpeedGraph;
