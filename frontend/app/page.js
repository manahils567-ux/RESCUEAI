'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

import Link from 'next/link';
import TopRiskList from '../components/TopRiskList';
import RiskChart from '../components/RiskChart';
import AIChatbot from '../components/AIChatbot';
import LayerControls from '../components/LayerControls';
import NotificationBar from '../components/NotificationBar';
import MapLegend from '../components/MapLegend';

const MapComponent = dynamic(() => import('../components/Map'), { 
  ssr: false,
  loading: () => (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
      Loading map...
    </div>
  )
});

export default function Home() {
  const [activeLayers, setActiveLayers] = useState({
    roads: true,
    floods: true,
    citizenReports: true,
    rescue: false,
    gauges: false
  });
  
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [language, setLanguage] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mounted]);

  const toggleLanguage = () => {
    setLanguage(lang => lang === 'ur' ? 'en' : 'ur');
  };

  if (!mounted) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        Loading RescueAI...
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '8px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h1 style={{ fontSize: '18px', margin: 0, color: 'var(--text-primary)' }}>RescueAI</h1>
          <p style={{ fontSize: '10px', margin: '2px 0 0', color: 'var(--text-secondary)' }}>
            {language === 'ur' ? 'فلڈ انٹیلی جنس سسٹم' : 'Flood Intelligence System'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* 2022 Replay Link */}
          <Link href="/replay-2022" style={{ background: 'var(--purple)', padding: '5px 14px', borderRadius: '20px', color: '#fff', fontSize: '12px', textDecoration: 'none' }}>
            📜 2022 Replay
          </Link>
          
          {/* Agent Mode Button */}
          <Link href="/agent" style={{ 
            background: 'var(--purple)', 
            border: 'none', 
            padding: '5px 14px', 
            borderRadius: '20px', 
            color: '#fff', 
            fontSize: '12px', 
            fontWeight: 'bold',
            textDecoration: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            👤 {language === 'ur' ? 'ایجنٹ موڈ' : 'Agent Mode'}
          </Link>
          
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            style={{
              background: language === 'ur' ? 'var(--info)' : 'var(--safe)',
              border: 'none',
              padding: '5px 14px',
              borderRadius: '20px',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {language === 'ur' ? '🇬🇧 English' : '🇵🇰 اردو'}
          </button>
          
          {/* Mobile Menu Buttons */}
          {isMobile && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)} style={{ background: 'var(--info)', border: 'none', padding: '5px 10px', borderRadius: '6px', color: 'white', fontSize: '10px', cursor: 'pointer' }}>📋 Menu</button>
              <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} style={{ background: 'var(--info)', border: 'none', padding: '5px 10px', borderRadius: '6px', color: 'white', fontSize: '10px', cursor: 'pointer' }}>🤖 AI</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        
        {/* LEFT PANEL */}
        <div style={{ 
          width: 260, 
          background: 'var(--bg-sidebar)', 
          overflowY: 'auto', 
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderRight: '1px solid var(--border)',
          ...(isMobile ? {
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            zIndex: 1050,
            transform: isLeftPanelOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease',
            width: '280px'
          } : {})
        }}>
          {isMobile && (
            <button onClick={() => setIsLeftPanelOpen(false)} style={{ alignSelf: 'flex-end', background: 'var(--danger)', border: 'none', padding: '4px 12px', borderRadius: '4px', color: '#fff', fontSize: '11px', cursor: 'pointer' }}>✕ Close</button>
          )}
          <TopRiskList language={language} />
          <LayerControls activeLayers={activeLayers} setActiveLayers={setActiveLayers} language={language} />
        </div>

        {/* MAP */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <MapComponent activeLayers={activeLayers} language={language} />
          <MapLegend language={language} />
        </div>

        {/* RIGHT PANEL */}
        <div style={{ 
          width: 300, 
          background: 'var(--bg-sidebar)', 
          overflowY: 'auto', 
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderLeft: '1px solid var(--border)',
          ...(isMobile ? {
            position: 'fixed',
            top: 0,
            bottom: 0,
            right: 0,
            zIndex: 1050,
            transform: isRightPanelOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease',
            width: '300px'
          } : {})
        }}>
          {isMobile && (
            <button onClick={() => setIsRightPanelOpen(false)} style={{ alignSelf: 'flex-end', background: 'var(--danger)', border: 'none', padding: '4px 12px', borderRadius: '4px', color: '#fff', fontSize: '11px', cursor: 'pointer' }}>✕ Close</button>
          )}
          <RiskChart language={language} />
          <div style={{ flex: 1, minHeight: '280px', display: 'flex', flexDirection: 'column' }}>
            <AIChatbot language={language} />
          </div>
        </div>
      </div>

      <NotificationBar language={language} />
    </div>
  );
}