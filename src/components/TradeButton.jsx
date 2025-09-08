import React from 'react';
import { Loader2 } from 'lucide-react';

function TradeButton({ 
  children, 
  variant = 'primary', 
  onClick, 
  isLoading = false, 
  disabled = false 
}) {
  const baseClasses = "w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2";
  
  const variants = {
    primary: `${baseClasses} bg-accent hover:bg-accent/90 text-white disabled:bg-gray-700 disabled:text-textSecondary`,
    secondary: `${baseClasses} bg-gray-700 hover:bg-gray-600 text-textPrimary disabled:bg-gray-800 disabled:text-textSecondary`
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={variants[variant]}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      <span>{children}</span>
    </button>
  );
}

export default TradeButton;