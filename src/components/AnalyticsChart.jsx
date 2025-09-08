import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const AnalyticsChart = ({ variant = 'line', data, title, subtitle }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-bg rounded-lg p-3 shadow-card">
          <p className="text-textPrimary font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${entry.dataKey === 'slippage' ? '%' : entry.dataKey.includes('volume') || entry.dataKey.includes('liquidity') ? 'K' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (variant) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 25%, 25%)" />
            <XAxis dataKey="name" stroke="hsl(0, 0%, 70%)" />
            <YAxis stroke="hsl(0, 0%, 70%)" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="volume" fill="hsl(210, 80%, 50%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="liquidity" fill="hsl(170, 70%, 40%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 25%, 25%)" />
            <XAxis dataKey="name" stroke="hsl(0, 0%, 70%)" />
            <YAxis stroke="hsl(0, 0%, 70%)" />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="slippage" 
              stroke="hsl(170, 70%, 40%)" 
              fill="hsl(170, 70%, 40%)" 
              fillOpacity={0.3}
            />
          </AreaChart>
        );
      default:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 25%, 25%)" />
            <XAxis dataKey="name" stroke="hsl(0, 0%, 70%)" />
            <YAxis stroke="hsl(0, 0%, 70%)" />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="volume" 
              stroke="hsl(210, 80%, 50%)" 
              strokeWidth={3}
              dot={{ fill: 'hsl(210, 80%, 50%)', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="liquidity" 
              stroke="hsl(170, 70%, 40%)" 
              strokeWidth={3}
              dot={{ fill: 'hsl(170, 70%, 40%)', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-surface rounded-lg p-6 border border-bg shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-textPrimary">{title}</h3>
        {subtitle && <p className="text-sm text-textSecondary mt-1">{subtitle}</p>}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;