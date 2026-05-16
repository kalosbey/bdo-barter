import React from 'react';
import { LANG } from '../data/lang';
import { SHIP_DATA, PARLEY_CONFIG } from '../data/barter-data-v3';

export function StatsBar({ state }) {
  const dict = LANG[state.lang] || LANG.en;
  const ship = SHIP_DATA[state.ship] || SHIP_DATA['carrack-advance'];
  const maxRef = state.valuePack ? PARLEY_CONFIG.refreshValuePack.tradeRefresh : PARLEY_CONFIG.refreshBase.tradeRefresh;

  const goalLabels = {
    silver: dict.modeSilver || "Silver Profit",
    crowcoins: dict.modeCrow || "Crow Coins",
    both: dict.modeBoth || "Silver + Coins"
  };

  return (
    <div className="stats-bar">
      <div className="stat-chip" id="chip-ship">
        🚢 <span>{ship.weightCapacity.toLocaleString()} LT / {ship.inventorySlots} slots</span>
      </div>
      <div className="stat-chip" id="chip-vp">
        👑 <span>{state.valuePack ? (dict.vpActive || "Active (−10% Parley)") : (dict.vpInactive || "Inactive")}</span>
      </div>
      <div className="stat-chip" id="chip-refresh">
        🔄 <span>{maxRef}{dict.refreshDay || "/day"}</span>
      </div>
      <div className="stat-chip" id="chip-goal">
        🎯 <span>{goalLabels[state.goal] || "Silver Profit"}</span>
      </div>
    </div>
  );
}
