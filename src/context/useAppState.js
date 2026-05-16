import { useState, useEffect } from 'react';

const LOCAL_STORAGE_KEY = "bdo-barter-v4";

const defaultState = {
  lang: "en",
  ship: "carrack-advance",
  valuePack: false,
  goal: "silver",
  inventory: {
    T0: [], T1: [], T2: [], T3: [], T4: [], T5: [], T6: [], T7: [], CC: []
  },
  safeStock: { T1: 30, T2: 30, T3: 25, T4: 10, T5: 10 },
  maxWeight: 16500,
  board: [],
  openTiers: {},
  weekPlan: [1, 0, 0, 1, 0, 0, 0],
  parleyCurrent: 1000000,
  parleyCostPerTrade: 0,
  tradeRefreshUsed: 0,
  shipRefreshUsed: 0,
  avgT7PerDay: 1,
  avgCrowCoinsPerDay: 0,
};

export function useAppState() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure all tiers exist
        const tiers = ["T0", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "CC"];
        tiers.forEach(t => {
          if (!parsed.inventory[t]) parsed.inventory[t] = [];
        });
        if (!parsed.openTiers) parsed.openTiers = {};
        return { ...defaultState, ...parsed };
      }
    } catch (e) {
      console.error("Failed to load state", e);
    }
    return defaultState;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save state", e);
    }
  }, [state]);

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return [state, updateState, setState];
}
