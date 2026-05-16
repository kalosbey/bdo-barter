import React, { useState } from 'react';
import { LANG } from '../data/lang';
import { TIER_DATA } from '../data/barter-data-v3';

export function ProfitCalc({ state, updateState }) {
  const dict = LANG[state.lang] || LANG.en;

  const [t5, setT5] = useState(0);
  const [t6, setT6] = useState(0);
  const [t7, setT7] = useState(0);

  const t5rev = t5 * TIER_DATA.T5.sellPrice;
  const t6rev = t6 * TIER_DATA.T6.sellPrice;
  const t7rev = t7 * TIER_DATA.T7.sellPrice;
  const total = t5rev + t6rev + t7rev;

  const fmt = (n) => n.toLocaleString();

  return (
    <div style={{ padding: '2rem' }}>
      <div className="board-header">
        <h2>💰 {dict.tabProfit || "Profit Calculator"}</h2>
        <p>{dict.sellValueCalc || "Calculate your total silver value from selling high-tier items."}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ background: 'var(--bg-lighter)', padding: '1.5rem', borderRadius: '12px' }}>
          <h3>{dict.sellNote || "Enter amounts to sell"}</h3>
          
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>{dict.t5ToSell || "T5 to Sell"}</label>
              <input type="number" min="0" value={t5} onChange={e => setT5(parseInt(e.target.value) || 0)} style={{ width: '80px', padding: '8px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '6px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>{dict.t6ToSell || "T6 to Sell"}</label>
              <input type="number" min="0" value={t6} onChange={e => setT6(parseInt(e.target.value) || 0)} style={{ width: '80px', padding: '8px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '6px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>{dict.t7ToSell || "T7 to Sell"}</label>
              <input type="number" min="0" value={t7} onChange={e => setT7(parseInt(e.target.value) || 0)} style={{ width: '80px', padding: '8px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '6px' }} />
            </div>
          </div>

          <h3 style={{ marginTop: '2rem' }}>{dict.dailyAvg || "Daily Average (for Weekly Planner)"}</h3>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>{dict.t7PerDay || "Avg T7 per Profit Day"}</label>
              <input type="number" min="0" value={state.avgT7PerDay} onChange={e => updateState({ avgT7PerDay: parseInt(e.target.value) || 0 })} style={{ width: '80px', padding: '8px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '6px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>{dict.ccPerDay || "Avg CC per Profit Day"}</label>
              <input type="number" min="0" value={state.avgCrowCoinsPerDay} onChange={e => updateState({ avgCrowCoinsPerDay: parseInt(e.target.value) || 0 })} style={{ width: '80px', padding: '8px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '6px' }} />
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-lighter)', padding: '1.5rem', borderRadius: '12px' }}>
          <h3>{dict.breakdown || "Profit Breakdown"}</h3>
          
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '8px 0' }}>{dict.item || "Item"}</th>
                <th style={{ padding: '8px 0' }}>{dict.priceEach || "Price Each"}</th>
                <th style={{ padding: '8px 0', textAlign: 'right' }}>{dict.total || "Total"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0' }}>T5 × {t5}</td>
                <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>{fmt(TIER_DATA.T5.sellPrice)}</td>
                <td style={{ padding: '8px 0', textAlign: 'right', color: t5rev > 0 ? 'var(--text-gold)' : 'inherit' }}>{fmt(t5rev)}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0' }}>T6 × {t6}</td>
                <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>{fmt(TIER_DATA.T6.sellPrice)}</td>
                <td style={{ padding: '8px 0', textAlign: 'right', color: t6rev > 0 ? 'var(--text-gold)' : 'inherit' }}>{fmt(t6rev)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '8px 0' }}>T7 × {t7}</td>
                <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>{fmt(TIER_DATA.T7.sellPrice)}</td>
                <td style={{ padding: '8px 0', textAlign: 'right', color: t7rev > 0 ? 'var(--accent-cyan)' : 'inherit' }}>{fmt(t7rev)}</td>
              </tr>
              <tr>
                <td style={{ padding: '16px 0', fontWeight: 'bold' }}>Total Revenue</td>
                <td></td>
                <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-cyan)', fontSize: '1.2rem' }}>{fmt(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
