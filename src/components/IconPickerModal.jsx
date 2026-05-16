import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BARTER_ITEMS, getBarterItemIcon } from '../data/barter-data-v3';
import { LANG, TIER_NAMES } from '../data/lang';

export function IconPickerModal({ tier, currentName, onSelect, onConfirmMulti, onClose, lang, isMulti, excludeNames = [] }) {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]); // Array of {name, qty}
  const searchInputRef = useRef(null);
  
  const dict = LANG[lang] || LANG.en;
  const tierLabel = TIER_NAMES[lang][tier] || tier;
  const tierItems = BARTER_ITEMS[tier] || [];

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const filteredItems = tierItems.filter(item => {
    const displayName = item[lang] || item.en;
    if (excludeNames.includes(displayName)) return false;
    if (isMulti && cart.some(c => c.name === displayName)) return false;

    if (!search) return true;
    const q = search.toLowerCase().trim();
    const enName = (item.en || '').toLowerCase();
    const thName = (item.th || '').toLowerCase();
    return enName.includes(q) || thName.includes(q);
  });

  const handleCellClick = (displayName) => {
    if (isMulti) {
      const existingIdx = cart.findIndex(c => c.name === displayName);
      if (existingIdx >= 0) {
        setCart(cart.filter((_, i) => i !== existingIdx));
      } else {
        setCart([...cart, { name: displayName, qty: 1 }]);
      }
    } else {
      onSelect(displayName);
    }
  };

  const updateCartQty = (idx, val) => {
    const newCart = [...cart];
    newCart[idx].qty = Math.max(0, parseInt(val) || 0);
    setCart(newCart);
  };

  return createPortal(
    <div className="icon-picker-overlay" onClick={(e) => { if (e.target.className === 'icon-picker-overlay') onClose(); }}>
      <div className="icon-picker-modal">
        <div className="icon-picker-header">
          <div className="icon-picker-title">🖼️ {dict.pickItem || "Select Item"} — {tierLabel}</div>
          <button className="icon-picker-close" onClick={onClose}>✕</button>
        </div>
        <input 
          type="text" 
          className="icon-picker-search" 
          placeholder={dict.searchItem || "Search by name..."}
          value={search}
          onChange={e => setSearch(e.target.value)}
          ref={searchInputRef}
        />
        <div className="icon-picker-grid">
          {filteredItems.length === 0 ? (
            <div className="icon-picker-empty">{dict.noResults || "No items found"}</div>
          ) : (
            filteredItems.map(item => {
              const displayName = item[lang] || item.en;
              const isSelected = isMulti ? cart.some(c => c.name === displayName) : (currentName === item.en || currentName === item.th);
              const iconUrl = getBarterItemIcon(item);

              return (
                <div 
                  key={item.id} 
                  className={`icon-picker-cell ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleCellClick(displayName)}
                >
                  <img src={iconUrl} alt="" onError={(e) => e.target.style.display='none'} />
                  <span className="icon-label">{displayName}</span>
                </div>
              );
            })
          )}
        </div>
        
        {isMulti && (
          <div className="icon-picker-cart" style={{ borderTop: '1px solid var(--border-color)', marginTop: '16px', paddingTop: '16px' }}>
            <h4 style={{ marginBottom: '12px', color: 'var(--accent-cyan)' }}>🛒 {dict.selectedItems || "Selected Items"} ({cart.length})</h4>
            <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cart.length === 0 && <div style={{color: 'var(--text-muted)'}}>{dict.clickToAddCart || "Click items above to add them to your cart."}</div>}
              {cart.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-dark)', padding: '8px', borderRadius: '4px' }}>
                  <span>{c.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty:</label>
                    <input 
                      type="number" 
                      min="0" 
                      value={c.qty} 
                      onChange={(e) => updateCartQty(i, e.target.value)} 
                      style={{ width: '60px', padding: '4px', background: 'var(--bg-light)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '4px' }}
                    />
                    <button 
                      onClick={() => setCart(cart.filter((_, idx) => idx !== i))}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}
                      title="Remove"
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn-success" 
                disabled={cart.length === 0}
                onClick={() => onConfirmMulti(cart)}
                style={{ width: '100%' }}
              >
                ✅ {dict.confirmAdd || "Confirm & Add"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function IconSelectBtn({ itemName, tier, onClick }) {
  const matchItem = () => {
    if (!itemName) return null;
    const tierItems = BARTER_ITEMS[tier] || [];
    const lower = itemName.toLowerCase().trim();
    return tierItems.find(i => (i.en && i.en.toLowerCase() === lower) || (i.th && i.th.toLowerCase() === lower));
  };
  
  const matched = matchItem();
  const iconUrl = matched ? getBarterItemIcon(matched) : null;

  if (itemName && itemName !== "") {
    return (
      <button type="button" className="icon-select-btn" onClick={onClick}>
        {iconUrl && <img src={iconUrl} alt="" onError={(e) => e.target.style.display='none'} />}
        <span className="icon-select-name">{itemName}</span>
        <span className="icon-select-arrow">▼</span>
      </button>
    );
  }
  return (
    <button type="button" className="icon-select-btn" onClick={onClick}>
      <span className="icon-select-placeholder">🖼️ Click to pick item...</span>
      <span className="icon-select-arrow">▼</span>
    </button>
  );
}
