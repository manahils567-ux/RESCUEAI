'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchReplayData } from '../../lib/api';

const DATES_2022 = [
  { label: "25 Jun", ts: "2022-06-25T00:00:00Z", desc: "Before floods" },
  { label: "10 Jul", ts: "2022-07-10T00:00:00Z", desc: "Early monsoon" },
  { label: "1 Aug", ts: "2022-08-01T00:00:00Z", desc: "Floods begin" },
  { label: "15 Aug", ts: "2022-08-15T00:00:00Z", desc: "Severe flooding" },
  { label: "25 Aug", ts: "2022-08-25T00:00:00Z", desc: "🔴 PEAK FLOOD" },
  { label: "5 Sep", ts: "2022-09-05T00:00:00Z", desc: "Receding" },
  { label: "20 Sep", ts: "2022-09-20T00:00:00Z", desc: "Normalizing" }
];

export default function Replay2022Page() {
  const [idx, setIdx] = useState(0);
  const [riskScores, setRiskScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('ur');

  useEffect(() => {
    loadReplayData(DATES_2022[0].ts);
  }, []);

  const loadReplayData = async (timestamp) => {
    setLoading(true);
    const data = await fetchReplayData(timestamp);
    if (data && data.riskScores) {
      // Sort by score (highest first) and take top 10
      const sorted = [...data.riskScores].sort((a, b) => b.score - a.score).slice(0, 10);
      setRiskScores(sorted);
    } else {
      setRiskScores([]);
    }
    setLoading(false);
  };

  const handleSliderChange = async (e) => {
    const i = parseInt(e.target.value);
    setIdx(i);
    await loadReplayData(DATES_2022[i].ts);
  };

  const getRiskColor = (score, tier) => {
    if (tier === 'red' || score >= 80) return '#ef4444';
    if (tier === 'amber' || score >= 60) return '#f59e0b';
    if (score >= 40) return '#eab308';
    return '#22c55e';
  };

  const getRiskLabel = (score, tier) => {
    if (tier === 'red' || score >= 80) return 'CRITICAL';
    if (tier === 'amber' || score >= 60) return 'HIGH';
    if (score >= 40) return 'ELEVATED';
    return 'SAFE';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', color: '#fff' }}>
      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '12px 24px', borderBottom: '1px solid #2a2a3e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '18px', margin: 0 }}>📜 2022 Pakistan Floods — Historical Risk Data</h1>
          <p style={{ fontSize: '11px', margin: '4px 0 0', opacity: 0.7 }}>District-wise flood risk progression during the 2022 disaster</p>
        </div>
        <Link href="/" style={{ background: '#3b82f6', padding: '6px 16px', borderRadius: '20px', color: '#fff', fontSize: '12px', textDecoration: 'none' }}>
          ← Back to Live Dashboard
        </Link>
      </div>

      {/* Replay Controls */}
      <div style={{ padding: '20px 24px', background: '#0f0f1a', borderBottom: '1px solid #2a2a3e' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>🕰️ Timeline: July — September 2022</span>
            <span style={{ color: DATES_2022[idx].desc.includes('PEAK') ? '#ef4444' : '#f59e0b', fontSize: '14px', fontWeight: 'bold' }}>
              {DATES_2022[idx].desc}
            </span>
          </div>
          
          <input
            type="range"
            min={0}
            max={DATES_2022.length - 1}
            value={idx}
            onChange={handleSliderChange}
            style={{ width: '100%', height: '6px', borderRadius: '3px', accentColor: '#ef4444' }}
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888' }}>
            {DATES_2022.map((d, i) => (
              <span key={i} style={{ color: i === idx ? '#f59e0b' : '#666' }}>{d.label}</span>
            ))}
          </div>
          
          {loading && <div style={{ fontSize: '11px', color: '#f59e0b', textAlign: 'center' }}>Loading historical data...</div>}
        </div>
      </div>

      {/* Risk Scores Table */}
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: '#1a1a2e', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', background: '#0f0f1a', borderBottom: '1px solid #2a2a3e' }}>
            <h2 style={{ fontSize: '16px', margin: 0 }}>📊 District Risk Scores — {DATES_2022[idx].label} {DATES_2022[idx].desc.includes('PEAK') && '🔥'}</h2>
            <p style={{ fontSize: '11px', margin: '8px 0 0', opacity: 0.7, color: '#888' }}>
              {idx === 4 ? 'At peak flooding, 10+ districts reached CRITICAL risk levels' : 'Risk scores based on satellite data, river levels, and ground reports'}
            </p>
          </div>
          
          {riskScores.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
              {loading ? 'Loading...' : 'No historical risk data available for this date'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a3e', background: '#0f0f1a' }}>
                  <th style={{ padding: '14px 20px', fontSize: '11px', color: '#888', textAlign: 'left' }}>Rank</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', color: '#888', textAlign: 'left' }}>District</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', color: '#888', textAlign: 'center' }}>Risk Score</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', color: '#888', textAlign: 'center' }}>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {riskScores.map((risk, index) => (
                  <tr key={risk._id} style={{ borderBottom: '1px solid #2a2a3e' }}>
                    <td style={{ padding: '12px 20px', fontSize: '13px', fontWeight: 'bold', color: '#888' }}>{index + 1}</td>
                    <td style={{ padding: '12px 20px', fontSize: '14px', fontWeight: 'bold' }}>{risk.district || risk.union_council}</td>
                    <td style={{ padding: '12px 20px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center', color: getRiskColor(risk.score, risk.tier) }}>
                      {risk.score}
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                      <span style={{ background: getRiskColor(risk.score, risk.tier), padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>
                        {getRiskLabel(risk.score, risk.tier)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
             </table>
          )}
        </div>
        
        <div style={{ marginTop: '20px', background: '#1a1a2e', borderRadius: '12px', padding: '16px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', margin: 0, color: '#888' }}>
            📊 Data source: Historical flood risk calculations based on satellite imagery, river levels, and NDMA advisories
          </p>
          <p style={{ fontSize: '11px', margin: '8px 0 0', color: '#666' }}>
            🔴 Red: Critical (≥80) | 🟡 Amber: High (60-79) | 🟢 Green: Safe (&lt;60)
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ background: '#1a1a2e', padding: '12px 24px', borderTop: '1px solid #2a2a3e', fontSize: '10px', color: '#666', textAlign: 'center' }}>
        📜 2022 Pakistan Floods | 1,736 lives lost | 33 million displaced | $30+ billion damage
      </div>
    </div>
  );
}