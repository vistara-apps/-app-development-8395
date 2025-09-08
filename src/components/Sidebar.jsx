import React from 'react';
import { TrendingUp, Zap, Shield, Star } from 'lucide-react';

function Sidebar() {
  const menuItems = [
    { icon: TrendingUp, label: 'Market Overview', active: false },
    { icon: Zap, label: 'Quick Swap', active: false },
    { icon: Shield, label: 'Portfolio', active: false },
    { icon: Star, label: 'Favorites', active: false },
  ];

  return (
    <div className="h-full bg-surface p-4">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold text-textPrimary">Navigator</span>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <a
              key={index}
              href="#"
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${item.active 
                  ? 'bg-accent text-white' 
                  : 'text-textSecondary hover:text-textPrimary hover:bg-gray-700'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-sm font-medium text-textPrimary mb-2">Upgrade to Pro</h3>
        <p className="text-xs text-textSecondary mb-3">Get unlimited route analysis and advanced features</p>
        <button className="w-full bg-accent hover:bg-accent/90 text-white text-xs py-2 px-3 rounded-md transition-colors">
          Upgrade Now
        </button>
      </div>
    </div>
  );
}

export default Sidebar;