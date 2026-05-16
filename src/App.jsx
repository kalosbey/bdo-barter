import React, { useState } from 'react';
import { useAppState } from './context/useAppState';
import { Navigation } from './components/Navigation';
import { StatsBar } from './components/StatsBar';
import { Settings } from './components/Settings';
import { InventoryTab } from './components/InventoryTab';
import { TradeBoard } from './components/TradeBoard';
import { Planner } from './components/Planner';
import { ProfitCalc } from './components/ProfitCalc';
import { ParleyTracker } from './components/ParleyTracker';
import { TimeManager } from './components/TimeManager';
import { LANG } from './data/lang';

function App() {
  const [state, updateState] = useAppState();
  const [activeTab, setActiveTab] = useState('dashboard');

  const dict = LANG[state.lang] || LANG.en;

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="header-content">
          <div className="app-title-group">
            <h1>{dict.appTitle}</h1>
            <p className="subtitle">{dict.appSubtitle}</p>
          </div>
          <Settings state={state} updateState={updateState} />
        </div>
        <StatsBar state={state} />
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} lang={state.lang} />
      </header>

      <main className="main-content">
        {activeTab === 'dashboard' && <div id="tab-dashboard" className="tab-content active">
          <InventoryTab state={state} updateState={updateState} />
        </div>}
        {activeTab === 'planner' && <div id="tab-planner" className="tab-content active">
          <Planner state={state} updateState={updateState} />
        </div>}
        {activeTab === 'profit' && <div id="tab-profit" className="tab-content active">
          <ProfitCalc state={state} updateState={updateState} />
        </div>}
        {activeTab === 'parley' && <div id="tab-parley" className="tab-content active">
          <ParleyTracker state={state} updateState={updateState} />
        </div>}
        {activeTab === 'board' && <div id="tab-board" className="tab-content active">
          <TradeBoard state={state} updateState={updateState} />
        </div>}
        {activeTab === 'time' && <div id="tab-time" className="tab-content active">
          <TimeManager state={state} />
        </div>}
      </main>
    </div>
  );
}

export default App;
