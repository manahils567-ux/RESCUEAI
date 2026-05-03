'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchRiskScores, fetchRoads, fetchReports } from '../../lib/api';

export default function AgentPage() {
  const [language, setLanguage] = useState('ur');
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [districtRisks, setDistrictRisks] = useState([]);
  const [roadStatus, setRoadStatus] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        const [risksData, roadsData, reportsData] = await Promise.all([
          fetchRiskScores('Punjab'),
          fetchRoads('Rajanpur'),
          fetchReports('all')
        ]);
        
        if (risksData && risksData.length > 0) {
          const formattedRisks = risksData.map((item, idx) => ({
            id: idx + 1,
            district: item.district || item.union_council || 'Unknown',
            score: item.score || 0,
            tier: item.tier === 'red' ? 'critical' : item.tier === 'amber' ? 'high' : 'elevated'
          }));
          setDistrictRisks(formattedRisks.slice(0, 10));
        } else {
          setDistrictRisks([]);
        }
        
        if (roadsData && roadsData.length > 0) {
          const formattedRoads = roadsData.map((item, idx) => ({
            id: idx + 1,
            name: item.name || 'Unnamed Road',
            district: item.district || 'Unknown',
            status: item.status || 'green',
            hours: item.hours_to_cutoff
          }));
          setRoadStatus(formattedRoads.slice(0, 10));
        } else {
          setRoadStatus([]);
        }
        
        if (reportsData && reportsData.length > 0) {
          const formattedReports = reportsData
            .filter(r => !r.verified)
            .map((item, idx) => ({
              id: item._id || idx + 1,
              district: item.district || 'Unknown',
              location: item.lat && item.lng ? `${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}` : 'Location unknown',
              severity: item.severity || 'medium',
              status: 'pending',
              time: item.reported_at ? new Date(item.reported_at).toLocaleString() : 'Unknown',
              reporter: item.reporter_phone || 'Unknown',
              description: item.message_text || 'No description'
            }));
          setReports(formattedReports);
        } else {
          setReports([]);
        }
      } catch (error) {
        console.error('Agent page data fetch error:', error);
        setDistrictRisks([]);
        setRoadStatus([]);
        setReports([]);
      }
      
      setLoading(false);
    };
    
    setMounted(true);
    loadData();
  }, []);

  const toggleLanguage = () => {
    setLanguage(lang => lang === 'ur' ? 'en' : 'ur');
  };

  const handleVerifyReport = async (id) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const handleRejectReport = async (id) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const getTierColor = (tier) => {
    if (tier === 'critical') return 'var(--danger)';
    if (tier === 'high') return 'var(--warning)';
    if (tier === 'elevated') return '#eab308';
    return 'var(--safe)';
  };

  const getTierBgColor = (tier) => {
    if (tier === 'critical') return 'var(--danger-light)';
    if (tier === 'high') return 'var(--warning-light)';
    if (tier === 'elevated') return '#fef3c7';
    return 'var(--safe-light)';
  };

  const getStatusColor = (status) => {
    if (status === 'red') return 'var(--danger)';
    if (status === 'amber') return 'var(--warning)';
    return 'var(--safe)';
  };

  const getStatusBgColor = (status) => {
    if (status === 'red') return 'var(--danger-light)';
    if (status === 'amber') return 'var(--warning-light)';
    return 'var(--safe-light)';
  };

  if (!mounted || loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading RescueAI Agent Dashboard...</div>;
  }

  const pendingCount = reports.length;
  const criticalCount = districtRisks.filter(r => r.tier === 'critical').length;
  const redRoadsCount = roadStatus.filter(r => r.status === 'red').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div style={{ background: 'var(--bg-secondary)', padding: '12px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', margin: 0, color: 'var(--text-primary)' }}>🛡️ RescueAI | Agent Dashboard</h1>
          <p style={{ fontSize: '11px', margin: '4px 0 0', color: 'var(--text-secondary)' }}>
            {language === 'ur' ? 'ریسکیو ورکر اور رضاکار پینل' : 'Rescue Worker & Volunteer Panel'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/" style={{ background: 'var(--info)', padding: '6px 16px', borderRadius: '20px', color: '#fff', fontSize: '12px', textDecoration: 'none' }}>
            ← {language === 'ur' ? 'مین ڈیش بورڈ' : 'Main Dashboard'}
          </Link>
          <button onClick={toggleLanguage} style={{ background: language === 'ur' ? 'var(--info)' : 'var(--safe)', border: 'none', padding: '6px 16px', borderRadius: '20px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>
            {language === 'ur' ? '🇬🇧 English' : '🇵🇰 اردو'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', padding: '20px 24px' }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '16px', borderLeft: `4px solid var(--danger)`, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--danger)' }}>{criticalCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{language === 'ur' ? 'نازک اضلاع' : 'Critical Districts'}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '16px', borderLeft: `4px solid var(--warning)`, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--warning)' }}>{redRoadsCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{language === 'ur' ? 'بند سڑکیں' : 'Closed Roads'}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '16px', borderLeft: `4px solid var(--safe)`, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--safe)' }}>{pendingCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{language === 'ur' ? 'زیر التواء رپورٹس' : 'Pending Reports'}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '16px', borderLeft: `4px solid var(--info)`, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--info)' }}>5</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{language === 'ur' ? 'فعال رضاکار' : 'Active Volunteers'}</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '0 24px 24px 24px' }}>
        
        <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* District Risk Table */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
            <div style={{ padding: '14px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '14px', margin: 0, color: 'var(--text-primary)' }}>📊 {language === 'ur' ? 'اضلاع کے خطرے کی سطح' : 'District Risk Levels'}</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              {districtRisks.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>{language === 'ur' ? 'کوئی ڈیٹا نہیں' : 'No data available'}</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)' }}>#</th>
                      <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)' }}>{language === 'ur' ? 'ضلع' : 'District'}</th>
                      <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)' }}>{language === 'ur' ? 'سکور' : 'Score'}</th>
                      <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)' }}>{language === 'ur' ? 'خطرہ' : 'Risk'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {districtRisks.map((risk, idx) => (
                      <tr key={risk.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{risk.district}</td>
                        <td style={{ padding: '10px 16px', fontSize: '12px', color: getTierColor(risk.tier), fontWeight: 'bold' }}>{risk.score}</td>
                        <td style={{ padding: '10px 16px', fontSize: '12px' }}>
                          <span style={{ background: getTierBgColor(risk.tier), padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', color: getTierColor(risk.tier) }}>
                            {risk.tier === 'critical' ? (language === 'ur' ? 'نہایت خطرناک' : 'CRITICAL') : risk.tier === 'high' ? (language === 'ur' ? 'شدید' : 'HIGH') : (language === 'ur' ? 'خطرہ موجود' : 'ELEVATED')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Road Status Table */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
            <div style={{ padding: '14px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '14px', margin: 0, color: 'var(--text-primary)' }}>🛣️ {language === 'ur' ? 'سڑکوں کی حالت' : 'Road Status'}</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              {roadStatus.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>{language === 'ur' ? 'کوئی ڈیٹا نہیں' : 'No data available'}</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)' }}>{language === 'ur' ? 'سڑک کا نام' : 'Road Name'}</th>
                      <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)' }}>{language === 'ur' ? 'ضلع' : 'District'}</th>
                      <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)' }}>{language === 'ur' ? 'حالت' : 'Status'}</th>
                      <th style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)' }}>{language === 'ur' ? 'باقی گھنٹے' : 'Hours Left'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roadStatus.map((road) => (
                      <tr key={road.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{road.name}</td>
                        <td style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{road.district}</td>
                        <td style={{ padding: '10px 16px', fontSize: '12px' }}>
                          <span style={{ background: getStatusBgColor(road.status), padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', color: getStatusColor(road.status) }}>
                            {road.status === 'green' ? (language === 'ur' ? '🟢 کھلی' : '🟢 OPEN') : road.status === 'amber' ? (language === 'ur' ? '🟡 خطرہ' : '🟡 AT RISK') : (language === 'ur' ? '🔴 بند' : '🔴 CLOSED')}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{road.hours ? `${road.hours}h` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Pending Reports */}
        <div style={{ width: '380px', background: 'var(--bg-card)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
          <div style={{ padding: '14px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '14px', margin: 0, color: 'var(--text-primary)' }}>📋 {language === 'ur' ? 'زیر التواء رپورٹس' : 'Pending Reports'}</h3>
            <span style={{ background: 'var(--danger)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', color: '#fff' }}>{pendingCount}</span>
          </div>
          <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '16px' }}>
            {pendingCount === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>✅ {language === 'ur' ? 'کوئی رپورٹ زیر التواء نہیں' : 'No pending reports'}</div>
            ) : (
              reports.map(report => (
                <div key={report.id} style={{ background: 'var(--bg-sidebar)', borderRadius: '10px', padding: '14px', marginBottom: '12px', border: `2px solid ${report.severity === 'critical' ? 'var(--danger)' : 'var(--warning)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{report.district}</strong>
                    <span style={{ background: report.severity === 'critical' ? 'var(--danger)' : report.severity === 'high' ? 'var(--warning)' : '#eab308', padding: '2px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', color: '#fff' }}>
                      {report.severity === 'critical' ? (language === 'ur' ? 'نہایت خطرناک' : 'CRITICAL') : report.severity === 'high' ? (language === 'ur' ? 'شدید' : 'HIGH') : (language === 'ur' ? 'درمیانی' : 'MEDIUM')}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '4px', color: 'var(--text-secondary)' }}>📍 {report.location}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>{report.description}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px' }}>📞 {report.reporter} | 🕐 {report.time}</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleVerifyReport(report.id)} style={{ background: 'var(--safe)', border: 'none', padding: '6px 12px', borderRadius: '6px', color: '#fff', fontSize: '11px', cursor: 'pointer', flex: 1 }}>✓ {language === 'ur' ? 'تصدیق کریں' : 'Verify'}</button>
                    <button onClick={() => handleRejectReport(report.id)} style={{ background: 'var(--danger)', border: 'none', padding: '6px 12px', borderRadius: '6px', color: '#fff', fontSize: '11px', cursor: 'pointer', flex: 1 }}>✗ {language === 'ur' ? 'مسترد کریں' : 'Reject'}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}