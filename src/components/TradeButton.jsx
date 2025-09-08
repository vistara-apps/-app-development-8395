import React, { useState } from 'react';
import { ArrowRight, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { usePaymentContext } from '../hooks/usePaymentContext';

const TradeButton = ({ 
  variant = 'primary', 
  fromToken, 
  toToken, 
  amount, 
  selectedDEX,
  disabled 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { createSession } = usePaymentContext();

  const handleTrade = async () => {
    try {
      setIsLoading(true);
      
      // First, handle payment for the trade analysis
      if (!paid) {
        await createSession();
        setPaid(true);
      }
      
      // Simulate trade execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setPaid(false); // Reset for next trade
      }, 3000);
      
    } catch (error) {
      console.error('Trade failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canTrade = fromToken && toToken && amount && selectedDEX && !disabled;

  if (showSuccess) {
    return (
      <button
        className="w-full bg-success text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2 animate-fade-in"
        disabled
      >
        <CheckCircle className="w-5 h-5" />
        <span>Trade Executed Successfully!</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleTrade}
      disabled={!canTrade || isLoading}
      className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
        variant === 'primary'
          ? canTrade
            ? 'bg-gradient-to-r from-accent to-primary text-white hover:shadow-card transform hover:scale-[1.02]'
            : 'bg-surface text-textSecondary cursor-not-allowed'
          : 'bg-surface text-textPrimary hover:bg-bg border border-surface'
      }`}
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Processing Trade...</span>
        </>
      ) : !paid && canTrade ? (
        <>
          <Zap className="w-5 h-5" />
          <span>Get Best Route ($0.001)</span>
        </>
      ) : paid && canTrade ? (
        <>
          <ArrowRight className="w-5 h-5" />
          <span>Execute Trade</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-5 h-5" />
          <span>Enter Trade Details</span>
        </>
      )}
    </button>
  );
};

export default TradeButton;