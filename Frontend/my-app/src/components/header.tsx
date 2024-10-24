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

      <div className="main-topic">MENU</div>
      <Link to="/" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faChartLine} />
        </span>
        Graph Sub-Topic
      </Link>

      <div className="main-topic">PRO VERSION</div>
      <Link to="/" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Light Sub-Topic
        
      </Link>
      <Link to="/" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Light Sub-Topic
        
      </Link>
      <Link to="/" className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faLightbulb} />
        </span>
        Light Sub-Topic
        
      </Link>

      <div className="main-topic">UI COMPONENTS</div>
      <div className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faGem} />
        </span>
        Diamond Sub-Topic
      </div>
      <div className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faGem} />
        </span>
        Diamond Sub-Topic
      </div>
      <div className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faGem} />
        </span>
        Diamond Sub-Topic
      </div>
      <div className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faGem} />
        </span>
        Diamond Sub-Topic
      </div>

      <div className="main-topic">WIDGETS</div>
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

      <div className="main-topic">CHARTS</div>
      <div className="sub-topic with-icon">
        <span className="icon">
          <FontAwesomeIcon icon={faPencilAlt} />
        </span>
        Pencil Sub-Topic
      </div>

      <div className="main-topic">MENU</div>
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
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/">Profile</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/notify"><FontAwesomeIcon icon={faBell} /></Link>
            <div className="list">
            <button onClick={goToAnalyzeData} className='button-analyzedata'>Analyze Data</button>
            <button type="button" className='button-signOut'>Sign Out</button>
           
            </div>
            
          </div>
          
        </nav>
      </div>
    </header>
  );
};

export default Header;
