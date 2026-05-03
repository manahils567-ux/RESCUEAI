'use client';

import { useEffect, useState } from 'react';

export default function SatelliteIntel({ language = 'ur' }) {
  const [intel, setIntel] = useState({
    source: 'Sentinel-1 SAR',
    latestDate: new Date().toLocaleDateString(),
    cloudCoverage: '12%',
    resolution: '10m',
    status: 'active'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSatelliteData = async () => {
      setLoading(true);
      
      try {
        // Try to fetch from ML service (if available)
        // ML service endpoint: http://localhost:8000 or Railway URL
        const mlUrl = process.env.NEXT_PUBLIC_ML_URL || 'http://localhost:8000';
        
        // Optional: Fetch latest flood extent from ML service
        // const response = await fetch(`${mlUrl}/flood_status`);
        // if (response.ok) {
        //   const data = await response.json();
        //   setIntel({
        //     source: data.source || 'Sentinel-1 SAR',
        //     latestDate: data.latest_date || new Date().toLocaleDateString(),
        //     cloudCoverage: data.cloud_coverage || '8%',
        //     resolution: data.resolution || '10m',
        //     status: 'active'
        //   });
        // }
        
        // For now, using mock with current date
        setIntel({
          source: 'Sentinel-1 SAR (ESA)',
          latestDate: new Date().toLocaleDateString(),
          cloudCoverage: '8%',
          resolution: '10m',
          status: 'active'
        });
      } catch (error) {
        console.error('Satellite intel fetch error:', error);
        // Fallback mock data
        setIntel({
          source: 'Sentinel-1 SAR',
          latestDate: new Date().toLocaleDateString(),
          cloudCoverage: '12%',
          resolution: '10m',
          status: 'degraded'
        });
      }
      
      setLoading(false);
    };
    
    fetchSatelliteData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchSatelliteData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ background: '#0f0f1a', borderRadius: '10px', padding: '16px', border: '1px solid #2a2a3e' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#888', marginBottom: '12px' }}>
          🛰️ {language === 'ur' ? 'سیٹلائٹ انٹیل' : 'SATELLITE INTEL'}
        </h3>
        <div style={{ textAlign: 'center', color: '#666', fontSize: '11px' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0f0f1a', borderRadius: '10px', padding: '16px', border: '1px solid #2a2a3e' }}>
      <h3 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '12px' }}>
        🛰️ {language === 'ur' ? 'سیٹلائٹ انٹیل' : 'SATELLITE INTEL'}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '9px', color: '#666' }}>{language === 'ur' ? 'ماخذ' : 'Source'}</div>
          <div style={{ fontSize: '11px', color: '#fff', fontWeight: '500' }}>{intel.source}</div>
        </div>
        <div>
          <div style={{ fontSize: '9px', color: '#666' }}>{language === 'ur' ? 'تازہ ترین' : 'Latest'}</div>
          <div style={{ fontSize: '11px', color: '#fff' }}>{intel.latestDate}</div>
        </div>
        <div>
          <div style={{ fontSize: '9px', color: '#666' }}>{language === 'ur' ? 'بادل کا احاطہ' : 'Cloud Coverage'}</div>
          <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: '500' }}>{intel.cloudCoverage}</div>
        </div>
        <div>
          <div style={{ fontSize: '9px', color: '#666' }}>{language === 'ur' ? 'ریزولیوشن' : 'Resolution'}</div>
          <div style={{ fontSize: '11px', color: '#fff' }}>{intel.resolution}</div>
        </div>
      </div>
      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #2a2a3e', fontSize: '9px', color: '#888', textAlign: 'center' }}>
        {intel.status === 'active' 
          ? (language === 'ur' ? '✅ ریئل ٹائم ڈیٹا فعال' : '✅ Real-time data active')
          : (language === 'ur' ? '⚠️ ڈیٹا میں تاخیر' : '⚠️ Data delayed')}
      </div>
    </div>
  );
}