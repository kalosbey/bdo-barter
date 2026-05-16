import React from 'react';
import { LANG } from '../data/lang';

export function Navigation({ activeTab, setActiveTab, lang }) {
  const dict = LANG[lang] || LANG.en;

  return (
    <nav className="main-nav">
      <button 
        className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
      >
        <span className="tab-icon">🏠</span>
        <span className="tab-text">{dict.tabDashboard}</span>
      </button>
      <button 
        className={`tab-btn ${activeTab === 'planner' ? 'active' : ''}`}
        onClick={() => setActiveTab('planner')}
      >
        <span className="tab-icon">📅</span>
        <span className="tab-text">{dict.tabPlanner}</span>
      </button>
      <button 
        className={`tab-btn ${activeTab === 'profit' ? 'active' : ''}`}
        onClick={() => setActiveTab('profit')}
      >
        <span className="tab-icon">💰</span>
        <span className="tab-text">{dict.tabProfit}</span>
      </button>
      <button 
        className={`tab-btn ${activeTab === 'parley' ? 'active' : ''}`}
        onClick={() => setActiveTab('parley')}
      >
        <span className="tab-icon">⚡</span>
        <span className="tab-text">{dict.tabParley}</span>
      </button>
      <button 
        className={`tab-btn ${activeTab === 'board' ? 'active' : ''}`}
        onClick={() => setActiveTab('board')}
      >
        <span className="tab-icon">🗺️</span>
        <span className="tab-text">{dict.tabBoard || "Barter Route"}</span>
      </button>
      <button 
        className={`tab-btn ${activeTab === 'time' ? 'active' : ''}`}
        onClick={() => setActiveTab('time')}
      >
        <span className="tab-icon">⏱️</span>
        <span className="tab-text">Time Optimizer</span>
      </button>
    </nav>
  );
}
