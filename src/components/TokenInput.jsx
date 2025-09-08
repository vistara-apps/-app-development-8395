import React from 'react';
import { ChevronDown } from 'lucide-react';

function TokenInput({ 
  label, 
  token, 
  amount, 
  onTokenChange, 
  onAmountChange, 
  balance,
  readOnly = false 
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-textSecondary">{label}</span>
        <span className="text-sm text-textSecondary">Balance: {balance}</span>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2 min-w-0">
          <div className="w-6 h-6 bg-gradient-to-br from-accent to-primary rounded-full flex-shrink-0" />
          <span className="font-medium text-textPrimary">{token}</span>
          <ChevronDown className="w-4 h-4 text-textSecondary flex-shrink-0" />
        </div>
        
        <input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange && onAmountChange(e.target.value)}
          placeholder="0.0"
          readOnly={readOnly}
          className="flex-1 bg-transparent text-right text-xl font-medium text-textPrimary placeholder-textSecondary outline-none"
        />
      </div>
    </div>
  );
}

export default TokenInput;