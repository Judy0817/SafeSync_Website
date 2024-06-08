import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer>
      <div>
      <div className="name">
        <p>
          University of Sri Jayewardenepura
          <br />
          Gangodawila, Nugegoda, Sri Lanka.
        </p>
      </div>

      <div className="name">
        <p>
          +94 11 2758000, +94 11 2802022
          <br />
          +94 11 2801024, +94 11 2801025
        </p>
      </div>

      <div className="text-center p-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
        © 2023 Copyright:
        <p>
          {/* <a href="https://www.sjp.ac.lk/" target="_blank" rel="noopener noreferrer">
            info@sjp.ac.lk
          </a> */}
        </p>
      </div>
    </div>
    </footer>
  );
};

export default Footer;
