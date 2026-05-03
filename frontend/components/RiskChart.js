'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchRiskScores } from '../lib/api';

export default function RiskChart({ language = 'ur' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [peakRisk, setPeakRisk] = useState(null);

  useEffect(() => {
    const loadChartData = async () => {
      setLoading(true);
      
      const risksData = await fetchRiskScores('Punjab');
      
      if (risksData && risksData.length > 0) {
        // Sort by score and get top 7 districts for chart
        const sorted = [...risksData].sort((a, b) => b.score - a.score).slice(0, 7);
        
        const chartData = sorted.map((item, idx) => ({
          hour: item.district || item.union_council || `District ${idx + 1}`,
          risk: item.score,
          tier: item.tier
        }));
        
        setData(chartData);
        
        const peak = sorted.reduce((max, item) => item.score > max.score ? item : max, sorted[0]);
        setPeakRisk(peak);
      } else {
        // Fallback mock data
        setData([
          { hour: 'Nowshera', risk: 92 },
          { hour: 'Charsadda', risk: 88 },
          { hour: 'Swat', risk: 78 },
          { hour: 'DI Khan', risk: 73 },
          { hour: 'Rajanpur', risk: 71 },
          { hour: 'Sukkur', risk: 65 },
          { hour: 'Jacobabad', risk: 58 }
        ]);
        setPeakRisk({ district: 'Nowshera', score: 92 });
      }
      
      setLoading(false);
    };
    
    loadChartData();
    
    // Refresh every 60 seconds
    const interval = setInterval(loadChartData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ background: '#0f0f1a', borderRadius: '10px', padding: '16px', border: '1px solid #2a2a3e' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#888', marginBottom: '12px' }}>
          📈 {language === 'ur' ? 'خطرے کی پیش گوئی' : 'RISK FORECAST'}
        </h3>
        <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#666', fontSize: '11px' }}>Loading chart...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0f0f1a', borderRadius: '10px', padding: '16px', border: '1px solid #2a2a3e' }}>
      <h3 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '12px' }}>
        📈 {language === 'ur' ? 'خطرے کی پیش گوئی' : 'RISK FORECAST'} — TOP 7
      </h3>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="2 2" stroke="#2a2a3e" />
          <XAxis dataKey="hour" stroke="#666" fontSize={9} tick={{ fill: '#666' }} angle={-15} textAnchor="end" height={40} />
          <YAxis stroke="#666" fontSize={9} domain={[0, 100]} tick={{ fill: '#666' }} />
          <Tooltip 
            contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: '8px', fontSize: '11px' }}
            labelStyle={{ color: '#fff' }}
          />
          <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        {peakRisk && (
          <span style={{ fontSize: '9px', color: '#ef4444' }}>
            {language === 'ur' ? 'سب سے زیادہ خطرہ' : 'Highest risk'}: {peakRisk.district || peakRisk.union_council} — {peakRisk.score}/100
          </span>
        )}
      </div>
    </div>
  );
}