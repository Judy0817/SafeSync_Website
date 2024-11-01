import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const RoadFeaturesGraphs: React.FC = () => {
    const [selectedCity, setSelectedCity] = useState<string>('Houston'); // Default city
    const [graphData, setGraphData] = useState<any>(null);
    const [cities, setCities] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Sample data to replace with an API call if necessary
    const roadFeaturesData = {
        road_features: [
            { city: "Austin", crossing: 16876, give_way: 837, junction: 2669, railway: 289, stop: 1237, traffic_signal: 30348 },
            { city: "Baton Rouge", crossing: 4788, give_way: 160, junction: 1922, railway: 1614, stop: 866, traffic_signal: 16761 },
            { city: "Charlotte", crossing: 36396, give_way: 907, junction: 4255, railway: 3763, stop: 2226, traffic_signal: 49226 },
            { city: "Dallas", crossing: 23336, give_way: 79, junction: 8702, railway: 1369, stop: 1500, traffic_signal: 33150 },
            { city: "Houston", crossing: 26774, give_way: 4817, junction: 7530, railway: 2887, stop: 16501, traffic_signal: 52494 },
            { city: "Los Angeles", crossing: 12331, give_way: 42, junction: 18719, railway: 3243, stop: 5033, traffic_signal: 19934 },
            { city: "Miami", crossing: 50600, give_way: 509, junction: 9108, railway: 1417, stop: 8540, traffic_signal: 27442 },
            { city: "Nashville", crossing: 17134, give_way: 93, junction: 4648, railway: 232, stop: 622, traffic_signal: 11627 },
            { city: "Orlando", crossing: 43149, give_way: 8, junction: 1769, railway: 544, stop: 1469, traffic_signal: 23599 },
            { city: "Raleigh", crossing: 30636, give_way: 1733, junction: 3726, railway: 95, stop: 2988, traffic_signal: 28046 }
        ]
    };

    // Extract cities from data
    useEffect(() => {
        const citiesList = roadFeaturesData.road_features.map((feature) => feature.city);
        setCities(citiesList);
        fetchData('Austin'); // Fetch data for default city
    }, []);

    // Fetch data based on selected city
    const fetchData = (city: string) => {
        const cityData = roadFeaturesData.road_features.find((feature) => feature.city === city);
        if (cityData) {
            setGraphData({
                labels: ['Crossing', 'Give Way', 'Junction', 'Railway', 'Stop', 'Traffic Signal'],
                datasets: [
                    {
                        label: `Road Features in ${city}`,
                        data: [
                            cityData.crossing,
                            cityData.give_way,
                            cityData.junction,
                            cityData.railway,
                            cityData.stop,
                            cityData.traffic_signal
                        ],
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            });
        }
    };

    // Update data when the selected city changes
    useEffect(() => {
        fetchData(selectedCity);
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
            <h1 className="box1-topic">Road Features Data by City</h1>
      
            <div>
                <label htmlFor="city-select">Select City: </label>
                <select
                    id="city-select"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="select"
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
                {graphData && <Bar data={graphData} options={options} />}
            </div>
        </div>
    );
};

export default RoadFeaturesGraphs;
