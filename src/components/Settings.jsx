import React from 'react';
import { LANG } from '../data/lang';
import { SHIP_DATA } from '../data/barter-data-v3';

export function Settings({ state, updateState }) {
  const dict = LANG[state.lang] || LANG.en;

  const handleLangChange = (lang) => {
    updateState({ lang });
    // TODO: if we need to translate items in inventory we should do that here
  };

  const setSafeStock = (tier, val) => {
    updateState({ safeStock: { ...state.safeStock, [tier]: parseInt(val) || 0 } });
  };

  return (
    <div className="settings-panel">
      <div className="settings-group">
        <label>{dict.ship || "Ship"}</label>
        <select 
          value={state.ship} 
          onChange={e => updateState({ ship: e.target.value })}
        >
          {Object.entries(SHIP_DATA).map(([key, data]) => (
            <option key={key} value={key}>{data.name}</option>
          ))}
        </select>
      </div>

      <div className="settings-group">
        <label>{dict.valuePack || "Value Pack"}</label>
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={state.valuePack} 
            onChange={e => updateState({ valuePack: e.target.checked })} 
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="settings-group">
        <label>{dict.goal || "Goal"}</label>
        <div className="goal-toggle">
          <button 
            className={`goal-pill ${state.goal === 'silver' ? 'active' : ''}`}
            onClick={() => updateState({ goal: 'silver' })}
          >
            {dict.goalSilver || "💰 Silver"}
          </button>
          <button 
            className={`goal-pill ${state.goal === 'crowcoins' ? 'active' : ''}`}
            onClick={() => updateState({ goal: 'crowcoins' })}
          >
            {dict.goalCrow || "🪙 Crow Coins"}
          </button>
          <button 
            className={`goal-pill ${state.goal === 'both' ? 'active' : ''}`}
            onClick={() => updateState({ goal: 'both' })}
          >
            {dict.goalBoth || "⚖️ Both"}
          </button>
        </div>
      </div>

      <div className="settings-group">
        <label>{dict.safeStock || "Safe Stock Level"}</label>
        <div id="safe-stock-container" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {["T1", "T2", "T3", "T4", "T5"].map(tier => (
            <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: '22px' }}>{tier}</span>
              <input 
                type="number" min="0" value={state.safeStock[tier] ?? 30} 
                onChange={(e) => setSafeStock(tier, e.target.value)}
                style={{ width: '55px', padding: '6px 4px', background: 'rgba(0,0,0,0.4)', border: '1px solid transparent', borderBottom: '2px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', textAlign: 'center', fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '0.85rem' }} 
              />
            </div>
          ))}
        </div>
      </div>

      <div className="settings-group">
        <label>{dict.maxWeight || "Max LT"}</label>
        <input 
          type="number" 
          value={state.maxWeight} 
          onChange={(e) => updateState({ maxWeight: parseInt(e.target.value) || 16500 })}
          style={{ width: '100px', padding: '8px', background: 'var(--bg-lighter)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px' }}
        />
      </div>

      <div className="settings-group" style={{ marginLeft: 'auto' }}>
        <div className="lang-toggle">
          <button 
            className={`lang-btn ${state.lang === 'en' ? 'active' : ''}`}
            onClick={() => handleLangChange('en')}
          >
            EN
          </button>
          <button 
            className={`lang-btn ${state.lang === 'th' ? 'active' : ''}`}
            onClick={() => handleLangChange('th')}
          >
            TH
          </button>
        </div>
      </div>
    </div>
  );
}
