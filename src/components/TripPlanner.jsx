import React, { useState, useEffect } from 'react';
import { TIER_DATA } from '../data/barter-data-v3';
import { TIER_NAMES } from '../data/lang';

/**
 * Multi-Trip Smart Optimizer + Trip List UI
 * Shows planned trips below the trade route board
 */
export function useTripPlanner(state, updateState, MAX_WEIGHT) {
  // Load trips from localStorage on init
  const [trips, setTrips] = useState(() => {
    try {
      const saved = localStorage.getItem('bdo_planned_trips');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Persist trips to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bdo_planned_trips', JSON.stringify(trips));
  }, [trips]);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [optimizerGoal, setOptimizerGoal] = useState('stocking');
  const [optimizerParley, setOptimizerParley] = useState(state.parleyCurrent || 0);
  const [optimizerWeight, setOptimizerWeight] = useState(MAX_WEIGHT);

  const boardTiers = React.useMemo(() => {
    const toTiers = new Set();
    state.board.forEach(t => { if (t.enabled !== false) toTiers.add(t.toTier); });
    return {
      hasSilverChain: toTiers.has('T5') || toTiers.has('T6') || toTiers.has('T7'),
      hasCoinChain: toTiers.has('CC'),
    };
  }, [state.board]);

  const isT0 = (tier) => tier === 'T0' || tier === 'Trade Goods';

  const runOptimizer = () => {
    const tierOrder = {"T0":0,"Trade Goods":0,"T1":1,"T2":2,"T3":3,"T4":4,"T5":5,"T6":6,"T7":7,"CC":8};
    const goal = optimizerGoal;
    const maxWt = optimizerWeight;
    let parleyLeft = optimizerParley;

    // Clone all enabled trades, sorted by tier
    const allTrades = state.board
      .map((t, i) => ({ ...t, _origIdx: i }))
      .filter(t => t.enabled !== false && t.fromName && t.toName)
      .sort((a, b) => (tierOrder[a.fromTier] ?? 99) - (tierOrder[b.fromTier] ?? 99));

    // Clone inventory for simulation
    const simInv = JSON.parse(JSON.stringify(state.inventory));
    // Track remaining exchanges needed per trade
    const remaining = {};
    allTrades.forEach(t => { remaining[t._origIdx] = t.exchanges || 1; });

    const plannedTrips = [];
    let safety = 0;

    while (safety < 20) {
      safety++;
      // Check if anything left to do
      const hasWork = allTrades.some(t => remaining[t._origIdx] > 0);
      if (!hasWork) break;

      // Plan one trip: greedily add trades until weight limit
      const tripTrades = [];
      let tripParley = 0;
      const tripShipInv = {}; // items on ship during this trip

      // Process trades in tier order (low to high)
      // shipCargo = actual weight currently on ship
      let shipCargo = 0;

      for (const trade of allTrades) {
        const rem = remaining[trade._origIdx];
        if (rem <= 0) continue;

        const parleyPerExchange = trade.parley || 0;
        const fromWeight = isT0(trade.fromTier) ? 0 : (TIER_DATA[trade.fromTier]?.weight || 0);
        const toWeight = TIER_DATA[trade.toTier]?.weight || 0;
        const toQty = trade.toQty || 1;

        // Try to fit as many exchanges as possible
        let canDo = 0;
        for (let i = 0; i < rem; i++) {
          // Check parley
          if (parleyLeft - tripParley - parleyPerExchange < 0) break;

          // Check inventory (skip T0)
          if (!isT0(trade.fromTier)) {
            const invArr = simInv[trade.fromTier] || [];
            const shipKey = trade.fromTier + ':' + trade.fromName;
            const onShip = tripShipInv[shipKey] || 0;
            const inStorage = invArr.find(x => x.name === trade.fromName)?.qty || 0;
            if (onShip + inStorage < 1) break;
          }

          // Weight check: simulate loading from-item (if from port) then trading
          let loadFromPort = 0;
          if (!isT0(trade.fromTier)) {
            const shipKey = trade.fromTier + ':' + trade.fromName;
            if ((tripShipInv[shipKey] || 0) < 1) {
              loadFromPort = fromWeight; // need to bring from port
            }
          }

          // After this trade: cargo += loadFromPort (load item) - fromWeight (trade away) + toQty*toWeight (receive)
          // Peak moment is right before trading (when loaded item is still on ship)
          const peakIfLoaded = shipCargo + loadFromPort;
          // After trade completes: 
          const afterTrade = shipCargo + loadFromPort - fromWeight + (toQty * toWeight);
          
          if (Math.max(peakIfLoaded, afterTrade) > maxWt) break;

          canDo++;
          tripParley += parleyPerExchange;
          shipCargo = afterTrade;

          // Update ship inventory for chain tracking
          if (!isT0(trade.fromTier)) {
            const shipKey = trade.fromTier + ':' + trade.fromName;
            if ((tripShipInv[shipKey] || 0) >= 1) {
              tripShipInv[shipKey] -= 1;
            } else {
              const invArr = simInv[trade.fromTier] || [];
              const idx = invArr.findIndex(x => x.name === trade.fromName);
              if (idx !== -1) invArr[idx].qty -= 1;
            }
          }
          const toKey = trade.toTier + ':' + trade.toName;
          tripShipInv[toKey] = (tripShipInv[toKey] || 0) + toQty;
        }

        if (canDo > 0) {
          tripTrades.push({
            fromTier: trade.fromTier,
            fromName: trade.fromName,
            toTier: trade.toTier,
            toName: trade.toName,
            toQty: trade.toQty,
            exchanges: canDo,
            parley: trade.parley,
            _origIdx: trade._origIdx,
          });
          remaining[trade._origIdx] -= canDo;
        }
      }

      if (tripTrades.length === 0) break; // Can't fit anything more

      // After trip completes, items gained go to storage
      for (const key in tripShipInv) {
        if (tripShipInv[key] > 0) {
          const [tier, name] = [key.split(':')[0], key.split(':').slice(1).join(':')];
          if (!simInv[tier]) simInv[tier] = [];
          const idx = simInv[tier].findIndex(x => x.name === name);
          if (idx !== -1) simInv[tier][idx].qty += tripShipInv[key];
          else simInv[tier].push({ name, qty: tripShipInv[key] });
        }
      }

      parleyLeft -= tripParley;

      let silverProfit = 0;
      let ccGained = 0;
      tripTrades.forEach(t => {
        const gained = (t.toQty || 1) * t.exchanges;
        silverProfit += gained * (TIER_DATA[t.toTier]?.sellPrice || 0);
        if (t.toTier === 'CC') ccGained += gained;
      });

      plannedTrips.push({
        id: safety,
        trades: tripTrades,
        totalParley: tripParley,
        peakWeight: shipCargo,
        silverProfit,
        ccGained,
        completed: false,
      });
    }

    setTrips(plannedTrips);
    setShowOptimizer(false);
  };

  const completeTrip = (tripId) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip || trip.completed) return;
    if (!window.confirm(`Complete Trip ${tripId}? This will update your inventory.`)) return;

    const newInv = JSON.parse(JSON.stringify(state.inventory));
    let parleyUsed = 0;

    trip.trades.forEach(trade => {
      // Deduct from items
      if (!isT0(trade.fromTier)) {
        const arr = newInv[trade.fromTier] || [];
        const idx = arr.findIndex(x => x.name === trade.fromName);
        if (idx !== -1) {
          arr[idx].qty = Math.max(0, arr[idx].qty - trade.exchanges);
        }
      }
      // Add to items
      if (!newInv[trade.toTier]) newInv[trade.toTier] = [];
      const arr = newInv[trade.toTier];
      const idx = arr.findIndex(x => x.name === trade.toName);
      const gained = (trade.toQty || 1) * trade.exchanges;
      if (idx !== -1) arr[idx].qty += gained;
      else arr.push({ name: trade.toName, qty: gained });

      parleyUsed += (trade.parley || 0) * trade.exchanges;
    });

    const newParley = Math.max(0, (state.parleyCurrent || 0) - parleyUsed);
    updateState({ inventory: newInv, parleyCurrent: newParley });

    // Mark trip as completed
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, completed: true } : t));
  };

  const moveTradeUp = (tripId, tradeIdx) => {
    if (tradeIdx <= 0) return;
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      const newTrades = [...t.trades];
      const temp = newTrades[tradeIdx - 1];
      newTrades[tradeIdx - 1] = newTrades[tradeIdx];
      newTrades[tradeIdx] = temp;
      return { ...t, trades: newTrades };
    }));
  };

  const moveTradeDown = (tripId, tradeIdx) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId || tradeIdx >= t.trades.length - 1) return t;
      const newTrades = [...t.trades];
      const temp = newTrades[tradeIdx + 1];
      newTrades[tradeIdx + 1] = newTrades[tradeIdx];
      newTrades[tradeIdx] = temp;
      return { ...t, trades: newTrades };
    }));
  };

  return {
    trips, setTrips,
    showOptimizer, setShowOptimizer,
    optimizerGoal, setOptimizerGoal,
    optimizerParley, setOptimizerParley,
    optimizerWeight, setOptimizerWeight,
    boardTiers, runOptimizer, completeTrip,
    moveTradeUp, moveTradeDown,
  };
}
