import React from 'react';
import './PhoneFrame.css';

const PhoneFrame = ({ children }) => {
  return (
    <div className="phone-frame">
      <div className="phone-bezel">
        <div className="phone-notch">
          <div className="notch-camera"></div>
          <div className="notch-speaker"></div>
        </div>
        <div className="phone-screen">
          <div className="status-bar">
            <span>9:41</span>
            <div className="status-icons">
              <span className="signal"></span>
              <span className="wifi"></span>
              <span className="battery"></span>
            </div>
          </div>
          <div className="screen-content">
            {children}
          </div>
          <div className="home-indicator"></div>
        </div>
      </div>
    </div>
  );
};

export default PhoneFrame;
