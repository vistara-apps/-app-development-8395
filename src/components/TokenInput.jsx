import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { mockTokens } from '../data/mockData';

const TokenInput = ({ 
  label, 
  value, 
  onValueChange, 
  selectedToken, 
  onTokenChange, 
  showBalance = false 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTokens = mockTokens.filter(token =>
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-textSecondary">{label}</label>
      <div className="bg-surface border border-surface rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <input
            type="number"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder="0.0"
            className="bg-transparent text-2xl font-semibold text-textPrimary placeholder-textSecondary border-none outline-none flex-1"
          />
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 bg-bg rounded-lg px-3 py-2 hover:bg-surface transition-colors"
            >
              <span className="text-lg font-semibold text-textPrimary">
                {selectedToken?.symbol || 'Select'}
              </span>
              <ChevronDown className="w-4 h-4 text-textSecondary" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-surface border border-bg rounded-lg shadow-card z-50 animate-fade-in">
                <div className="p-3 border-b border-bg">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textSecondary" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search tokens..."
                      className="w-full pl-10 pr-4 py-2 bg-bg rounded-md text-textPrimary placeholder-textSecondary border border-bg focus:border-primary outline-none"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredTokens.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => {
                        onTokenChange(token);
                        setIsDropdownOpen(false);
                        setSearchTerm('');
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-bg transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-textPrimary">{token.symbol}</div>
                        <div className="text-sm text-textSecondary">{token.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-textPrimary">${token.price.toLocaleString()}</div>
                        <div className={`text-xs ${token.change.startsWith('+') ? 'text-success' : 'text-error'}`}>
                          {token.change}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {showBalance && selectedToken && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-textSecondary">Balance: 12.5 {selectedToken.symbol}</span>
            <button className="text-primary hover:text-accent transition-colors">MAX</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenInput;