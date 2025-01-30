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
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [accidentCountsByYear, setAccidentCountsByYear] = useState<any>({});

    useEffect(() => {
        // Fetch accident severity data from the backend API
        const fetchAccidentSeverityData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8080/time/per_severity_year_count'); // Replace with your API URL
                const data = response.data.accident_severity_counts;

                // Prepare accident counts by year
                const countsByYear = prepareCountsByYear(data);
                setAccidentCountsByYear(countsByYear);

                // Set default selected year to the first available year
                const defaultYear = Object.keys(countsByYear)[0];
                setSelectedYear(defaultYear ? parseInt(defaultYear) : null);
                prepareGraphData(countsByYear[defaultYear]);
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchAccidentSeverityData();
    }, []);

    const prepareCountsByYear = (data: any[]) => {
        return data.reduce((acc, accident) => {
            const year = accident.year;
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push({ severity: accident.severity, count: accident.number_of_accidents });
            return acc;
        }, {});
    };

    const prepareGraphData = (data: { severity: number; count: number }[]) => {
        const severities = data.map(item => `Severity ${item.severity}`);
        const counts = data.map(item => item.count);

        setGraphData({
            labels: severities,
            datasets: [
                {
                    label: 'Number of Accidents by Severity',
                    data: counts,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
            ],
        });
    };

    const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = parseInt(event.target.value);
        setSelectedYear(selected);
        if (accidentCountsByYear[selected]) {
            prepareGraphData(accidentCountsByYear[selected]);
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
            <h1 className="box1-topic">Accidents by Severity Level</h1>
            <select value={selectedYear || ''} onChange={handleYearChange}>
                {Object.keys(accidentCountsByYear).map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
            <div className="chart-Line">
                {graphData && <Bar data={graphData} options={options} />}
            </div>
        </div>
    );
};

export default AccidentSeverityGraph;