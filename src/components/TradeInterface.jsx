import React, { useState } from 'react';
import TokenInput from './TokenInput';
import LiquiditySummaryCard from './LiquiditySummaryCard';
import TradeButton from './TradeButton';
import { usePaymentContext } from '../hooks/usePaymentContext';
import { ArrowDownUp, Settings, Info } from 'lucide-react';

function TradeInterface() {
  const [tokenFrom, setTokenFrom] = useState('ETH');
  const [tokenTo, setTokenTo] = useState('USDC');
  const [amountFrom, setAmountFrom] = useState('');
  const [amountTo, setAmountTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [paid, setPaid] = useState(false);

  const { createSession } = usePaymentContext();

  const handleSwapTokens = () => {
    setTokenFrom(tokenTo);
    setTokenTo(tokenFrom);
    setAmountFrom(amountTo);
    setAmountTo(amountFrom);
  };

  const handleGetBestRoute = async () => {
    if (!paid) {
      try {
        await createSession();
        setPaid(true);
      } catch (error) {
        console.error('Payment failed:', error);
        return;
      }
    }

    setIsLoading(true);
    
    // Simulate API call to get best route
    setTimeout(() => {
      setRouteData({
        bestPrice: '1847.23',
        estimatedSlippage: '0.12%',
        totalFees: '$2.45',
        route: ['Uniswap V3', 'SushiSwap', 'Curve'],
        savings: '$12.30'
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="lg:col-span-8 space-y-6">
      {/* Trade Card */}
      <div className="bg-surface rounded-lg p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-textPrimary">Swap Tokens</h2>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-textSecondary" />
          </button>
        </div>

        <div className="space-y-4">
          {/* From Token */}
          <TokenInput
            label="From"
            token={tokenFrom}
            amount={amountFrom}
            onTokenChange={setTokenFrom}
            onAmountChange={setAmountFrom}
            balance="12.4532"
          />

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwapTokens}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ArrowDownUp className="w-5 h-5 text-textSecondary" />
            </button>
          </div>

          {/* To Token */}
          <TokenInput
            label="To"
            token={tokenTo}
            amount={amountTo}
            onTokenChange={setTokenTo}
            onAmountChange={setAmountTo}
            balance="0.0000"
            readOnly
          />

          {/* Route Information */}
          {routeData && (
            <div className="bg-gray-800 rounded-lg p-4 mt-4">
              <div className="flex items-center space-x-2 mb-3">
                <Info className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-textPrimary">Best Route Found</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-textSecondary">Price:</span>
                  <span className="text-textPrimary ml-1">${routeData.bestPrice}</span>
                </div>
                <div>
                  <span className="text-textSecondary">Slippage:</span>
                  <span className="text-success ml-1">{routeData.estimatedSlippage}</span>
                </div>
                <div>
                  <span className="text-textSecondary">Fees:</span>
                  <span className="text-textPrimary ml-1">{routeData.totalFees}</span>
                </div>
                <div>
                  <span className="text-textSecondary">Savings:</span>
                  <span className="text-success ml-1">{routeData.savings}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-700">
                <span className="text-xs text-textSecondary">Route: </span>
                <span className="text-xs text-accent">{routeData.route.join(' → ')}</span>
              </div>
            </div>
          )}

          {/* Get Best Route Button */}
          <TradeButton
            variant="primary"
            onClick={handleGetBestRoute}
            isLoading={isLoading}
            disabled={!amountFrom || !tokenFrom || !tokenTo}
          >
            {paid ? 'Get Best Route' : 'Get Best Route ($0.01)'}
          </TradeButton>

          {/* Execute Trade Button */}
          {routeData && (
            <TradeButton
              variant="secondary"
              onClick={() => console.log('Execute trade')}
            >
              Execute Trade
            </TradeButton>
          )}
        </div>
      </div>
    </div>
  );
}

export default TradeInterface;