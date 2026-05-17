import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { findCoords } from '../data/map-data';

export function RouteMap({ trips, onClose }) {
  const [activeTripId, setActiveTripId] = useState(trips.length > 0 ? trips[0].id : null);
  const activeTrip = trips.find(t => t.id === activeTripId);

  // We use a generic background pattern to represent the sea since we don't have the real image yet.
  // The user can replace public/map.jpg later with a real game map screenshot.
  const mapStyle = {
    position: 'relative',
    width: '1000px',
    height: '800px',
    backgroundColor: '#0a1929', // Deep sea blue
    backgroundImage: `
      linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
    border: '2px solid var(--border-color)',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    margin: '0 auto',
  };

  const renderPointsAndLines = () => {
    if (!activeTrip) return null;

    const points = [];
    activeTrip.trades.forEach((trade, idx) => {
      const coords = findCoords(trade.location);
      if (coords) {
        points.push({ ...coords, trade, idx });
      }
    });

    if (points.length === 0) {
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
      
      // Calculate length and angle for the line
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
          zIndex: 1
        }} />
      );
    }

    return (
      <>
        {lines}
        {points.map((p, i) => (
          <div key={`point-${i}`} style={{
            position: 'absolute',
            left: `${p.x}px`,
            top: `${p.y}px`,
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
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
              border: '1px solid var(--border-color)'
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
      <div style={{ background: 'var(--bg-darker)', width: '100%', maxWidth: '1040px', height: '90vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>🗺️ Route Visualizer</h2>
          <button className="add-trade-cancel" onClick={onClose} style={{ padding: '6px 12px' }}>✕ Close</button>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Sidebar */}
          <div style={{ width: '250px', background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Select a trip to view its sailing path.
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
            {/* Scrollable container if map is larger than viewport */}
            <div style={{ overflow: 'auto', width: '100%', height: '100%' }}>
              <div style={mapStyle}>
                {renderPointsAndLines()}
                {/* Fake Continent Labels just for flavor until user adds real map image */}
                <div style={{ position:'absolute', top: '150px', left: '150px', color: 'rgba(255,255,255,0.1)', fontSize: '3rem', fontWeight: 'bold', pointerEvents: 'none' }}>MARGORIA</div>
                <div style={{ position:'absolute', top: '550px', left: '200px', color: 'rgba(255,255,255,0.1)', fontSize: '3rem', fontWeight: 'bold', pointerEvents: 'none' }}>CALPHEON</div>
                <div style={{ position:'absolute', top: '650px', left: '550px', color: 'rgba(255,255,255,0.1)', fontSize: '3rem', fontWeight: 'bold', pointerEvents: 'none' }}>BALENOS</div>
                <div style={{ position:'absolute', top: '650px', left: '900px', color: 'rgba(255,255,255,0.1)', fontSize: '3rem', fontWeight: 'bold', pointerEvents: 'none' }}>VALENCIA</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
