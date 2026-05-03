'use client';

import { useEffect, useState } from 'react';
import { fetchRiskScores } from '../lib/api';

const getScoreColor = (score, tier) => {
  if (tier === 'critical' || tier === 'red' || score >= 80) return '#ef4444';
  if (tier === 'high' || tier === 'amber' || score >= 60) return '#f97316';
  if (tier === 'elevated' || score >= 40) return '#eab308';
  return '#22c55e';
};

const getTierLabel = (tier, score, language) => {
  if (tier === 'red' || score >= 80) return language === 'ur' ? 'نہایت خطرناک' : 'CRITICAL';
  if (tier === 'amber' || score >= 60) return language === 'ur' ? 'شدید خطرہ' : 'HIGH';
  if (score >= 40) return language === 'ur' ? 'خطرہ موجود' : 'ELEVATED';
  return language === 'ur' ? 'محفوظ' : 'SAFE';
};

export default function TopRiskList({ language = 'ur' }) {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRisks = async () => {
      setLoading(true);
      const data = await fetchRiskScores('Punjab');
      
      if (data && data.length > 0) {
        // Transform backend data to match frontend format
        const formattedRisks = data
          .map((item, index) => ({
            id: index + 1,
            district: item.district || item.union_council,
            score: item.score,
            tier: item.tier || (item.score >= 80 ? 'red' : item.score >= 60 ? 'amber' : 'green')
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 7); // Top 7 only
        setRisks(formattedRisks);
      } else {
        // Fallback - no data
        setRisks([]);
      }
      setLoading(false);
    };
    
    loadRisks();
  }, []);

  if (loading) {
    return (
      <div style={{ background: '#0f0f1a', borderRadius: '10px', padding: '12px', border: '1px solid #2a2a3e' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '12px' }}>
          {language === 'ur' ? '🚨 خطرناک اضلاع' : '🚨 RISK DISTRICTS'}
        </h3>
        <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          {language === 'ur' ? 'لوڈ ہو رہا ہے...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (risks.length === 0) {
    return (
      <div style={{ background: '#0f0f1a', borderRadius: '10px', padding: '12px', border: '1px solid #2a2a3e' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '12px' }}>
          {language === 'ur' ? '🚨 خطرناک اضلاع' : '🚨 RISK DISTRICTS'}
        </h3>
        <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          {language === 'ur' ? 'کوئی ڈیٹا نہیں' : 'No data available'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#0f0f1a', 
      borderRadius: '10px', 
      padding: '12px',
      border: '1px solid #2a2a3e'
    }}>
      <h3 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '12px' }}>
        {language === 'ur' ? '🚨 خطرناک اضلاع' : '🚨 RISK DISTRICTS'}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {risks.map((risk) => (
          <div key={risk.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: '#fff', fontSize: '12px' }}>{risk.district}</span>
              <span style={{ 
                color: getScoreColor(risk.score, risk.tier), 
                fontWeight: 'bold', 
                fontSize: '12px' 
              }}>{risk.score}</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '3px', 
              background: '#2a2a3e', 
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${risk.score}%`, 
                height: '100%', 
                background: getScoreColor(risk.score, risk.tier),
                borderRadius: '2px'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}