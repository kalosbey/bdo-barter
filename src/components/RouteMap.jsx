import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { findCoords, saveCustomCoord, getCustomCoords, removeCustomCoord, MAP_COORDS } from '../data/map-data';

export function RouteMap({ trips, onClose }) {
  const [activeTripId, setActiveTripId] = useState(null); // null means Global Map
  const activeTrip = trips.find(t => t.id === activeTripId);
  const [bgImage, setBgImage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [renderTrigger, setRenderTrigger] = useState(0); // force re-render when custom coords change
  const [pendingClick, setPendingClick] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0, sLeft: 0, sTop: 0, time: 0 });
  const scrollWrapperRef = useRef(null);
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

  const handleMouseDown = (e) => {
    if (e.button !== 0 || pendingClick || e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'button') return;
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      sLeft: scrollWrapperRef.current.scrollLeft,
      sTop: scrollWrapperRef.current.scrollTop,
      time: Date.now()
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollWrapperRef.current) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    scrollWrapperRef.current.scrollLeft = dragStartPos.current.sLeft - dx;
    scrollWrapperRef.current.scrollTop = dragStartPos.current.sTop - dy;
  };

  const handleMouseUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const timeDelta = Date.now() - dragStartPos.current.time;
    
    // If it was a quick click without moving, process it as a map click
    if (dist < 5 && timeDelta < 500 && editMode && !pendingClick) {
      const rect = scrollWrapperRef.current.firstElementChild.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoomLevel;
      const y = (e.clientY - rect.top) / zoomLevel;

      // Check if clicking near an existing custom point
      const customCoords = getCustomCoords();
      for (const [name, data] of Object.entries(customCoords)) {
        const d = Math.sqrt(Math.pow(x - data.x, 2) + Math.pow(y - data.y, 2));
        if (d < 15) {
          if (window.confirm(`Delete custom location: ${name}?`)) {
            removeCustomCoord(name);
            setRenderTrigger(prev => prev + 1);
          }
          return;
        }
      }
      setPendingClick({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const mapStyle = {
    position: 'relative',
    width: `${1000 * zoomLevel}px`,
    height: `${800 * zoomLevel}px`,
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
  };

  const renderPointsAndLines = () => {
    if (!activeTrip && !editMode) return null;

    const points = [];
    if (activeTrip && !editMode) {
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
      
      const x1 = p1.x * zoomLevel;
      const y1 = p1.y * zoomLevel;
      const x2 = p2.x * zoomLevel;
      const y2 = p2.y * zoomLevel;

      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

      lines.push(
        <div key={`line-${i}`} style={{
          position: 'absolute',
          left: `${x1}px`,
          top: `${y1}px`,
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
            left: `${p.x * zoomLevel}px`,
            top: `${p.y * zoomLevel}px`,
            transform: 'translate(-50%, -50%)',
            zIndex: 3,
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
        {/* Render ALL custom points when activeTripId is null OR when in editMode */}
        {(editMode || activeTripId === null) && Object.entries(getCustomCoords()).map(([name, data]) => (
          <div key={`edit-pt-${name}-${renderTrigger}`} style={{
            position: 'absolute',
            left: `${data.x * zoomLevel}px`,
            top: `${data.y * zoomLevel}px`,
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--accent-gold)', borderRadius: '50%', border: '2px solid white' }} />
            <div style={{ background: 'rgba(0,0,0,0.8)', color: 'var(--accent-gold)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', marginTop: '4px', whiteSpace: 'nowrap' }}>
              {name}
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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <button className="btn-secondary" onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.25))} style={{ padding: '2px 8px', fontSize: '0.8rem' }}>➖</button>
              <div style={{ color: 'white', padding: '0 8px', display: 'flex', alignItems: 'center', fontSize: '0.9rem', fontWeight: 'bold', minWidth: '45px', justifyContent: 'center' }}>{Math.round(zoomLevel * 100)}%</div>
              <button className="btn-secondary" onClick={() => setZoomLevel(z => Math.min(4, z + 0.25))} style={{ padding: '2px 8px', fontSize: '0.8rem' }}>➕</button>
            </div>
            {activeTripId === null && (
              <button className={editMode ? "btn-primary" : "btn-secondary"} onClick={() => setEditMode(!editMode)}>
                {editMode ? "✅ Done Editing" : "✏️ Edit Map Layout"}
              </button>
            )}
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
                  2. Click anywhere on the map to define a location's exact coordinate.<br/>
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
              <div 
                onClick={() => { setActiveTripId(null); }}
                style={{ 
                  padding: '16px', 
                  cursor: 'pointer',
                  background: activeTripId === null ? 'rgba(74, 144, 217, 0.15)' : 'transparent',
                  borderLeft: activeTripId === null ? '4px solid var(--accent-gold)' : '4px solid transparent',
                  borderBottom: '1px solid var(--border-color)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🗺️</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: activeTripId === null ? 'var(--accent-gold)' : 'var(--text-primary)' }}>Global Map</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Edit layout & see all locations</div>
                </div>
              </div>

              {trips.length === 0 ? (
                <div style={{ padding: '16px', color: 'var(--text-muted)', textAlign: 'center' }}>No planned trips.</div>
              ) : (
                trips.map(trip => (
                  <div 
                    key={trip.id} 
                    onClick={() => { setActiveTripId(trip.id); setEditMode(false); }}
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
          <div style={{ flex: 1, padding: '20px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050a10' }}>
            <div 
              ref={scrollWrapperRef}
              style={{ overflow: 'auto', width: '100%', height: '100%', cursor: isDragging ? 'grabbing' : (editMode ? 'crosshair' : 'grab') }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              <div style={mapStyle}>
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
                
                {pendingClick && (
                  <div style={{
                    position: 'absolute',
                    left: `${pendingClick.x * zoomLevel}px`,
                    top: `${pendingClick.y * zoomLevel}px`,
                    transform: 'translate(-50%, -100%)',
                    marginTop: '-10px',
                    background: 'var(--bg-darker)',
                    border: '1px solid var(--accent-cyan)',
                    padding: '12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
                    zIndex: 200,
                    width: '200px'
                  }} onClick={e => e.stopPropagation()}>
                    <label style={{display:'block', marginBottom:'8px', fontSize:'0.85rem', color:'var(--text-secondary)'}}>Select Location/Port Name:</label>
                    <input 
                      type="text" 
                      list="all-islands"
                      placeholder="Type or select..." 
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim() !== '') {
                          saveCustomCoord(e.target.value.trim(), pendingClick.x, pendingClick.y);
                          setPendingClick(null);
                          setRenderTrigger(prev => prev + 1);
                        } else if (e.key === 'Escape') {
                          setPendingClick(null);
                        }
                      }}
                      style={{ width: '100%', padding: '6px', marginBottom: '8px', background:'var(--bg-dark)', border:'1px solid var(--border-color)', color:'white' }} 
                    />
                    <datalist id="all-islands">
                      {Object.keys(MAP_COORDS).sort().map(loc => <option key={loc} value={loc} />)}
                      {Object.keys(getCustomCoords()).sort().map(loc => <option key={loc} value={loc} />)}
                    </datalist>
                    <div style={{display:'flex', gap:'8px'}}>
                      <button className="btn-primary" style={{flex:1, padding:'4px', fontSize:'0.85rem'}} onClick={(e) => {
                        const input = e.target.parentElement.previousElementSibling.previousElementSibling;
                        if (input.value.trim() !== '') {
                          saveCustomCoord(input.value.trim(), pendingClick.x, pendingClick.y);
                          setPendingClick(null);
                          setRenderTrigger(prev => prev + 1);
                        }
                      }}>Save</button>
                      <button className="btn-secondary" style={{flex:1, padding:'4px', fontSize:'0.85rem'}} onClick={() => setPendingClick(null)}>Cancel</button>
                    </div>
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
