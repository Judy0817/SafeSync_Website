import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useNavigate } from 'react-router-dom';
import './analyzedata.css';

const AnalyzeData: React.FC = () => {
  const navigate = useNavigate();

  const goToAnalyzeRoadData = () => {
    navigate('/analyze_road_data');
  };

  const goToAnalyzeWeatherData = () => {
    navigate('/analyze_road_weather_data');
  };

  return (
    <div className="analyze-container">
      <main className="main-content">
        <div className="box">
          <h2>Analyze Road Feature Data</h2>
          <p>
            Explore how different road features like speed bumps, crossings, and traffic signals
            influence accident predictions. This analysis helps understand the correlation between
            road features and accident severity.
          </p>
          <button onClick={goToAnalyzeRoadData} className="button-analyzedata1">
            Analyze Data
          </button>
        </div>

        <div className="box">
          <h2>Analyze Road + Weather Data</h2>
          <p>
            Dive deeper into accident prediction by analyzing both road features and weather data.
            Weather conditions such as temperature, humidity, and visibility play a crucial role in
            accident severity. Combine both data sets to gain a comprehensive understanding.
          </p>
          <button onClick={goToAnalyzeWeatherData} className="button-analyzedata2">
            Analyze Data
          </button>
        </div>
      </main>
    </div>
  );
};

export default AnalyzeData;
