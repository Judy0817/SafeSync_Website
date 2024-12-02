import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import './AccidentGraphs.css'; // Import custom styles

const RoadFeatureSeverity: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchRoadFeatureData = async () => {
      try {
        const response = await axios.get('http://localhost:8082/road_feature_by_severity');
        const features = response.data.road_features;

        // Prepare data for the chart
        const labels = features.map((feature: any) => feature.road_feature);
        const severity1 = features.map((feature: any) => feature.severity_1);
        const severity2 = features.map((feature: any) => feature.severity_2);
        const severity3 = features.map((feature: any) => feature.severity_3);
        const severity4 = features.map((feature: any) => feature.severity_4);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Severity 1',
              data: severity1,
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
            },
            {
              label: 'Severity 2',
              data: severity2,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
            {
              label: 'Severity 3',
              data: severity3,
              backgroundColor: 'rgba(255, 206, 86, 0.6)',
            },
            {
              label: 'Severity 4',
              data: severity4,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching road feature data:', error);
      }
    };

    fetchRoadFeatureData();
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
      <h1 className="box1-topic">Accidents by Severity Level for Each Road Feature</h1>
      <div className="chart-Line">
        {chartData && <Bar data={chartData} options={options} />}
      </div>
    </div>
  );
};

export default RoadFeatureSeverity;
