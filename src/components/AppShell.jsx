import React from 'react';

function AppShell({ children }) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {children}
      </div>
    </div>
  );
}

export default AppShell;