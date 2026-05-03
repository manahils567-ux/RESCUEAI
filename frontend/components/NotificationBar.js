'use client';

import { useEffect, useState } from 'react';
import { fetchRiskScores, fetchReports } from '../lib/api';

export default function NotificationBar({ language = 'ur' }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      
      const [risksData, reportsData] = await Promise.all([
        fetchRiskScores('Punjab'),
        fetchReports('all')
      ]);
      
      const newAlerts = [];
      
      if (risksData && risksData.length > 0) {
        const criticalRisks = risksData.filter(r => r.score >= 80 || r.tier === 'red' || r.tier === 'critical');
        criticalRisks.slice(0, 2).forEach(risk => {
          newAlerts.push({
            id: `risk-${risk.union_council || risk.district}`,
            district: risk.district || risk.union_council,
            message: language === 'ur' 
              ? `${risk.district || risk.union_council} میں شدید خطرہ ہے۔ فوری احتیاط کریں۔`
              : `Critical flood risk in ${risk.district || risk.union_council}. Take immediate precautions.`,
            severity: 'critical'
          });
        });
      }
      
      if (reportsData && reportsData.length > 0) {
        const unverified = reportsData.filter(r => !r.verified).slice(0, 2);
        unverified.forEach(report => {
          newAlerts.push({
            id: `report-${report._id}`,
            district: report.district || 'Unknown',
            message: language === 'ur'
              ? `${report.district || 'Unknown'} سے نئی شہری اطلاع موصول ہوئی۔ تصدیق درکار ہے۔`
              : `New citizen report from ${report.district || 'Unknown'}. Verification needed.`,
            severity: 'warning'
          });
        });
      }
      
      if (newAlerts.length === 0) {
        newAlerts.push({
          id: 'default',
          district: 'System',
          message: language === 'ur'
            ? 'نظام نگرانی کر رہا ہے۔ کوئی فوری خطرہ نہیں۔'
            : 'System monitoring. No immediate threats.',
          severity: 'info'
        });
      }
      
      setAlerts(newAlerts.slice(0, 3));
      setLoading(false);
    };
    
    loadAlerts();
    
    const interval = setInterval(loadAlerts, 60000);
    return () => clearInterval(interval);
  }, [language]);

  if (loading && alerts.length === 0) {
    return (
      <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '10px 20px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
          {language === 'ur' ? 'الرٹس لوڈ ہو رہے ہیں...' : 'Loading alerts...'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'var(--bg-secondary)', 
      borderTop: alerts.some(a => a.severity === 'critical') ? '2px solid var(--danger)' : '1px solid var(--border)',
      padding: '10px 20px'
    }}>
      {alerts.map(alert => (
        <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ 
            background: alert.severity === 'critical' ? 'var(--danger)' : alert.severity === 'warning' ? 'var(--warning)' : 'var(--info)',
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontSize: '9px', 
            fontWeight: 'bold',
            letterSpacing: '1px',
            color: '#fff'
          }}>
            {alert.severity === 'critical' ? (language === 'ur' ? '⚠️ الرٹ' : '⚠️ ALERT') :
             alert.severity === 'warning' ? (language === 'ur' ? '📢 اطلاع' : '📢 NOTICE') : (language === 'ur' ? 'ℹ️ معلومات' : 'ℹ️ INFO')}
          </span>
          <span style={{ color: 'var(--text-primary)', fontSize: '11px', lineHeight: '1.4' }}>
            <strong>{alert.district}:</strong> {alert.message}
          </span>
        </div>
      ))}
    </div>
  );
}