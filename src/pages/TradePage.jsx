import React, { useState, useEffect } from 'react';
import { ArrowUpDown, RefreshCw, TrendingUp } from 'lucide-react';
import TokenInput from '../components/TokenInput';
import LiquiditySummaryCard from '../components/LiquiditySummaryCard';
import TradeButton from '../components/TradeButton';
import { mockDEXs, mockTokens } from '../data/mockData';

const TradePage = () => {
  const [fromToken, setFromToken] = useState(mockTokens[0]);
  const [toToken, setToToken] = useState(mockTokens[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [selectedDEX, setSelectedDEX] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-calculate to amount when from amount changes
  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      const rate = fromToken.price / toToken.price;
      setToAmount((parseFloat(fromAmount) * rate).toFixed(6));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken]);

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const bestRoute = mockDEXs.find(dex => dex.slippage === '0.08%');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Trade Input Section */}
      <div className="space-y-6">
        <div className="bg-surface rounded-lg p-6 border border-bg shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-textPrimary">Swap Tokens</h2>
            <button
              onClick={handleRefreshRates}
              disabled={isRefreshing}
              className="p-2 text-textSecondary hover:text-primary transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-4">
            <TokenInput
              label="From"
              value={fromAmount}
              onValueChange={setFromAmount}
              selectedToken={fromToken}
              onTokenChange={setFromToken}
              showBalance={true}
            />

            <div className="flex justify-center">
              <button
                onClick={handleSwapTokens}
                className="p-2 bg-bg border border-surface rounded-full hover:bg-surface transition-colors"
              >
                <ArrowUpDown className="w-5 h-5 text-textSecondary" />
              </button>
            </div>

            <TokenInput
              label="To"
              value={toAmount}
              onValueChange={setToAmount}
              selectedToken={toToken}
              onTokenChange={setToToken}
            />

            {fromAmount && toAmount && (
              <div className="bg-bg rounded-lg p-4 border border-surface">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-textSecondary">Exchange Rate</span>
                  <span className="text-textPrimary font-medium">
                    1 {fromToken.symbol} = {(toAmount / fromAmount).toFixed(6)} {toToken.symbol}
                  </span>
                </div>
              </div>
            )}

            <TradeButton
              fromToken={fromToken}
              toToken={toToken}
              amount={fromAmount}
              selectedDEX={selectedDEX}
            />
          </div>
        </div>

        {/* Best Route Summary */}
        {bestRoute && fromAmount && (
          <div className="bg-gradient-to-r from-success/10 to-accent/10 border border-success/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <span className="font-semibold text-textPrimary">Best Route Found</span>
            </div>
            <div className="text-sm text-textSecondary">
              <p>Route through {bestRoute.name} offers the lowest slippage at {bestRoute.slippage}</p>
              <p className="mt-1">Estimated savings: $2.45 compared to worst route</p>
            </div>
          </div>
        )}
      </div>

      {/* DEX Liquidity Section */}
      <div className="space-y-6">
        <div className="bg-surface rounded-lg p-6 border border-bg shadow-card">
          <h3 className="text-lg font-semibold text-textPrimary mb-4">Available Liquidity</h3>
          <div className="space-y-3">
            {mockDEXs.map((dex, index) => (
              <LiquiditySummaryCard
                key={index}
                dex={dex}
                isSelected={selectedDEX?.name === dex.name}
                onClick={() => setSelectedDEX(dex)}
              />
            ))}
          </div>
        </div>

        {/* Market Stats */}
        <div className="bg-surface rounded-lg p-6 border border-bg shadow-card">
          <h3 className="text-lg font-semibold text-textPrimary mb-4">Market Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-bg rounded-lg">
              <div className="text-2xl font-bold text-primary">$24.8M</div>
              <div className="text-sm text-textSecondary">Total Liquidity</div>
            </div>
            <div className="text-center p-3 bg-bg rounded-lg">
              <div className="text-2xl font-bold text-accent">0.14%</div>
              <div className="text-sm text-textSecondary">Avg. Slippage</div>
            </div>
            <div className="text-center p-3 bg-bg rounded-lg">
              <div className="text-2xl font-bold text-success">$47.3M</div>
              <div className="text-sm text-textSecondary">24h Volume</div>
            </div>
            <div className="text-center p-3 bg-bg rounded-lg">
              <div className="text-2xl font-bold text-warning">5</div>
              <div className="text-sm text-textSecondary">Active DEXs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradePage;