import React from 'react';

const Loader = ({ size = 40, className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 120 120" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A90E2"/>
            <stop offset="100%" stopColor="#357ABD"/>
          </linearGradient>
        </defs>

        {/* Background Circle */}
        <circle cx="60" cy="60" r="50" stroke="#E6EEF8" strokeWidth="8" fill="none"/>

        {/* Animated Loader Circle */}
        <circle cx="60" cy="60" r="50"
                stroke="url(#blueGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="314"
                strokeDashoffset="220">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 60 60"
            to="360 60 60"
            dur="1s"
            repeatCount="indefinite"/>
        </circle>

        {/* Martini Icon (center) */}
        <g transform="translate(60,60) scale(0.8)">
          <line x1="-15" y1="15" x2="15" y2="15" stroke="#357ABD" strokeWidth="2"/>
          <polygon points="-12,-10 12,-10 0,5" fill="none" stroke="#357ABD" strokeWidth="2"/>
          <line x1="0" y1="5" x2="0" y2="15" stroke="#357ABD" strokeWidth="2"/>
        </g>
      </svg>
    </div>
  );
};

export default Loader;
