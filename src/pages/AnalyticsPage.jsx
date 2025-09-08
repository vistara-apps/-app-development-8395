import React, { useState } from 'react';
import { Calendar, Filter, Download, TrendingUp, TrendingDown } from 'lucide-react';
import AnalyticsChart from '../components/AnalyticsChart';
import { mockChartData, mockTradeHistory } from '../data/mockData';

const AnalyticsPage = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const timeframes = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' }
  ];

  const metrics = [
    { value: 'all', label: 'All Metrics' },
    { value: 'volume', label: 'Volume' },
    { value: 'slippage', label: 'Slippage' },
    { value: 'fees', label: 'Fees' }
  ];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-textPrimary">Trading Analytics</h2>
          <p className="text-textSecondary">Track your trading performance and costs</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-textSecondary" />
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-surface border border-bg rounded-lg px-3 py-2 text-textPrimary focus:border-primary outline-none"
            >
              {timeframes.map(tf => (
                <option key={tf.value} value={tf.value}>{tf.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-textSecondary" />
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="bg-surface border border-bg rounded-lg px-3 py-2 text-textPrimary focus:border-primary outline-none"
            >
              {metrics.map(metric => (
                <option key={metric.value} value={metric.value}>{metric.label}</option>
              ))}
            </select>
          </div>
          
          <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg p-6 border border-bg shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-textSecondary text-sm">Total Volume</p>
              <p className="text-2xl font-bold text-textPrimary">$127.5K</p>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="flex items-center space-x-1 mt-2">
            <TrendingUp className="w-3 h-3 text-success" />
            <span className="text-sm text-success">+12.5%</span>
            <span className="text-sm text-textSecondary">vs last period</span>
          </div>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-bg shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-textSecondary text-sm">Avg. Slippage</p>
              <p className="text-2xl font-bold text-textPrimary">0.142%</p>
            </div>
            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-accent" />
            </div>
          </div>
          <div className="flex items-center space-x-1 mt-2">
            <TrendingDown className="w-3 h-3 text-success" />
            <span className="text-sm text-success">-0.023%</span>
            <span className="text-sm text-textSecondary">improvement</span>
          </div>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-bg shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-textSecondary text-sm">Total Fees</p>
              <p className="text-2xl font-bold text-textPrimary">$342.18</p>
            </div>
            <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-warning" />
            </div>
          </div>
          <div className="flex items-center space-x-1 mt-2">
            <TrendingUp className="w-3 h-3 text-error" />
            <span className="text-sm text-error">+5.2%</span>
            <span className="text-sm text-textSecondary">vs last period</span>
          </div>
        </div>

        <div className="bg-surface rounded-lg p-6 border border-bg shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-textSecondary text-sm">Total Trades</p>
              <p className="text-2xl font-bold text-textPrimary">48</p>
            </div>
            <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
          <div className="flex items-center space-x-1 mt-2">
            <TrendingUp className="w-3 h-3 text-success" />
            <span className="text-sm text-success">+8 trades</span>
            <span className="text-sm text-textSecondary">vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          variant="line"
          data={mockChartData}
          title="Volume & Liquidity Trends"
          subtitle="Trading volume and available liquidity over time"
        />
        <AnalyticsChart
          variant="area"
          data={mockChartData}
          title="Slippage Analysis"
          subtitle="Average slippage percentage across all trades"
        />
      </div>

      <AnalyticsChart
        variant="bar"
        data={mockChartData}
        title="DEX Performance Comparison"
        subtitle="Volume and liquidity by exchange"
      />

      {/* Trade History Table */}
      <div className="bg-surface rounded-lg border border-bg shadow-card">
        <div className="p-6 border-b border-bg">
          <h3 className="text-lg font-semibold text-textPrimary">Recent Trade History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-textSecondary">Time</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-textSecondary">Pair</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-textSecondary">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-textSecondary">Price</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-textSecondary">Slippage</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-textSecondary">Fees</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-textSecondary">DEX</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg">
              {mockTradeHistory.map((trade) => (
                <tr key={trade.id} className="hover:bg-bg/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-textSecondary">{trade.timestamp}</td>
                  <td className="px-6 py-4 text-sm text-textPrimary font-medium">
                    {trade.from} → {trade.to}
                  </td>
                  <td className="px-6 py-4 text-sm text-textPrimary">{trade.amount}</td>
                  <td className="px-6 py-4 text-sm text-textPrimary">{trade.price}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`${parseFloat(trade.slippage) < 0.15 ? 'text-success' : 'text-warning'}`}>
                      {trade.slippage}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-textPrimary">{trade.fees}</td>
                  <td className="px-6 py-4 text-sm text-textSecondary">{trade.dex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;