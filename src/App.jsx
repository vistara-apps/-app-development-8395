import React, { useState } from 'react';
import AppShell from './components/AppShell';
import TradePage from './pages/TradePage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  const [activeTab, setActiveTab] = useState('trade');

  const renderContent = () => {
    switch (activeTab) {
      case 'trade':
        return <TradePage />;
      case 'analytics':
        return <AnalyticsPage />;
      default:
        return <TradePage />;
    }
  };

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AppShell>
  );
}

export default App;