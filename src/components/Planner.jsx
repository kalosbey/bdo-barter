import React from 'react';
import { LANG } from '../data/lang';
import { DAYS, TIER_DATA, DEFAULT_THRESHOLDS } from '../data/barter-data-v3';

export function Planner({ state, updateState }) {
  const dict = LANG[state.lang] || LANG.en;

  const toggleDay = (idx) => {
    const newPlan = [...state.weekPlan];
    newPlan[idx] = newPlan[idx] === 0 ? 1 : 0;
    updateState({ weekPlan: newPlan });
  };

  const getStockStatus = (tier) => {
    const items = state.inventory[tier] || [];
    if (!DEFAULT_THRESHOLDS[tier]) return "sell"; 
    const safeLvl = state.safeStock[tier] || 30;
    const warnLvl = Math.floor(safeLvl / 2);
    
    if (items.length === 0) return "critical";
    let worstStatus = "safe";
    items.forEach(item => {
      if (item.qty < warnLvl) worstStatus = "critical";
      else if (item.qty < safeLvl && worstStatus !== "critical") worstStatus = "warning";
    });
    return worstStatus;
  };

  const autoSchedule = () => {
    const lowTiers = ["T1","T2","T3","T4","T5"].filter(t => getStockStatus(t) === "critical");
    const warningTiers = ["T1","T2","T3","T4","T5"].filter(t => getStockStatus(t) === "warning");
    
    let stockDaysNeeded = 0;
    if (lowTiers.length > 0) {
      stockDaysNeeded = Math.min(7, lowTiers.length * 2);
    } else if (warningTiers.length >= 2) {
      stockDaysNeeded = 2;
    }

    const newPlan = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < stockDaysNeeded; i++) {
      newPlan[i] = 1;
    }
    
    updateState({ weekPlan: newPlan });
    alert(`Auto-scheduled ${stockDaysNeeded} stockpile days based on your inventory.`);
  };

  const profitDays = state.weekPlan.filter(d => d === 0).length;
  const stockDays = 7 - profitDays;
  const dailySilver = (state.avgT7PerDay || 0) * TIER_DATA.T7.sellPrice;
  const weeklySilver = dailySilver * profitDays;
  const weeklyCoins = (state.avgCrowCoinsPerDay || 0) * profitDays;

  const fmt = (n) => {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n.toLocaleString();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div className="board-header">
        <h2>📅 {dict.weekRotation || "Weekly Schedule"}</h2>
        <p>{dict.weekRotationDesc || "Plan your week. Click a day to toggle between Profit and Stockpile."}</p>
        <div className="board-toolbar">
          <button className="btn-primary" onClick={autoSchedule}>🤖 {dict.autoSchedule || "Auto-Schedule"}</button>
        </div>
      </div>

      <div id="week-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', marginTop: '1.5rem' }}>
        {DAYS.map((day, idx) => {
          const isStock = state.weekPlan[idx] === 1;
          const dayDict = dict[day.toLowerCase().substring(0,3)] || day.substring(0, 3);
          return (
            <div 
              key={idx} 
              className={`day-card ${isStock ? "stockpile-day" : "profit-day"}`}
              onClick={() => toggleDay(idx)}
              style={{ padding: '1rem', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--border-color)' }}
            >
              <div className="day-name" style={{ fontWeight: 'bold', marginBottom: '8px' }}>{dayDict}</div>
              <div className="day-icon" style={{ fontSize: '2rem' }}>{isStock ? "📦" : "💰"}</div>
              <div className="day-type" style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {isStock ? (dict.stockpile || "Stockpile") : (dict.profit || "Profit")}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-lighter)', borderRadius: '12px' }}>
        <h3>📊 {dict.weeklySummary || "Weekly Summary"}</h3>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <div className="summary-stat">
            <div className="stat-value">{profitDays}</div>
            <div className="stat-label">{dict.profitDays || "Profit Days"}</div>
          </div>
          <div className="summary-stat">
            <div className="stat-value">{stockDays}</div>
            <div className="stat-label">{dict.stockpileDays || "Stockpile Days"}</div>
          </div>
          <div className="summary-stat">
            <div className="stat-value text-gold">{fmt(weeklySilver)}</div>
            <div className="stat-label">{dict.estWeeklySilver || "Est. Weekly Silver"}</div>
          </div>
          <div className="summary-stat">
            <div className="stat-value">{fmt(dailySilver)}</div>
            <div className="stat-label">{dict.perProfitDay || "Per Profit Day"}</div>
          </div>
          {state.goal !== "silver" && (
            <div className="summary-stat">
              <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>{fmt(weeklyCoins)}</div>
              <div className="stat-label">{dict.estWeeklyCC || "Est. Weekly Crow Coins"}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
