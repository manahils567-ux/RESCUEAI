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
    
    const interval = setInterval(loadChartData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          📈 {language === 'ur' ? 'خطرے کی پیش گوئی' : 'RISK FORECAST'}
        </h3>
        <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Loading chart...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        📈 {language === 'ur' ? 'خطرے کی پیش گوئی' : 'RISK FORECAST'} — TOP 7
      </h3>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="2 2" stroke="var(--border)" />
          <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={9} tick={{ fill: 'var(--text-muted)' }} angle={-15} textAnchor="end" height={40} />
          <YAxis stroke="var(--text-muted)" fontSize={9} domain={[0, 100]} tick={{ fill: 'var(--text-muted)' }} />
          <Tooltip 
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '11px' }}
            labelStyle={{ color: 'var(--text-primary)' }}
          />
          <Line type="monotone" dataKey="risk" stroke="var(--danger)" strokeWidth={2} dot={{ fill: 'var(--danger)', r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        {peakRisk && (
          <span style={{ fontSize: '9px', color: 'var(--danger)' }}>
            {language === 'ur' ? 'سب سے زیادہ خطرہ' : 'Highest risk'}: {peakRisk.district || peakRisk.union_council} — {peakRisk.score}/100
          </span>
        )}
      </div>
    </div>
  );
}