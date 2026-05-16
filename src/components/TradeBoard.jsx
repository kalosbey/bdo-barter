import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { LANG, TIER_NAMES } from '../data/lang';
import { TIER_DATA, SHIP_DATA, PARLEY_CONFIG } from '../data/barter-data-v3';
import { IconSelectBtn, IconPickerModal } from './IconPickerModal';
import { useTripPlanner } from './TripPlanner';

export function TradeBoard({ state, updateState }) {
  const dict = LANG[state.lang] || LANG.en;
  
  const [showWizard, setShowWizard] = useState(false);
  const [wizardCart, setWizardCart] = useState([]);
  const [wizardDraft, setWizardDraft] = useState({
    fromTier: "T1", fromName: "",
    toTier: "T2", toName: "",
    toQty: 3, exchanges: 1,
    parley: state.parleyCostPerTrade || 0
  });
  const [editingTradeIdx, setEditingTradeIdx] = useState(null);

  const [pickerConfig, setPickerConfig] = useState(null); // { field, tier, currentName }

  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const ship = SHIP_DATA[state.ship] || SHIP_DATA['carrack-advance'];
  const MAX_WEIGHT = state.maxWeight || ship.weightCapacity;

  // Board Simulation Logic memoized to prevent lag on wizard keystrokes
  const simulation = React.useMemo(() => {
    const simInventory = JSON.parse(JSON.stringify(state.inventory));
    
    let parley = 0;
    let t5 = 0;
    let t6 = 0;
    let t7 = 0;
    let cc = 0;

    let shipInventory = {};
    let broughtFromPort = {};

    const simBoard = state.board.map((trade, idx) => {
      if (!trade.enabled) return { ...trade, originalIdx: idx, canDo: false, missing: [] };

      let canDo = true;
      let missing = [];

      // Deduct
      if (trade.fromTier !== 'T0' && trade.fromTier !== 'Trade Goods') {
        const invFrom = simInventory[trade.fromTier] || [];
        const itemIdx = invFrom.findIndex(i => i.name === trade.fromName);
        
        if (itemIdx === -1 || invFrom[itemIdx].qty < trade.exchanges) {
          canDo = false;
          const have = itemIdx !== -1 ? invFrom[itemIdx].qty : 0;
          missing.push(`Need ${trade.exchanges} ${trade.fromName} (Have ${have})`);
        }

        if (canDo) {
          invFrom[itemIdx].qty -= trade.exchanges;
          
          // Track what must be brought from port
          if (shipInventory[trade.fromTier] >= trade.exchanges) {
            shipInventory[trade.fromTier] -= trade.exchanges;
          } else {
            const needed = trade.exchanges - (shipInventory[trade.fromTier] || 0);
            broughtFromPort[trade.fromTier] = (broughtFromPort[trade.fromTier] || 0) + needed;
            shipInventory[trade.fromTier] = 0;
          }
        }
      }

      if (canDo) {
        // Add
        const invTo = simInventory[trade.toTier];
        const gained = trade.toQty * trade.exchanges;
        if (invTo) {
          const toItemIdx = invTo.findIndex(i => i.name === trade.toName);
          if (toItemIdx !== -1) {
            invTo[toItemIdx].qty += gained;
          } else {
            invTo.push({ name: trade.toName, qty: gained });
          }
          
          // Item loaded onto ship
          shipInventory[trade.toTier] = (shipInventory[trade.toTier] || 0) + gained;

          // Profit tracking
          if (trade.toTier === "T5") t5 += gained;
          if (trade.toTier === "T6") t6 += gained;
          if (trade.toTier === "T7") t7 += gained;
          if (trade.toTier === "CC") cc += gained;
        }
        parley += trade.parley * trade.exchanges;
      }

      return { ...trade, originalIdx: idx, canDo, missing };
    });

    // Calculate correct Starting Weight and Peak Weight for the route
    let startW = 0;
    Object.keys(broughtFromPort).forEach(tier => {
      startW += broughtFromPort[tier] * (TIER_DATA[tier]?.weight || 0);
    });

    let currentW = startW;
    let peakW = startW;

    simBoard.forEach(trade => {
      if (trade.enabled && trade.canDo) {
        if (trade.fromTier !== 'T0' && trade.fromTier !== 'Trade Goods') {
          currentW -= trade.exchanges * (TIER_DATA[trade.fromTier]?.weight || 0);
        }
        currentW += (trade.toQty * trade.exchanges) * (TIER_DATA[trade.toTier]?.weight || 0);
        if (currentW > peakW) peakW = currentW;
      }
    });

    return { 
      simulatedBoard: simBoard, 
      peakWeight: peakW, 
      startWeight: startW, 
      totalParley: parley, 
      t5ToSell: t5, 
      t6ToSell: t6, 
      t7ToSell: t7, 
      ccGained: cc 
    };
  }, [state.board, state.inventory]);

  const { simulatedBoard, peakWeight, startWeight, totalParley, t5ToSell, t6ToSell, t7ToSell, ccGained } = simulation;

  const isOverweight = peakWeight > MAX_WEIGHT;

  const handleRemoveTrade = (idx) => {
    const newBoard = [...state.board];
    newBoard.splice(idx, 1);
    updateState({ board: newBoard });
  };

  const handleToggleTrade = (idx) => {
    const newBoard = [...state.board];
    newBoard[idx].enabled = !newBoard[idx].enabled;
    updateState({ board: newBoard });
  };

  const moveTrade = (idx, dir) => {
    const newBoard = [...state.board];
    if (dir === -1 && idx > 0) {
      [newBoard[idx-1], newBoard[idx]] = [newBoard[idx], newBoard[idx-1]];
    } else if (dir === 1 && idx < newBoard.length - 1) {
      [newBoard[idx], newBoard[idx+1]] = [newBoard[idx+1], newBoard[idx]];
    }
    updateState({ board: newBoard });
  };

  const clearBoard = () => {
    if (window.confirm("Clear entire route?")) {
      updateState({ board: [] });
    }
  };

  const handleDragStart = (e, idx) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e, idx) => {
    if (draggedIdx !== null && draggedIdx !== idx) {
      setDragOverIdx(idx);
    }
  };

  const handleDragEnd = () => {
    if (draggedIdx !== null && dragOverIdx !== null && draggedIdx !== dragOverIdx) {
      const newBoard = [...state.board];
      const item = newBoard.splice(draggedIdx, 1)[0];
      newBoard.splice(dragOverIdx, 0, item);
      updateState({ board: newBoard });
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleAddToQueue = () => {
    if (!wizardDraft.fromName || !wizardDraft.toName) return;
    setWizardCart([...wizardCart, { ...wizardDraft, enabled: true }]);
    setWizardDraft(prev => ({ ...prev, toName: "" }));
  };

  const handleConfirmWizardCart = () => {
    if (editingTradeIdx !== null) {
      const newBoard = [...state.board];
      newBoard[editingTradeIdx] = { ...wizardDraft, enabled: state.board[editingTradeIdx].enabled };
      updateState({ board: newBoard });
      setEditingTradeIdx(null);
      setShowWizard(false);
      return;
    }

    if (wizardCart.length === 0) return;
    updateState({ board: [...state.board, ...wizardCart] });
    setWizardCart([]);
    setShowWizard(false);
  };

  const handleEditTrade = (idx) => {
    setWizardDraft({ ...state.board[idx] });
    setEditingTradeIdx(idx);
    setShowWizard(true);
  };

  // ---- Smart Optimizer (Multi-Trip) ----
  const planner = useTripPlanner(state, updateState, MAX_WEIGHT);

  const renderOptimizerModal = () => {
    if (!planner.showOptimizer) return null;
    const fmt = (n) => n.toLocaleString();
    return createPortal(
      <div className="add-trade-overlay" onClick={(e) => { if (e.target.className === 'add-trade-overlay') planner.setShowOptimizer(false); }}>
        <div className="add-trade-modal" style={{ maxWidth: '520px' }}>
          <h3>🤖 Smart Optimizer</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Plans multiple trips based on your inventory, weight limit & parley. Lower tiers trade first.
          </p>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>🎯 Goal</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className={planner.optimizerGoal === 'stocking' ? 'btn-primary' : 'btn-secondary'} onClick={() => planner.setOptimizerGoal('stocking')} style={{ flex: 1, padding: '10px' }}>📦 Stocking</button>
              <button className={planner.optimizerGoal === 'silver' ? 'btn-primary' : 'btn-secondary'} onClick={() => planner.boardTiers.hasSilverChain && planner.setOptimizerGoal('silver')} disabled={!planner.boardTiers.hasSilverChain} style={{ flex: 1, padding: '10px', opacity: planner.boardTiers.hasSilverChain ? 1 : 0.4 }}>💰 Silver</button>
              <button className={planner.optimizerGoal === 'coins' ? 'btn-primary' : 'btn-secondary'} onClick={() => planner.boardTiers.hasCoinChain && planner.setOptimizerGoal('coins')} disabled={!planner.boardTiers.hasCoinChain} style={{ flex: 1, padding: '10px', opacity: planner.boardTiers.hasCoinChain ? 1 : 0.4 }}>🪙 Coins</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>⚡ Max Parley</label>
              <input type="number" value={planner.optimizerParley} onChange={e => planner.setOptimizerParley(Number(e.target.value))} style={{ width: '100%', padding: '8px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>⚖️ Weight Limit (LT)</label>
              <input type="number" value={planner.optimizerWeight} onChange={e => planner.setOptimizerWeight(Number(e.target.value))} style={{ width: '100%', padding: '8px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <button className="btn-primary" onClick={planner.runOptimizer} style={{ width: '100%', padding: '12px', fontSize: '1rem', marginBottom: '12px' }}>🧮 Plan Trips</button>
          <button className="add-trade-cancel" onClick={() => planner.setShowOptimizer(false)} style={{ width: '100%' }}>✕ Cancel</button>
        </div>
      </div>,
      document.body
    );
  };

  const renderTripList = () => {
    if (planner.trips.length === 0) return null;
    const fmt = (n) => n.toLocaleString();
    return (
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ color: 'var(--accent-cyan)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🚢 Planned Trips ({planner.trips.filter(t => !t.completed).length} remaining)
          <button className="btn-danger" onClick={() => planner.setTrips([])} style={{ marginLeft: 'auto', padding: '4px 12px', fontSize: '0.8rem' }}>Clear Trips</button>
        </h3>
        {planner.trips.map((trip) => (
          <div key={trip.id} style={{
            background: trip.completed ? 'rgba(0,255,0,0.05)' : 'var(--bg-card)',
            border: `1px solid ${trip.completed ? 'var(--safe)' : 'var(--border-color)'}`,
            borderRadius: '8px', padding: '12px', marginBottom: '12px',
            opacity: trip.completed ? 0.6 : 1,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ color: trip.completed ? 'var(--safe)' : 'var(--accent-cyan)', margin: 0 }}>
                {trip.completed ? '✅' : '🚢'} Trip {trip.id}
              </h4>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>⚡ {fmt(trip.totalParley)} parley</span>
                {trip.silverProfit > 0 && <span>💰 {fmt(trip.silverProfit)}</span>}
                {trip.ccGained > 0 && <span>🪙 {trip.ccGained} CC</span>}
              </div>
              {!trip.completed && (
                <button className="btn-success" onClick={() => planner.completeTrip(trip.id)} style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
                  ✅ Complete
                </button>
              )}
              {trip.completed && <span style={{ color: 'var(--safe)', fontWeight: 'bold', fontSize: '0.85rem' }}>Done!</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {trip.trades.map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'var(--bg-dark)', borderRadius: '4px', fontSize: '0.85rem' }}>
                  <span>
                    <span style={{ color: 'var(--text-muted)' }}>{TIER_NAMES[state.lang][t.fromTier] || t.fromTier}</span>{' '}
                    <strong>{t.fromName}</strong>
                    <span style={{ color: 'var(--accent-cyan)', margin: '0 6px' }}>➔</span>
                    <span style={{ color: 'var(--text-muted)' }}>{TIER_NAMES[state.lang][t.toTier] || t.toTier}</span>{' '}
                    <strong>{t.toName}</strong>
                  </span>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>×{t.exchanges}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const completeRun = () => {
    if (!window.confirm(dict.completeRunConfirm || "This will deduct items/parley for all CHECKED trades. Are you sure?")) return;
    
    const newInventory = JSON.parse(JSON.stringify(state.inventory));
    let totalParleyCost = 0;
    const completedIndices = new Set();
    
    simulatedBoard.forEach(trade => {
      if (trade.enabled && trade.canDo !== false) {
        if (trade.fromTier !== 'T0' && trade.fromTier !== 'Trade Goods') {
          const invFrom = newInventory[trade.fromTier];
          const itemIdx = invFrom.findIndex(i => i.name === trade.fromName);
          if (itemIdx !== -1) {
            invFrom[itemIdx].qty -= trade.exchanges;
            if (invFrom[itemIdx].qty < 0) invFrom[itemIdx].qty = 0;
          }
        }
        
        const invTo = newInventory[trade.toTier];
        if (invTo) {
          const toItemIdx = invTo.findIndex(i => i.name === trade.toName);
          const gained = trade.toQty * trade.exchanges;
          if (toItemIdx !== -1) {
            invTo[toItemIdx].qty += gained;
          } else {
            invTo.push({ name: trade.toName, qty: gained });
          }
        }
        totalParleyCost += trade.parley * trade.exchanges;
        completedIndices.add(trade.originalIdx);
      }
    });

    const newParley = Math.max(0, state.parleyCurrent - totalParleyCost);
    const newBoard = state.board.filter((_, idx) => !completedIndices.has(idx));
    updateState({ inventory: newInventory, board: newBoard, parleyCurrent: newParley });
    alert(dict.runComplete || "Run completed successfully!");
  };

  const renderWizard = () => {
    if (!showWizard) return null;
    const canConfirm = wizardDraft.fromName !== "" && wizardDraft.toName !== "";

    return createPortal(
      <div className="add-trade-overlay" onClick={(e) => { if (e.target.className === 'add-trade-overlay') { setShowWizard(false); setWizardCart([]); setEditingTradeIdx(null); } }}>
        <div className="add-trade-modal">
          <h3>{editingTradeIdx !== null ? "✏️ Edit Trade" : `⚓ ${dict.addTrade || "Add Trade"}`}</h3>

          <div className="add-trade-section">
            <span className="add-trade-section-label">{dict.from || "Give (1x)"}</span>
            <div className="add-trade-row">
              <select 
                value={wizardDraft.fromTier} 
                onChange={e => setWizardDraft({...wizardDraft, fromTier: e.target.value, fromName: ""})}
              >
                {/* Note: In app-v3 TRADE_TIERS is array, but here let's use standard tiers */}
                {["T0","T1","T2","T3","T4","T5","T6","T7","CC"].map(t => (
                  <option key={t} value={t}>{TIER_NAMES[state.lang][t] || t}</option>
                ))}
              </select>
              <div style={{flex:1}}>
                <IconSelectBtn 
                  itemName={wizardDraft.fromName} 
                  tier={wizardDraft.fromTier} 
                  onClick={() => setPickerConfig({ field: 'fromName', tier: wizardDraft.fromTier, currentName: wizardDraft.fromName })}
                />
              </div>
            </div>
          </div>

          <div className="add-trade-arrow">⬇</div>

          <div className="add-trade-section">
            <span className="add-trade-section-label">{dict.to || "Receive"}</span>
            <div className="add-trade-row">
              <select 
                value={wizardDraft.toTier} 
                onChange={e => setWizardDraft({...wizardDraft, toTier: e.target.value, toName: ""})}
              >
                {["T0","T1","T2","T3","T4","T5","T6","T7","CC"].map(t => (
                  <option key={t} value={t}>{TIER_NAMES[state.lang][t] || t}</option>
                ))}
              </select>
              <div style={{flex:1}}>
                <IconSelectBtn 
                  itemName={wizardDraft.toName} 
                  tier={wizardDraft.toTier} 
                  onClick={() => setPickerConfig({ field: 'toName', tier: wizardDraft.toTier, currentName: wizardDraft.toName })}
                />
              </div>
            </div>
          </div>

          <div className="add-trade-section">
            <div className="add-trade-qty-row">
              <div className="add-trade-qty-group">
                <label>{dict.qty || "Receive Qty"}</label>
                <input type="number" min="1" value={wizardDraft.toQty} onChange={e => setWizardDraft({...wizardDraft, toQty: Math.max(1, parseInt(e.target.value)||1)})} />
              </div>
              <div className="add-trade-qty-group">
                <label>{dict.times || "Exchanges"}</label>
                <input type="number" min="1" value={wizardDraft.exchanges} onChange={e => setWizardDraft({...wizardDraft, exchanges: Math.max(1, parseInt(e.target.value)||1)})} />
              </div>
              <div className="add-trade-qty-group">
                <label>{dict.parleyCost || "Parley/Trade"}</label>
                <input type="number" min="0" value={wizardDraft.parley} onChange={e => setWizardDraft({...wizardDraft, parley: parseInt(e.target.value)||0})} />
              </div>
            </div>
          </div>

          {editingTradeIdx === null ? (
            <>
              <div className="add-trade-actions" style={{ marginBottom: '16px' }}>
                <button className="add-trade-confirm" disabled={!canConfirm} onClick={handleAddToQueue} style={{ width: '100%', background: 'var(--bg-lighter)' }}>
                  ＋ {dict.addToQueue || "Add to Queue"}
                </button>
              </div>

              <div className="wizard-cart" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ marginBottom: '12px', color: 'var(--accent-cyan)' }}>🛒 {dict.queuedTrades || "Queued Trades"} ({wizardCart.length})</h4>
                <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {wizardCart.length === 0 && <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>{dict.noQueuedTrades || "Queue up trades above before confirming."}</div>}
                  {wizardCart.map((t, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-dark)', padding: '8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{color: 'var(--text-muted)'}}>{TIER_NAMES[state.lang][t.fromTier] || t.fromTier}</span>
                        <span style={{fontWeight: 'bold'}}>{t.fromName}</span>
                        <span style={{color: 'var(--accent-cyan)'}}>➔</span>
                        <span style={{color: 'var(--text-muted)'}}>{TIER_NAMES[state.lang][t.toTier] || t.toTier}</span>
                        <span style={{fontWeight: 'bold'}}>{t.toName}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {t.toQty * t.exchanges} items
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="add-trade-cancel" onClick={() => { setShowWizard(false); setWizardCart([]); }} style={{ flex: 1 }}>
                    ✕ {dict.cancel || "Cancel"}
                  </button>
                  <button className="btn-success" disabled={wizardCart.length === 0} onClick={handleConfirmWizardCart} style={{ flex: 2, padding: '12px', fontSize: '1rem' }}>
                    ✅ {dict.confirmAll || "Confirm Route Additions"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button className="add-trade-cancel" onClick={() => { setShowWizard(false); setEditingTradeIdx(null); }} style={{ flex: 1 }}>
                ✕ {dict.cancel || "Cancel"}
              </button>
              <button className="btn-success" disabled={!canConfirm} onClick={handleConfirmWizardCart} style={{ flex: 2, padding: '12px', fontSize: '1rem' }}>
                💾 Save Changes
              </button>
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  };

  const fmt = (n) => n.toLocaleString();

  return (
    <div>
      <div className="board-header">
        <h2>🗺️ {dict.boardTitle || "Current Barter Route"}</h2>
        <p>{dict.boardDesc || "Plan your trades in order."}</p>
        <div className="board-toolbar" style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          <button className="btn-primary" onClick={() => setShowWizard(true)}>＋ {dict.addTrade || "Add Trade"}</button>
          <button className="btn-secondary" onClick={() => { planner.setOptimizerParley(state.parleyCurrent || 0); planner.setOptimizerWeight(MAX_WEIGHT); planner.setShowOptimizer(true); }}>🤖 Smart Optimize</button>
          <button className="btn-success" onClick={completeRun}>✅ Complete Run</button>
          <button className="btn-danger" onClick={clearBoard}>🗑️ {dict.clearBoard || "Clear Route"}</button>
        </div>
      </div>

      <div className={`weight-tracker ${isOverweight ? "overweight" : ""}`}>
        <div className="weight-col">
          <div className="weight-label">{dict.maxWeight || "Max LT"}</div>
          <div className="weight-value">{fmt(MAX_WEIGHT)}</div>
        </div>
        <div className="weight-col">
          <div className="weight-label">{dict.startingLoad || "Starting Load"}</div>
          <div className="weight-value">{fmt(startWeight)}</div>
        </div>
        <div className="weight-col">
          <div className="weight-label">{dict.peakWeight || "Peak Weight Reached"}</div>
          <div className={`weight-value ${isOverweight ? 'warning' : ''}`}>{fmt(peakWeight)}</div>
        </div>
      </div>
      {isOverweight && (
        <div className="overweight-warning">
          ⚠️ {dict.overweightWarning || "Overweight! You cannot do this route in one trip."}
        </div>
      )}
      {totalParley > state.parleyCurrent && (
        <div className="overweight-warning" style={{ borderColor: '#ffa500' }}>
          ⚡ Not enough parley! Route needs {fmt(totalParley)} but you only have {fmt(state.parleyCurrent)}.
        </div>
      )}

      {/* Inline Parley Tracker */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
        <div style={{ background: 'var(--bg-lighter)', padding: '12px 16px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>⚡ {dict.currentParley || "Current Parley"}</span>
            <input type="number" min="0" max="1000000" value={state.parleyCurrent} onChange={e => updateState({ parleyCurrent: Math.min(PARLEY_CONFIG.maxParley, Math.max(0, parseInt(e.target.value) || 0)) })} style={{ width: '110px', padding: '6px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', textAlign: 'right' }} />
          </div>
          <div className="parley-bar" style={{ height: '8px' }}>
            <div className="parley-fill" style={{ width: `${(state.parleyCurrent / PARLEY_CONFIG.maxParley) * 100}%` }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>{fmt(state.parleyCurrent)} / {fmt(PARLEY_CONFIG.maxParley)}</span>
            <span>Route uses: {fmt(totalParley)}</span>
          </div>
        </div>
        <div style={{ background: 'var(--bg-lighter)', padding: '12px 16px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>🔄 {dict.refreshTracker || "Refreshes"}</span>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Trade</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {Array.from({ length: state.valuePack ? PARLEY_CONFIG.refreshValuePack.tradeRefresh : PARLEY_CONFIG.refreshBase.tradeRefresh }).map((_, i) => (
                  <div key={i} className={`refresh-dot ${i < state.tradeRefreshUsed ? 'used' : ''}`} onClick={() => updateState({ tradeRefreshUsed: i < state.tradeRefreshUsed ? i : i + 1 })} />
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Ship Material</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className={`refresh-dot ${i < state.shipRefreshUsed ? 'used' : ''}`} onClick={() => updateState({ shipRefreshUsed: i < state.shipRefreshUsed ? i : i + 1 })} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="board-list">
        {(() => {
          if (simulatedBoard.length === 0) {
            return <div style={{textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)'}}>No trades added yet.</div>;
          }

          const tierWeight = {"T0":0, "Trade Goods":0, "T1":1, "T2":2, "T3":3, "T4":4, "T5":5, "T6":6, "T7":7, "CC":8};
          const grouped = {};
          simulatedBoard.forEach((trade) => {
            const tier = trade.fromTier;
            if (!grouped[tier]) grouped[tier] = [];
            grouped[tier].push(trade);
          });

          const sortedTiers = Object.keys(grouped).sort((a, b) => {
            return (tierWeight[a] ?? 99) - (tierWeight[b] ?? 99);
          });

          return sortedTiers.map(tier => (
            <div key={tier} className="tier-group" style={{ marginBottom: '24px' }}>
              <h3 style={{
                color: 'var(--accent-cyan)', 
                borderBottom: '1px solid var(--border-color)', 
                paddingBottom: '8px',
                marginBottom: '12px',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📦 {TIER_NAMES[state.lang][tier] || tier}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {grouped[tier].map((trade) => {
                  const idx = trade.originalIdx;
                  return (
                    <div 
                      key={trade.originalIdx + '-' + trade.fromName + '-' + trade.toName} 
                      className={`board-item ${!trade.enabled ? 'disabled' : ''} ${draggedIdx === idx ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragEnter={(e) => handleDragEnter(e, idx)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      style={{
                        borderTop: dragOverIdx === idx && draggedIdx > idx ? '2px solid var(--accent-cyan)' : '',
                        borderBottom: dragOverIdx === idx && draggedIdx < idx ? '2px solid var(--accent-cyan)' : '',
                      }}
                    >
                      <div className="drag-handle" title="Drag to reorder">≡</div>
                      <div className="trade-order">
                        <input 
                          type="checkbox" 
                          checked={trade.enabled !== false} 
                          onChange={() => handleToggleTrade(trade.originalIdx)}
                          style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                          title={dict.toggleEnable || "Toggle Enable"}
                        />
                      </div>
                      <div className="trade-content">
                        <div className="trade-route">
                          <div className="trade-node">
                            <span className="trade-tier">{TIER_NAMES[state.lang][trade.fromTier]}</span>
                            <span className="trade-name" style={{ color: !trade.canDo ? 'var(--critical)' : 'inherit' }}>
                              {trade.fromName}
                            </span>
                          </div>
                          <div className="trade-arrow">➔</div>
                          <div className="trade-node">
                            <span className="trade-tier">{TIER_NAMES[state.lang][trade.toTier]}</span>
                            <span className="trade-name">{trade.toName}</span>
                          </div>
                        </div>
                        <div className="trade-details">
                          <span className="badge" title={dict.exchanges || "Exchanges"}>
                            {trade.toQty}:{trade.toQty * trade.exchanges} <span style={{color:'var(--text-muted)', fontSize:'0.75rem', fontWeight:'normal', marginLeft:'4px'}}>({trade.exchanges} {dict.exchanges || "Exc"})</span>
                          </span>
                          <span className="parley-cost" title={dict.parleyCost || "Parley Cost"}>
                            ⚡ {trade.parley * trade.exchanges}
                          </span>
                          <div className="trade-status">
                            {trade.enabled ? (
                              trade.canDo ? <span style={{color: 'var(--safe)'}}>✅</span> : <span style={{color: 'var(--critical)', fontSize:'0.75rem'}} title={trade.missing.join(", ")}>❌ {trade.missing[0]}</span>
                            ) : (
                              <span style={{color: 'var(--text-muted)'}}>Skipped</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="trade-actions">
                        <button onClick={() => handleEditTrade(trade.originalIdx)} title="Edit Trade">✏️</button>
                        <button onClick={() => handleRemoveTrade(trade.originalIdx)} title={dict.delete || "Delete"}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ));
        })()}
      </div>

      <div className="board-summary">
        <h3>📊 {dict.boardSummary || "Route Profit Summary"}</h3>
        <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
          <div><strong>{dict.totalParley || "Total Parley Cost"}:</strong> <span className="highlight">{fmt(totalParley)}</span></div>
          <div><strong>{dict.potentialProfit || "Potential Profit"}:</strong> 
            <span className="text-gold" style={{marginLeft: '8px'}}>
              {fmt(t5ToSell * TIER_DATA.T5.sellPrice + t6ToSell * TIER_DATA.T6.sellPrice + t7ToSell * TIER_DATA.T7.sellPrice)} Silver
            </span>
          </div>
          {ccGained > 0 && <div><strong>{dict.modeCrow || "Crow Coins"}:</strong> <span className="highlight">{fmt(ccGained)}</span></div>}
        </div>
      </div>

      {renderTripList()}

      {renderWizard()}
      {renderOptimizerModal()}
      
      {pickerConfig && (
        <IconPickerModal 
          tier={pickerConfig.tier} 
          currentName={pickerConfig.currentName} 
          onSelect={(name) => {
            setWizardDraft({...wizardDraft, [pickerConfig.field]: name});
            setPickerConfig(null);
          }} 
          onClose={() => setPickerConfig(null)} 
          lang={state.lang}
        />
      )}
    </div>
  );
}
