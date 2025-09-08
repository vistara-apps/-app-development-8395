import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const LiquiditySummaryCard = ({ dex, isSelected, onClick }) => {
  const isOptimal = dex.slippage === '0.08%' || dex.slippage === '0.12%';
  
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-card ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-surface bg-surface hover:border-primary/50'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{dex.logo}</span>
          <div>
            <h3 className="font-semibold text-textPrimary">{dex.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-textSecondary">
              <Activity className="w-3 h-3" />
              <span>Liquidity: ${dex.liquidity}</span>
            </div>
          </div>
        </div>
        {isOptimal && (
          <div className="bg-success/20 text-success px-2 py-1 rounded text-xs font-medium">
            OPTIMAL
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-textSecondary">Price</div>
          <div className="font-medium text-textPrimary">${dex.price}</div>
        </div>
        <div>
          <div className="text-textSecondary">Fee</div>
          <div className="font-medium text-textPrimary">{dex.fee}</div>
        </div>
        <div>
          <div className="text-textSecondary">Slippage</div>
          <div className={`font-medium flex items-center space-x-1 ${
            parseFloat(dex.slippage) < 0.15 ? 'text-success' : 'text-warning'
          }`}>
            {parseFloat(dex.slippage) < 0.15 ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <TrendingUp className="w-3 h-3" />
            )}
            <span>{dex.slippage}</span>
          </div>
        </div>
        <div>
          <div className="text-textSecondary">24h Volume</div>
          <div className="font-medium text-textPrimary">${dex.volume24h}</div>
        </div>
      </div>
    </div>
  );
};

export default LiquiditySummaryCard;