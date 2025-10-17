import React from 'react';

const CompanyLogo = ({ width = 60, height = 60, color = '#FBAA99' }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Woman's profile silhouette */}
      <path
        d="M20 25 Q25 15 35 20 Q40 18 45 25 Q50 20 55 25 Q60 18 65 20 Q75 15 80 25 Q82 30 80 40 Q78 50 75 60 Q70 70 65 75 Q60 80 55 78 Q50 80 45 78 Q40 80 35 75 Q30 70 25 60 Q22 50 20 40 Q18 30 20 25 Z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
      />
      
      {/* Hibiscus flower on head */}
      <g transform="translate(50, 20)">
        {/* Flower petals */}
        <ellipse cx="0" cy="0" rx="8" ry="12" fill={color} transform="rotate(0)" />
        <ellipse cx="0" cy="0" rx="8" ry="12" fill={color} transform="rotate(72)" />
        <ellipse cx="0" cy="0" rx="8" ry="12" fill={color} transform="rotate(144)" />
        <ellipse cx="0" cy="0" rx="8" ry="12" fill={color} transform="rotate(216)" />
        <ellipse cx="0" cy="0" rx="8" ry="12" fill={color} transform="rotate(288)" />
        
        {/* Flower center */}
        <circle cx="0" cy="0" r="3" fill={color === '#FBAA99' ? '#4D423A' : '#FBAA99'} />
      </g>
      
      {/* Hair flow */}
      <path
        d="M25 30 Q30 35 35 40 Q40 45 45 50 Q50 55 55 50 Q60 45 65 40 Q70 35 75 30"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CompanyLogo;
