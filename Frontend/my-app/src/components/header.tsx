import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { faArrowLeft, faBars, faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon,  } from '@fortawesome/react-fontawesome';
import { faChartLine, faLightbulb, faGem, faCar, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

const Header: React.FC = () => {

    const [isDropdownVisible, setDropdownVisibility] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisibility(!isDropdownVisible);
  };
  const hideDropdown = () => {
    setDropdownVisibility(false);
  };

  const navigate = useNavigate();
  const goToAnalyzeData = () => {

    // This will navigate to second component
    navigate('/analyzeData');
};

const goToLoginPage = () => {

  // This will navigate to second component
  navigate('/');
};

  return (
    <header>
      <div className="header-content">
        <nav>
          <div className="nav-links">
          <div className="menu-container">
          <FontAwesomeIcon icon={faBars} className="menu1" onClick={toggleDropdown}/>
          {isDropdownVisible && (
          <div className="dropdown-menu">
              <div className="dropdown-menu">
              {isDropdownVisible && (
                <FontAwesomeIcon icon={faBars} className="menu2" onClick={hideDropdown}/>
       
      )}
      
      <div className="main-topic"> DASHBOARDS</div>
      <div className="main-topic">Different Dashboards</div>
      <Link to="/severity_distribution" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Severity Distribution
      </Link>
      <Link to="/total_accident" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Accident Overview
        
      </Link>
      <Link to="/weather" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Weather Impact Analysis
        
      </Link>
      <Link to="/roadfeature" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Road Feature Analysis
        
      </Link>
      <Link to="/timeAnalysis" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Time Based Analysis
        
      </Link>


      <div className="main-topic"> Accident Overview</div>
      <Link to="/severity_distribution" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Severity Distribution
      </Link>
      <Link to="/total_accident" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Accident Hotspot
      </Link>
      <Link to="/total_accident" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        City-Wise Statistics
      </Link>
      <Link to="/map" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Interactive Map View
      </Link>

      <div className="main-topic"> Weather Impact Analysis</div>
      <Link to="/total_accident" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Weather Condition dashboard
      </Link>
      <Link to="/total_accident" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Seasonal Analysis
      </Link>
      <Link to="/total_accident" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Humidity and Temperature
      </Link>
      <Link to="/total_accident" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Precipitation and Visibility Impact
      </Link>

      <div className="main-topic"> Road Feature Analysis</div>
      <Link to="/total_accident" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Road Hazard Heatmap
      </Link>
      <Link to="/total_accident" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Feature-Based Severity
      </Link>
      <Link to="/total_accident" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        City-Specific Road Features
      </Link>
      <Link to="/total_accident" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Risky Intersections
      </Link>

      <div className="main-topic"> Time-Based Analysis</div>
      <Link to="/total_accident" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Hourly Trends
      </Link>
      <Link to="/total_accident" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Day of the Week Analysis
      </Link>
      <Link to="/total_accident" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Monthly and Yearly Comparisons
      </Link>
      <Link to="/total_accident" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Holiday and Event Impact
      </Link>


      <div className="main-topic">Road Feature Impact Analysis</div>
      <div className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faCar} />
        </span>
        Car Sub-Topic
      </div>
      <div className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faCar} />
        </span>
        Car Sub-Topic
      </div>

      <div className="main-topic">Time based Trends</div>
      <div className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faPencilAlt} />
        </span>
        Pencil Sub-Topic
      </div>

      
      <div className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faChartLine} />
        </span>
        Graph Sub-Topic
      </div>

      <div className="main-topic">PRO VERSION</div>
      <div className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Light Sub-Topic
      </div>
      <div className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Light Sub-Topic
      </div>
      <div className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Light Sub-Topic
      </div>
    </div>

    
          </div>
        )}
          </div>
            <Link to="/homePage">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/">Profile</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/notify"><FontAwesomeIcon icon={faBell} /></Link>
            <div className="list">
            <button onClick={goToAnalyzeData} className='button-analyzedata'>Analyze Data</button>
            <button onClick={goToLoginPage} type="button" className='button-signOut'>Sign Out</button>
           
            </div>
            
          </div>
          
        </nav>
      </div>
    </header>
  );
};

export default Header;
