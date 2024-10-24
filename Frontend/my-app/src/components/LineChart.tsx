// LineChart.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';

interface LineChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  };
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  return (
    <div>
      <Line data={data} key={JSON.stringify(data)} />
    </div>
  );
};

export default LineChart;
