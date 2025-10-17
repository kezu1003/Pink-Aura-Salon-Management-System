import React from 'react';

const PieChart = ({ data, width = 300, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-[#FEF4F1] rounded-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#FBAA99]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#FBAA99]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <p className="text-[#4D423A]/60">No data available for chart</p>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 20;

  let currentAngle = 0;
  const colors = [
    '#FBAA99', '#4D423A', '#000000', '#FEF4F1', 
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
  ];

  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    const color = colors[index % colors.length];
    
    currentAngle += angle;
    
    return {
      pathData,
      color,
      percentage,
      label: item.label,
      value: item.value
    };
  });

  return (
    <div className="w-full">
      <div className="flex justify-center mb-6">
        <svg width={width} height={height} className="drop-shadow-lg">
          {segments.map((segment, index) => (
            <g key={index}>
              <path
                d={segment.pathData}
                fill={segment.color}
                stroke="white"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
              />
              {/* Percentage labels */}
              {segment.percentage > 5 && (
                <text
                  x={centerX + (radius * 0.7) * Math.cos(((segments.slice(0, index).reduce((sum, s) => sum + (s.value / total) * 360, 0) + (segment.value / total) * 180) - 90) * (Math.PI / 180))}
                  y={centerY + (radius * 0.7) * Math.sin(((segments.slice(0, index).reduce((sum, s) => sum + (s.value / total) * 360, 0) + (segment.value / total) * 180) - 90) * (Math.PI / 180))}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-bold fill-white"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {Math.round(segment.percentage)}%
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-[#FEF4F1] rounded-lg">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: segment.color }}
            ></div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[#4D423A] truncate">{segment.label}</div>
              <div className="text-sm text-[#4D423A]/60">
                {segment.value} enrollments ({segment.percentage.toFixed(1)}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
