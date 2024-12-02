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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RoadFeaturesGraphs: React.FC = () => {
    const [selectedStreet, setSelectedStreet] = useState<string>('I-10 E'); // Default street
    const [graphData, setGraphData] = useState<any>(null);
    const [roadFeaturesData, setRoadFeaturesData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch data from the backend API
        const fetchRoadFeaturesData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8082/road_feature_street'); // Replace with your API URL
                const data = response.data;
                setRoadFeaturesData(data.road_features); // Store the entire dataset
                setLoading(false);
                fetchStreetData(selectedStreet, data.road_features); // Fetch initial data for the default street
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchRoadFeaturesData();
    }, [selectedStreet]);

    const fetchStreetData = (street: string, data: any[]) => {
        const streetData = data.find((feature: any) => feature.street === street);
        if (streetData) {
            setGraphData({
                labels: ['Crossing', 'Give Way', 'Junction', 'Railway', 'Stop', 'Traffic Signal'],
                datasets: [
                    {
                        label: `Road Features in ${street}`,
                        data: [
                            streetData.crossing,
                            streetData.give_way,
                            streetData.junction,
                            streetData.railway,
                            streetData.stop,
                            streetData.traffic_signal
                        ],
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            });
        }
    };

    const handleStreetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newStreet = event.target.value;
        setSelectedStreet(newStreet);
        fetchStreetData(newStreet, roadFeaturesData); // Update graph data based on selected street
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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="container3">
            <h1 className="box1-topic">Road Features Data by Street</h1>
      
            <div>
                <label htmlFor="street-select">Select Street: </label>
                <select
                    id="street-select"
                    value={selectedStreet}
                    onChange={handleStreetChange}
                    className="select"
                >
                    <option value="">Choose a street</option>
                    {roadFeaturesData.map((feature) => (
                        <option key={feature.street} value={feature.street}>
                            {feature.street}
                        </option>
                    ))}
                </select>
            </div>

            <div className="chart-Line">
                {graphData && <Bar data={graphData} options={options} />}
            </div>
        </div>
    );
};

export default RoadFeaturesGraphs;
