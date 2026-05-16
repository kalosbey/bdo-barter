import React, { useState, useEffect } from 'react';
import { LANG } from '../data/lang';
import { PARLEY_CONFIG } from '../data/barter-data-v3';

export function ParleyTracker({ state, updateState }) {
  const dict = LANG[state.lang] || LANG.en;

  const [countdown, setCountdown] = useState("");

  const maxTradeRefresh = state.valuePack ? PARLEY_CONFIG.refreshValuePack.tradeRefresh : PARLEY_CONFIG.refreshBase.tradeRefresh;

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const reset = new Date(now);
      reset.setUTCHours(PARLEY_CONFIG.resetTimeUTC, 0, 0, 0);
      if (reset <= now) reset.setUTCDate(reset.getUTCDate() + 1);
      const diff = reset - now;
      const str = `${String(Math.floor(diff / 3600000)).padStart(2,"0")}:${String(Math.floor((diff%3600000)/60000)).padStart(2,"0")}:${String(Math.floor((diff%60000)/1000)).padStart(2,"0")}`;
      setCountdown(str);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleParleyChange = (e) => {
    const val = Math.min(PARLEY_CONFIG.maxParley, Math.max(0, parseInt(e.target.value) || 0));
    updateState({ parleyCurrent: val });
  };

  const handleCostChange = (e) => {
    const val = Math.max(0, parseInt(e.target.value) || 0);
    updateState({ parleyCostPerTrade: val });
  };

  const toggleTradeDot = (i) => {
    updateState({ tradeRefreshUsed: i < state.tradeRefreshUsed ? i : i + 1 });
  };

  const toggleShipDot = (i) => {
    updateState({ shipRefreshUsed: i < state.shipRefreshUsed ? i : i + 1 });
  };

  const pct = (state.parleyCurrent / PARLEY_CONFIG.maxParley) * 100;
  
  let tradesRemainingLabel = "Enter your parley cost per trade (from in-game UI) above";
  let tradesRemainingColor = "var(--text-muted)";
  if (state.parleyCostPerTrade > 0) {
    const trades = Math.floor(state.parleyCurrent / state.parleyCostPerTrade);
    tradesRemainingLabel = `≈ ${trades} trades remaining`;
    tradesRemainingColor = "var(--accent-cyan)";
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div className="board-header">
        <h2>⚡ {dict.tabParley || "Parley Tracker"}</h2>
        <p>Monitor your daily parley, refreshes, and reset countdown.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        
        {/* Parley Gauge Section */}
        <div style={{ background: 'var(--bg-lighter)', padding: '1.5rem', borderRadius: '12px' }}>
          <h3>{dict.parleyGauge || "Parley Gauge"}</h3>
          
          <div className="parley-bar" style={{ marginTop: '1.5rem' }}>
            <div className="parley-fill" style={{ width: `${pct}%` }}></div>
            <div className="parley-text">{state.parleyCurrent.toLocaleString()} / 1,000,000</div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>{dict.currentParley || "Current Parley"}</label>
              <input type="number" min="0" max="1000000" value={state.parleyCurrent} onChange={handleParleyChange} style={{ width: '120px', padding: '8px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '6px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>{dict.parleyCostLabel || "Parley Cost per Trade"}</label>
              <input type="number" min="0" value={state.parleyCostPerTrade} onChange={handleCostChange} style={{ width: '120px', padding: '8px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '6px' }} />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', color: tradesRemainingColor, fontWeight: 'bold' }}>
            {tradesRemainingLabel}
          </div>
        </div>

        {/* Refreshes & Reset Section */}
        <div style={{ background: 'var(--bg-lighter)', padding: '1.5rem', borderRadius: '12px' }}>
          <h3>{dict.refreshTracker || "Refresh Tracker"}</h3>
          
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>{dict.tradeRefresh || "Trade Refresh"}</span>
              <span style={{ color: 'var(--text-muted)' }}>{state.tradeRefreshUsed} / {maxTradeRefresh}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {Array.from({ length: maxTradeRefresh }).map((_, i) => (
                <div 
                  key={i} 
                  className={`refresh-dot ${i < state.tradeRefreshUsed ? "used" : ""}`}
                  onClick={() => toggleTradeDot(i)}
                ></div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>{dict.shipMaterial || "Ship Material Refresh"}</span>
              <span style={{ color: 'var(--text-muted)' }}>{state.shipRefreshUsed} / 2</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`refresh-dot ${i < state.shipRefreshUsed ? "used" : ""}`}
                  onClick={() => toggleShipDot(i)}
                ></div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>{dict.nextReset || "Next Daily Reset (06:00 UTC)"}</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>
              {countdown}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
