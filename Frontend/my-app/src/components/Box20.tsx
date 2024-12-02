import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AccidentSeverityGraph: React.FC = () => {
    const [graphData, setGraphData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSeverity, setSelectedSeverity] = useState<number>(1); // Default severity level
    const [weatherData, setWeatherData] = useState<any>(null);

    useEffect(() => {
        // Fetch accident weather data from the backend API
        const fetchWeatherData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8084/average_weather_severity'); // Replace with your API URL

                console.log('API response:', response.data);  // Debugging line to inspect the data

                if (!response.data || !Array.isArray(response.data.severities)) {
                    throw new Error("Invalid data format received from API.");
                }

                // Set the weather data received from API
                setWeatherData(response.data);

                // Prepare graph data for the default selected severity
                prepareGraphData(response.data, selectedSeverity);
                setLoading(false);
            } catch (err: any) {
                console.error('Error fetching weather data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchWeatherData();
    }, [selectedSeverity]);

    // Prepare graph data for the selected severity level
    const prepareGraphData = (data: any, severity: number) => {
        const severityIndex = severity - 1; // Adjust for 0-based index
        
        setGraphData({
            labels: ['Humidity', 'Temperature', 'Visibility', 'Wind Speed'],
            datasets: [
                {
                    label: `Weather Conditions for Severity ${severity}`,
                    data: [
                        data.humidities[severityIndex],
                        data.temperatures[severityIndex],
                        data.visibilities[severityIndex],
                        data.wind_speeds[severityIndex],
                    ],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',  // Humidity
                        'rgba(153, 102, 255, 0.6)', // Temperature
                        'rgba(255, 159, 64, 0.6)',   // Visibility
                        'rgba(255, 99, 132, 0.6)',   // Wind Speed
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 99, 132, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        });
    };

    const handleSeverityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = parseInt(event.target.value);
        setSelectedSeverity(selected);
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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="container3">
            <h1 className="box1-topic">Weather Conditions for Selected Severity</h1>
            <select value={selectedSeverity} onChange={handleSeverityChange}>
                <option value="1">Severity 1</option>
                <option value="2">Severity 2</option>
                <option value="3">Severity 3</option>
                <option value="4">Severity 4</option>
            </select>
            <div className="chart-Line">
                {graphData && <Bar data={graphData} options={options} />}
            </div>
        </div>
    );
};

export default AccidentSeverityGraph;
