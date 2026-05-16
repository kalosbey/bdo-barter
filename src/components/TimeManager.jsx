import React, { useState } from 'react';

export function TimeManager({ state }) {
  const [availableHours, setAvailableHours] = useState(3.5);
  
  const energy = state.energy || 300; // Mock if not in state
  const parley = state.parleyCurrent || 0;
  
  const generateRoutine = () => {
    let minsLeft = availableHours * 60;
    const routine = [];
    let totalProfit = 0;
    
    // 1. Bartering (Semi-AFK) - High profit, burns Parley
    const parleyPerRun = 250000;
    const barterMins = 45;
    const barterProfit = 150000000; // Est 150m per run

    let possibleRuns = Math.floor(parley / parleyPerRun);
    if (possibleRuns > 0 && minsLeft >= barterMins) {
      const runsToDo = Math.min(possibleRuns, Math.floor(minsLeft / barterMins));
      if (runsToDo > 0) {
        routine.push({
          activity: '⛵ Barter Run (Semi-AFK)',
          duration: runsToDo * barterMins,
          desc: `Do ${runsToDo} trade routes to burn ${(runsToDo * parleyPerRun).toLocaleString()} Parley.`,
          profit: runsToDo * barterProfit
        });
        minsLeft -= (runsToDo * barterMins);
        totalProfit += (runsToDo * barterProfit);
      }
    }

    // 2. Gathering (Active) - Burns Energy
    const gatherMins = 45;
    const gatherProfit = 120000000; // Est 120m per 300 energy
    if (energy >= 150 && minsLeft >= 30) {
      routine.push({
        activity: '🥩 Gathering (Active)',
        duration: gatherMins,
        desc: `Gather meat/blood or sap to burn your ${energy} energy. High active effort.`,
        profit: gatherProfit
      });
      minsLeft -= gatherMins;
      totalProfit += gatherProfit;
    }

    // 3. Cooking/Processing (AFK) - Fills remaining time
    if (minsLeft > 15) {
      const cookProfitPerHour = 80000000;
      const profit = Math.floor((minsLeft / 60) * cookProfitPerHour);
      routine.push({
        activity: '🍳 Cooking / Processing (AFK)',
        duration: minsLeft,
        desc: `Cook Imperial boxes or process materials while you take a real-life break or watch a show.`,
        profit: profit
      });
      totalProfit += profit;
      minsLeft = 0;
    }

    return { routine, totalProfit };
  };

  const { routine, totalProfit } = generateRoutine();
  const silverPerHour = totalProfit / availableHours;

  const fmt = (n) => {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    return n.toLocaleString();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div className="board-header">
        <h2>⏱️ Time Optimization Engine</h2>
        <p>Maximize your profit within your limited real-life schedule.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        
        <div style={{ background: 'var(--bg-lighter)', padding: '1.5rem', borderRadius: '12px' }}>
          <h3>Your Schedule</h3>
          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>How many hours can you play today?</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="range" 
                min="0.5" max="8" step="0.5" 
                value={availableHours} 
                onChange={(e) => setAvailableHours(parseFloat(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '60px', textAlign: 'right' }}>
                {availableHours} h
              </span>
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Current Parley:</span>
              <span style={{ fontWeight: 'bold' }}>{parley.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Current Energy:</span>
              <span style={{ fontWeight: 'bold' }}>{energy}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              (Routine calculates based on burning these resources first)
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-lighter)', padding: '1.5rem', borderRadius: '12px' }}>
          <h3>Recommended Routine</h3>
          
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {routine.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>Not enough time to generate a routine.</div>
            ) : (
              routine.map((item, idx) => (
                <div key={idx} style={{ padding: '1rem', borderLeft: '4px solid var(--accent-cyan)', background: 'var(--bg-dark)', borderRadius: '0 8px 8px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '1.1rem' }}>{item.activity}</strong>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{Math.floor(item.duration / 60)}h {item.duration % 60}m</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{item.desc}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-gold)' }}>+ {fmt(item.profit)} Silver</div>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Estimated Profit:</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-gold)' }}>{fmt(totalProfit)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Efficiency Rating:</span>
              <span style={{ fontWeight: 'bold', color: silverPerHour > 100000000 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                {fmt(silverPerHour)} / hr
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
