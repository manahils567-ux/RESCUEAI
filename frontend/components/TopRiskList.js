'use client';

import { useEffect, useState } from 'react';
import { fetchRiskScores } from '../lib/api';

const getScoreColor = (score, tier) => {
  if (tier === 'critical' || tier === 'red' || score >= 80) return 'var(--danger)';
  if (tier === 'high' || tier === 'amber' || score >= 60) return 'var(--warning)';
  if (tier === 'elevated' || score >= 40) return '#eab308';
  return 'var(--safe)';
};

const getBgColor = (score, tier) => {
  if (tier === 'critical' || tier === 'red' || score >= 80) return 'var(--danger-light)';
  if (tier === 'high' || tier === 'amber' || score >= 60) return 'var(--warning-light)';
  if (tier === 'elevated' || score >= 40) return '#fef3c7';
  return 'var(--safe-light)';
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
        const formattedRisks = data
          .map((item, index) => ({
            id: index + 1,
            district: item.district || item.union_council,
            score: item.score,
            tier: item.tier || (item.score >= 80 ? 'red' : item.score >= 60 ? 'amber' : 'green')
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 7);
        setRisks(formattedRisks);
      } else {
        setRisks([]);
      }
      setLoading(false);
    };
    
    loadRisks();
  }, []);

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '12px', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          {language === 'ur' ? '🚨 خطرناک اضلاع' : '🚨 RISK DISTRICTS'}
        </h3>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
          {language === 'ur' ? 'لوڈ ہو رہا ہے...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (risks.length === 0) {
    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '12px', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          {language === 'ur' ? '🚨 خطرناک اضلاع' : '🚨 RISK DISTRICTS'}
        </h3>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
          {language === 'ur' ? 'کوئی ڈیٹا نہیں' : 'No data available'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'var(--bg-card)', 
      borderRadius: '10px', 
      padding: '12px',
      border: '1px solid var(--border)'
    }}>
      <h3 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        {language === 'ur' ? '🚨 خطرناک اضلاع' : '🚨 RISK DISTRICTS'}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {risks.map((risk) => (
          <div key={risk.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-primary)', fontSize: '12px' }}>{risk.district}</span>
              <span style={{ 
                color: getScoreColor(risk.score, risk.tier), 
                fontWeight: 'bold', 
                fontSize: '12px' 
              }}>{risk.score}</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '4px', 
              background: getBgColor(risk.score, risk.tier), 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${risk.score}%`, 
                height: '100%', 
                background: getScoreColor(risk.score, risk.tier),
                borderRadius: '4px'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}