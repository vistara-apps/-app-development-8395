import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function AnalyticsChart({ title, data, variant = 'line' }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-textPrimary font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {variant === 'line' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface rounded-lg p-6 shadow-card">
      <h3 className="text-lg font-medium text-textPrimary mb-4">{title}</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {variant === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF" 
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="uniswap" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Uniswap V3"
              />
              <Line 
                type="monotone" 
                dataKey="sushiswap" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="SushiSwap"
              />
              <Line 
                type="monotone" 
                dataKey="curve" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Curve"
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9CA3AF" 
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="volume" 
                fill="#06D6A0" 
                name="Volume ($)"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AnalyticsChart;