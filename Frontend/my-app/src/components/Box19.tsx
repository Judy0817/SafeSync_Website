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

const AccidentSeverityGraph: React.FC = () => {
    const [graphData, setGraphData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSeverity, setSelectedSeverity] = useState<number>(2); // Default severity level
    const [accidentCountsBySeverity, setAccidentCountsBySeverity] = useState<any>({});

    useEffect(() => {
        // Fetch accident severity data from the backend API
        const fetchAccidentSeverityData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8080/per_severity_year_count'); // Replace with your API URL
                const data = response.data.accident_severity_counts;

                // Prepare accident counts by severity
                const countsBySeverity = prepareCountsBySeverity(data);
                setAccidentCountsBySeverity(countsBySeverity);

                // Set default graph data for the selected severity level
                prepareGraphData(countsBySeverity[selectedSeverity]);
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchAccidentSeverityData();
    }, [selectedSeverity]);

    const prepareCountsBySeverity = (data: any[]) => {
        return data.reduce((acc, accident) => {
            const severity = accident.severity;
            if (!acc[severity]) {
                acc[severity] = [];
            }
            acc[severity].push({ year: accident.year, count: accident.number_of_accidents });
            return acc;
        }, {});
    };

    const prepareGraphData = (data: { year: number; count: number }[]) => {
        const years = data.map(item => item.year);
        const counts = data.map(item => item.count);

        setGraphData({
            labels: years,
            datasets: [
                {
                    label: `Number of Accidents for Severity ${selectedSeverity}`,
                    data: counts,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
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
            <h1 className="box1-topic">Accidents by Year for Selected Severity</h1>
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
