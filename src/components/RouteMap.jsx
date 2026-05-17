import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { findCoords, saveCustomCoord } from '../data/map-data';

export function RouteMap({ trips, onClose }) {
  const [activeTripId, setActiveTripId] = useState(trips.length > 0 ? trips[0].id : null);
  const activeTrip = trips.find(t => t.id === activeTripId);
  const [bgImage, setBgImage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [renderTrigger, setRenderTrigger] = useState(0); // force re-render when custom coords change
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedBg = localStorage.getItem('bdo_custom_map_bg');
    if (savedBg) setBgImage(savedBg);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setBgImage(base64);
        try {
          localStorage.setItem('bdo_custom_map_bg', base64);
        } catch (err) {
          alert("Image is too large to save in local storage. Please use a smaller image/screenshot.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearBg = () => {
    if (window.confirm("Remove custom background image?")) {
      setBgImage(null);
      localStorage.removeItem('bdo_custom_map_bg');
    }
  };

  const handleMapClick = (e) => {
    if (!editMode) return;
    
    // Get coordinates relative to the map container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const name = window.prompt("📍 Edit Mode: Clicked at (" + Math.round(x) + ", " + Math.round(y) + ")\nEnter the exact Island Name for this spot (e.g. 'Lema Island'):");
    if (name && name.trim() !== "") {
      saveCustomCoord(name.trim(), x, y);
      setRenderTrigger(prev => prev + 1); // trigger re-render
    }
  };

  const mapStyle = {
    position: 'relative',
    width: '1000px',
    height: '800px',
    backgroundColor: '#0a1929',
    backgroundImage: bgImage ? `url(${bgImage})` : `
      linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)
    `,
    backgroundSize: bgImage ? '100% 100%' : '50px 50px',
    backgroundRepeat: 'no-repeat',
    border: editMode ? '4px dashed var(--accent-cyan)' : '2px solid var(--border-color)',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    margin: '0 auto',
    cursor: editMode ? 'crosshair' : 'default',
  };

  const renderPointsAndLines = () => {
    if (!activeTrip && !editMode) return null;

    const points = [];
    if (activeTrip) {
      activeTrip.trades.forEach((trade, idx) => {
        const coords = findCoords(trade.location);
        if (coords) {
          points.push({ ...coords, trade, idx });
        }
      });
    }

    if (points.length === 0 && !editMode) {
      return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.7)', padding: '12px 24px', borderRadius: '8px' }}>
          No valid locations found in this trip.<br/>
          Edit your trades and add valid Island names to the Region/Location field.
        </div>
      );
    }

    const lines = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const length = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);

      lines.push(
        <div key={`line-${i}`} style={{
          position: 'absolute',
          left: `${p1.x}px`,
          top: `${p1.y}px`,
          width: `${length}px`,
          height: '2px',
          background: 'var(--accent-cyan)',
          transformOrigin: '0 50%',
          transform: `rotate(${angle}deg)`,
          boxShadow: '0 0 8px var(--accent-cyan)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />
      );
    }

    return (
      <>
        {lines}
        {points.map((p, i) => (
          <div key={`point-${i}-${renderTrigger}`} style={{
            position: 'absolute',
            left: `${p.x}px`,
            top: `${p.y}px`,
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: i === 0 ? 'var(--safe)' : (i === points.length - 1 ? 'var(--critical)' : 'var(--accent-cyan)'),
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: '0 0 10px rgba(0,0,0,0.8)'
            }} />
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              marginTop: '4px',
              whiteSpace: 'nowrap',
              border: p.custom ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)'
            }}>
              <span style={{color:'var(--text-muted)', marginRight:'4px'}}>{i+1}.</span> 
              {p.name}
              <div style={{fontSize: '0.7rem', color: 'var(--text-secondary)'}}>{p.trade.fromName} ➔</div>
            </div>
          </div>
        ))}
      </>
    );
  };

  return createPortal(
    <div className="add-trade-overlay" style={{ padding: '20px', zIndex: 1000 }} onClick={(e) => { if (e.target.className.includes('add-trade-overlay')) onClose(); }}>
      <div style={{ background: 'var(--bg-darker)', width: '100%', maxWidth: '1200px', height: '90vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>🗺️ Route Visualizer & Editor</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className={editMode ? "btn-primary" : "btn-secondary"} onClick={() => setEditMode(!editMode)}>
              {editMode ? "✅ Done Editing" : "✏️ Edit Map Layout"}
            </button>
            <button className="add-trade-cancel" onClick={onClose} style={{ padding: '6px 12px' }}>✕ Close</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Sidebar */}
          <div style={{ width: '280px', background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            
            {editMode && (
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', background: 'rgba(74, 144, 217, 0.1)' }}>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--accent-cyan)' }}>✏️ Editor Tools</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  1. Upload your custom map background.<br/>
                  2. Click anywhere on the map to define an island's exact coordinate.<br/>
                  3. Your custom locations override the default ones!
                </p>
                
                <input 
                  type="file" 
                  accept="image/png, image/jpeg" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleImageUpload} 
                />
                <button className="btn-secondary" style={{ width: '100%', marginBottom: '8px' }} onClick={() => fileInputRef.current.click()}>
                  🖼️ Upload Map Image
                </button>
                {bgImage && (
                  <button className="btn-danger" style={{ width: '100%', fontSize: '0.8rem' }} onClick={handleClearBg}>
                    ✕ Remove Background
                  </button>
                )}
              </div>
            )}

            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
              🚢 Planned Trips
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {trips.length === 0 ? (
                <div style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center' }}>No planned trips.</div>
              ) : (
                trips.map(trip => (
                  <div 
                    key={trip.id} 
                    onClick={() => setActiveTripId(trip.id)}
                    style={{ 
                      padding: '16px', 
                      cursor: 'pointer',
                      background: activeTripId === trip.id ? 'rgba(74, 144, 217, 0.15)' : 'transparent',
                      borderLeft: activeTripId === trip.id ? '4px solid var(--accent-cyan)' : '4px solid transparent',
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', color: activeTripId === trip.id ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                      Trip {trip.id} {trip.completed ? '(Done)' : ''}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {trip.trades.length} trades
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Map Area */}
          <div style={{ flex: 1, padding: '20px', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050a10' }}>
            <div style={{ overflow: 'auto', width: '100%', height: '100%' }}>
              <div style={mapStyle} onClick={handleMapClick}>
                {renderPointsAndLines()}
                
                {/* Fallback Labels if no custom bg uploaded */}
                {!bgImage && !editMode && (
                  <>
                    <div style={{ position:'absolute', top: '150px', left: '150px', color: 'rgba(255,255,255,0.1)', fontSize: '3rem', fontWeight: 'bold', pointerEvents: 'none' }}>MARGORIA</div>
                    <div style={{ position:'absolute', top: '550px', left: '200px', color: 'rgba(255,255,255,0.1)', fontSize: '3rem', fontWeight: 'bold', pointerEvents: 'none' }}>CALPHEON</div>
                    <div style={{ position:'absolute', top: '650px', left: '550px', color: 'rgba(255,255,255,0.1)', fontSize: '3rem', fontWeight: 'bold', pointerEvents: 'none' }}>BALENOS</div>
                    <div style={{ position:'absolute', top: '650px', left: '900px', color: 'rgba(255,255,255,0.1)', fontSize: '3rem', fontWeight: 'bold', pointerEvents: 'none' }}>VALENCIA</div>
                  </>
                )}
                
                {editMode && (
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.8)', color: 'var(--accent-cyan)', padding: '8px 16px', borderRadius: '4px', border: '1px dashed var(--accent-cyan)', pointerEvents: 'none', zIndex: 100 }}>
                    Click anywhere to assign a location!
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
