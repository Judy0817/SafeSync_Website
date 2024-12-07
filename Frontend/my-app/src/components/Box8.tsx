import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2'; // Import Line instead of Bar
import './AccidentGraphs.css'; // Import custom styles
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Legend,
    Tooltip,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Legend,
    Tooltip,
    Filler
);

const AccidentGraphs: React.FC = () => {
    const [selectedCity, setSelectedCity] = useState<string>('Chippewa Falls'); // Set default city name to "Chippewa Falls"
    const [graphData, setGraphData] = useState<any>(null);
    const [cities, setCities] = useState<string[]>([]); // State to hold city names
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch city names once when the component mounts
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await axios.get('http://localhost:8080/location/get_cities');
                setCities(response.data.cities);
                // Automatically fetch data for the default city if it exists in the fetched cities
                if (response.data.cities.includes(selectedCity)) {
                    fetchData(selectedCity); // Fetch data for default city
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
                setError('Failed to load cities');
            }
        };

        fetchCities();
    }, []); // Empty dependency array to run only once

    // Fetch data based on selected city
    const fetchData = async (city: string) => {
        if (!city) return; // Prevent fetching if no city is selected

        setLoading(true); // Set loading to true before fetching
        try {
            const response = await axios.get(`http://localhost:8080/location/top_10_streets_per_city?city=${city}`);
            setGraphData({
                labels: response.data.labels, // Assuming response.data.labels contains the labels for the x-axis
                datasets: [
                    {
                        label: `Accident Count for Top Streets in ${city}`,
                        data: response.data.data, // Assuming response.data.data contains the accident counts
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                        fill: true, // Fill under the line
                    },
                ],
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load data');
        } finally {
            setLoading(false); // Set loading to false after fetch attempt
        }
    };

    // Effect to fetch data whenever the selected city changes
    useEffect(() => {
        fetchData(selectedCity); // Call fetchData only if selectedCity has changed
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
            <h1 className="box1-topic">Accident Data for Each City Street</h1>
            
            <div>
                <label htmlFor="city-select">Select City: </label>
                <select
                    id="city-select"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="type-select"
                >
                    <option value="">Choose a city</option>
                    {cities.map((city) => (
                        <option key={city} value={city}>
                            {city}
                        </option>
                    ))}
                </select>
            </div>
            

            <div className="chart-Line">
                {loading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div>{error}</div>
                ) : (
                    graphData && <Line data={graphData} options={options} />
                )}
            </div>
        </div>
    );
};

export default AccidentGraphs;
