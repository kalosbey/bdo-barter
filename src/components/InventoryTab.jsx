import React, { useState } from 'react';
import { LANG, TIER_NAMES } from '../data/lang';
import { TIER_DATA, DEFAULT_THRESHOLDS } from '../data/barter-data-v3';
import { IconSelectBtn, IconPickerModal } from './IconPickerModal';

export function InventoryTab({ state, updateState }) {
  const dict = LANG[state.lang] || LANG.en;
  const INVENTORY_TIERS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "CC"];

  const [pickerConfig, setPickerConfig] = useState(null); // { tier, idx, currentName }

  const [draggedItem, setDraggedItem] = useState(null); // { tier, idx }
  const [dragOverItem, setDragOverItem] = useState(null); // { tier, idx }

  const getTierTotal = (tier) => {
    return (state.inventory[tier] || []).reduce((sum, item) => sum + (item.qty || 0), 0);
  };

  const getTierItemCount = (tier) => {
    return (state.inventory[tier] || []).length;
  };

  const getStockStatus = (tier) => {
    const items = state.inventory[tier] || [];
    if (!DEFAULT_THRESHOLDS[tier]) return "sell"; // T6/T7/CC = sell items
    const safeLvl = state.safeStock[tier] || 30;
    const warnLvl = Math.floor(safeLvl / 2);
    
    if (items.length === 0) return "critical";
    
    let worstStatus = "safe";
    items.forEach(item => {
      if (item.qty < warnLvl) {
        worstStatus = "critical";
      } else if (item.qty < safeLvl && worstStatus !== "critical") {
        worstStatus = "warning";
      }
    });
    return worstStatus;
  };

  const fmt = (n) => {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n.toLocaleString();
  };

  const toggleTier = (tier) => {
    updateState({ openTiers: { ...state.openTiers, [tier]: !state.openTiers[tier] } });
  };

  const handleQtyChange = (tier, idx, value) => {
    const newInv = { ...state.inventory };
    newInv[tier][idx].qty = Math.max(0, parseInt(value) || 0);
    updateState({ inventory: newInv });
  };

  const handleRemoveItem = (tier, idx) => {
    const newInv = { ...state.inventory };
    newInv[tier].splice(idx, 1);
    updateState({ inventory: newInv });
  };

  const handleAddItem = (tier) => {
    // Open the icon picker in multi-select mode directly
    setPickerConfig({ tier, isMulti: true, currentName: null, excludeNames: (state.inventory[tier] || []).map(i => i.name) });
  };

  const handleIconSelect = (name) => {
    if (pickerConfig) {
      const { tier, idx } = pickerConfig;
      const newInv = { ...state.inventory };
      newInv[tier][idx].name = name;
      updateState({ inventory: newInv });
      setPickerConfig(null);
    }
  };

  const handleConfirmMulti = (cartItems) => {
    if (pickerConfig) {
      const { tier } = pickerConfig;
      const newInv = { ...state.inventory };
      
      // cartItems is an array of {name, qty}
      cartItems.forEach(item => {
        newInv[tier].push({ name: item.name, qty: item.qty });
      });
      
      updateState({ inventory: newInv });
      setPickerConfig(null);
    }
  };

  const handleDragStart = (e, tier, idx) => {
    setDraggedItem({ tier, idx });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e, tier, idx) => {
    if (draggedItem && draggedItem.tier === tier && draggedItem.idx !== idx) {
      setDragOverItem({ tier, idx });
    }
  };

  const handleDragEnd = () => {
    if (draggedItem && dragOverItem && draggedItem.tier === dragOverItem.tier && draggedItem.idx !== dragOverItem.idx) {
      const tier = draggedItem.tier;
      const newInv = { ...state.inventory };
      const item = newInv[tier].splice(draggedItem.idx, 1)[0];
      newInv[tier].splice(dragOverItem.idx, 0, item);
      updateState({ inventory: newInv });
    }
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const renderDecisionBanner = () => {
    const lowItems = [], warningItems = [];
    ["T1", "T2", "T3", "T4", "T5"].forEach(t => {
      const items = state.inventory[t] || [];
      const safeLvl = state.safeStock[t] || 30;
      const warnLvl = Math.floor(safeLvl / 2);

      items.forEach(item => {
        if (item.qty < warnLvl) {
          lowItems.push(`${item.name} (${item.qty})`);
        } else if (item.qty < safeLvl) {
          warningItems.push(`${item.name} (${item.qty})`);
        }
      });
    });

    const formatList = (list) => {
      if (list.length <= 4) return list.join(", ");
      return list.slice(0, 4).join(", ") + ` (+${list.length - 4} more)`;
    };

    const emptyTiers = ["T1", "T2", "T3", "T4", "T5"].filter(t => getTierItemCount(t) === 0);
    let goalAdvice = "";
    if (state.goal === "silver") goalAdvice = "Focus on trading up to T6/T7 for silver.";
    else if (state.goal === "crowcoins") goalAdvice = "Focus T4→Crow Coin trades. Keep T4 stocked.";
    else goalAdvice = "Balance silver runs (T5→T7) with Crow Coin trades (T4).";

    if (emptyTiers.length >= 3) {
      return (
        <div id="decision-banner" className="decision-banner stockpile">
          <span className="decision-icon">📝</span>
          <div className="decision-text">
            <strong>{dict.addItemsFirst || "Add your items first!"}</strong>
            <span>{dict.addItemsDesc || "Open each tier and add the specific items you have in storage."}</span>
          </div>
        </div>
      );
    } else if (lowItems.length > 0) {
      return (
        <div id="decision-banner" className="decision-banner stockpile">
          <span className="decision-icon">📦</span>
          <div className="decision-text">
            <strong>{dict.stockpileDay || "Stockpile Day — Restock needed!"}</strong>
            <span style={{ fontSize: '0.85rem' }}>{dict.critical || "Critical"}: {formatList(lowItems)}{warningItems.length ? " | " + dict.low + ": " + formatList(warningItems) : ""}</span>
          </div>
        </div>
      );
    } else if (warningItems.length >= 2) {
      return (
        <div id="decision-banner" className="decision-banner stockpile">
          <span className="decision-icon">⚠️</span>
          <div className="decision-text">
            <strong>{dict.considerStock || "Consider Stockpiling Today"}</strong>
            <span style={{ fontSize: '0.85rem' }}>{dict.low || "Low"}: {formatList(warningItems)}. Risk of running out soon.</span>
          </div>
        </div>
      );
    } else {
      return (
        <div id="decision-banner" className="decision-banner profit">
          <span className="decision-icon">🚀</span>
          <div className="decision-text">
            <strong>{dict.readyProfit || "Ready to Trade for Profit!"}</strong>
            <span>{goalAdvice}{warningItems.length ? " (Watch: " + formatList(warningItems) + ")" : ""}</span>
          </div>
        </div>
      );
    }
  };

  const renderTodayEstimate = () => {
    const t5val = getTierTotal("T5") * TIER_DATA.T5.sellPrice;
    const t6val = getTierTotal("T6") * TIER_DATA.T6.sellPrice;
    const t7val = getTierTotal("T7") * TIER_DATA.T7.sellPrice;
    const totalSellable = t5val + t6val + t7val;
    const t4 = getTierTotal("T4");

    return (
      <div className="daily-stats-row">
        {state.goal !== "crowcoins" && (
          <div className="stat-box silver-box" id="today-silver-result">
            <div className="stat-value highlight" id="today-profit">{fmt(totalSellable)}</div>
            <div className="stat-label">{dict.sellableValue || "Sellable Value (T5+T6+T7)"}</div>
          </div>
        )}
        {state.goal !== "silver" && (
          <div className="stat-box crow-box" id="today-crow-result">
            <div className="stat-value highlight" id="today-crow">{t4} T4 available</div>
            <div className="stat-label">{dict.t4ForCrow || "T4 Available for Crow Coins"}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {renderDecisionBanner()}
      {renderTodayEstimate()}

      <div className="inventory-header">
        <h2>📦 {dict.itemInventory || "Item Inventory"} <span style={{fontSize:'1rem', color:'var(--text-secondary)'}}>{dict.itemInventoryHint || "(Click a tier to expand — Add your specific items)"}</span></h2>
      </div>

      <div id="inventory-container">
        {INVENTORY_TIERS.map(tier => {
          const td = TIER_DATA[tier];
          const items = state.inventory[tier] || [];
          const total = getTierTotal(tier);
          const itemCount = getTierItemCount(tier);
          const status = getStockStatus(tier);
          const isOpen = state.openTiers[tier] || false;
          const isHighTier = tier === "T6" || tier === "T7";

          let statusText, badgeClass;
          if (isHighTier) {
            statusText = fmt(total * td.sellPrice);
            badgeClass = "sell";
          } else {
            if (status === "safe") { statusText = dict.ready || "Ready"; badgeClass = "safe"; }
            else if (status === "warning") { statusText = dict.low || "Low"; badgeClass = "warning"; }
            else { statusText = dict.critical || "Critical"; badgeClass = "critical"; }
          }

          return (
            <div key={tier} className={`tier-block ${isOpen ? "open" : ""}`}>
              <div className="tier-header" onClick={() => toggleTier(tier)}>
                <div className="tier-header-left">
                  <span className="tier-icon">{td.icon}</span>
                  <span className="tier-name">{td.name}</span>
                  <span className="tier-total">{total} {dict.items || "items"} ({itemCount} {dict.types || "types"})</span>
                </div>
                <div className="tier-header-right">
                  <span className={`tier-summary-badge ${badgeClass}`}>{statusText}</span>
                  <span className="tier-chevron">▼</span>
                </div>
              </div>
              <div className="tier-body">
                <div className="tier-items">
                  {items.length === 0 ? (
                    <div className="inv-empty">{dict.noItems || "No items yet — click the button below to add"}</div>
                  ) : (
                    items.map((item, idx) => {
                      const safeLvl = state.safeStock[tier] || 30;
                      const warnLvl = Math.floor(safeLvl / 2);
                      const isLow = !isHighTier && item.qty < safeLvl && item.qty >= warnLvl;
                      const isCritical = !isHighTier && item.qty < warnLvl;

                      return (
                        <div 
                          key={idx + '-' + item.name} 
                          className={`inv-row ${draggedItem?.tier === tier && draggedItem?.idx === idx ? 'dragging' : ''} ${isCritical ? 'inv-row-critical' : isLow ? 'inv-row-warning' : ''}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, tier, idx)}
                        onDragEnter={(e) => handleDragEnter(e, tier, idx)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        style={{
                          borderTop: dragOverItem?.tier === tier && dragOverItem?.idx === idx && draggedItem.idx > idx ? '2px solid var(--accent-cyan)' : '',
                          borderBottom: dragOverItem?.tier === tier && dragOverItem?.idx === idx && draggedItem.idx < idx ? '2px solid var(--accent-cyan)' : '',
                        }}
                      >
                        <div className="drag-handle" title="Drag to reorder" style={{ padding: '0 4px', marginRight: '4px' }}>≡</div>
                        <IconSelectBtn 
                          itemName={item.name} 
                          tier={tier} 
                          onClick={() => setPickerConfig({ tier, idx, currentName: item.name, excludeNames: (state.inventory[tier] || []).map(i => i.name).filter(n => n !== item.name) })}
                        />
                        <input 
                          type="number" 
                          min="0" 
                          value={item.qty} 
                          onChange={(e) => handleQtyChange(tier, idx, e.target.value)} 
                        />
                        <button className="inv-delete-btn" onClick={() => handleRemoveItem(tier, idx)} title="Remove">✕</button>
                      </div>
                    );
                  })
                  )}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <button className="inv-add-btn" style={{ flex: '1' }} onClick={() => handleAddItem(tier)}>
                      ＋ {dict.addItem || "Add Item"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {pickerConfig && (
        <IconPickerModal 
          tier={pickerConfig.tier} 
          currentName={pickerConfig.currentName} 
          onSelect={handleIconSelect} 
          onConfirmMulti={handleConfirmMulti}
          onClose={() => setPickerConfig(null)} 
          lang={state.lang}
          isMulti={pickerConfig.isMulti}
          excludeNames={pickerConfig.excludeNames || []}
        />
      )}
    </div>
  );
}
