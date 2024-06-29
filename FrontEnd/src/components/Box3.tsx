import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

const AccidentGraphs: React.FC = () => {
  const [data2019, setData2019] = useState<any>(null);
  const [data2020, setData2020] = useState<any>(null);
  const [data2021, setData2021] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response2019 = await axios.get('http://localhost:8080/accidents_2019');
        const response2020 = await axios.get('http://localhost:8080/accidents_2020');
        const response2021 = await axios.get('http://localhost:8080/accidents_2021');

        setData2019({
          labels: response2019.data.labels,
          datasets: [
            {
              label: 'Accidents in 2019',
              data: response2019.data.data,
              borderColor: 'blue',
              backgroundColor: 'rgba(0, 0, 255, 0.1)',
              fill: true,
            },
          ],
        });

        setData2020({
          labels: response2020.data.labels,
          datasets: [
            {
              label: 'Accidents in 2020',
              data: response2020.data.data,
              borderColor: 'green',
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              fill: true,
            },
          ],
        });

        setData2021({
          labels: response2021.data.labels,
          datasets: [
            {
              label: 'Accidents in 2021',
              data: response2021.data.data,
              borderColor: 'red',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              fill: true,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const options = {
    plugins: {
      datalabels: {
        display: false, // Disable datalabels plugin
      },
    },
    responsive: true, // Ensure responsiveness of the chart
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div className="dashboard-box3-in">
        <h3 className="box1-topic">Accidents in 2019</h3>
        {data2019 && <Line data={data2019} options={options} />}
      </div>
      <div className="dashboard-box3-in">
        <h3 className="box1-topic">Accidents in 2020</h3>
        {data2020 && <Line data={data2020} options={options} />}
      </div>
      <div className="dashboard-box3-in">
        <h3 className="box1-topic">Accidents in 2021</h3>
        {data2021 && <Line data={data2021} options={options} />}
      </div>
    </div>
  );
}

export default AccidentGraphs;
