import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

function LiquiditySummaryCard({ title, data }) {
  return (
    <div className="lg:col-span-4">
      <div className="bg-surface rounded-lg p-6 shadow-card">
        <h3 className="text-lg font-medium text-textPrimary mb-4">{title}</h3>
        
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{item.dex.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-textPrimary">{item.dex}</p>
                  <p className="text-sm text-textSecondary">{item.pair}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-textPrimary">{item.liquidity}</p>
                <div className="flex items-center space-x-1">
                  {item.change24h > 0 ? (
                    <TrendingUp className="w-3 h-3 text-success" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-error" />
                  )}
                  <span className={`text-xs ${item.change24h > 0 ? 'text-success' : 'text-error'}`}>
                    {Math.abs(item.change24h)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LiquiditySummaryCard;