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

const PerHourAccidentsGraph: React.FC = () => {
    const [graphData, setGraphData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<string>('Monday'); // Default to Monday
    const [accidentCountsByDay, setAccidentCountsByDay] = useState<any>({});

    useEffect(() => {
        // Fetch accident data from the backend API
        const fetchAccidentData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8080/per_hour_count'); // Replace with your API URL
                const data = response.data;

                // Prepare accident counts by day
                const countsByDay = prepareCountsByDay(data.daywise_accident_counts);
                setAccidentCountsByDay(countsByDay);
                prepareGraphData(countsByDay[selectedDay]);
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchAccidentData();
    }, []);

    const prepareCountsByDay = (data: any[]) => {
        return data.reduce((acc, accident) => {
            const day = accident.day;
            if (!acc[day]) {
                acc[day] = new Array(24).fill(0); // Initialize counts for each hour
            }
            acc[day][accident.hour] += accident.accident_count; // Aggregate the counts
            return acc;
        }, {});
    };

    const prepareGraphData = (data: number[]) => {
        const hours = Array.from({ length: 24 }, (_, i) => i.toString()); // Create an array of hour labels

        setGraphData({
            labels: hours,
            datasets: [
                {
                    label: 'Number of Accidents per Hour',
                    data: data,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                },
            ],
        });
    };

    const handleDayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = event.target.value;
        setSelectedDay(selected);
        if (accidentCountsByDay[selected]) {
            prepareGraphData(accidentCountsByDay[selected]); // Update graph data based on the selected day
        }
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
            <h1 className="box1-topic">Accidents by Hour of the Day</h1>
            <select value={selectedDay} onChange={handleDayChange}>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
            </select>
            <div className="chart-Line">
                {graphData && <Bar data={graphData} options={options} />}
            </div>
        </div>
    );
};

export default PerHourAccidentsGraph;
