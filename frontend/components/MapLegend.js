'use client';

import { useState } from 'react';

export default function MapLegend({ language = 'ur' }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const legendItems = [
    { color: '#ff6b6b', labelEn: 'Critical / Cut-off', labelUr: 'سنگین / منقطع' },
    { color: '#ffb347', labelEn: 'High Risk', labelUr: 'زیادہ خطرہ' },
    { color: '#6fcf97', labelEn: 'Safe / Open', labelUr: 'محفوظ / کھلا' },
    { color: '#5b9bd5', labelEn: 'Flood Area', labelUr: 'سیلاب زدہ علاقہ' }
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      background: 'var(--bg-card)',
      padding: isCollapsed ? '8px 12px' : '10px 14px',
      borderRadius: '8px',
      border: '1px solid var(--border)',
      cursor: 'pointer'
    }}>
      <div onClick={() => setIsCollapsed(!isCollapsed)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🗺️</span>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{language === 'ur' ? 'کلید' : 'Legend'}</span>
        <span>{isCollapsed ? '▶' : '▼'}</span>
      </div>
      
      {!isCollapsed && (
        <div style={{ marginTop: '10px' }}>
          {legendItems.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '16px', height: '3px', background: item.color }}></div>
              <span style={{ fontSize: '10px', color: 'var(--text-primary)' }}>
                {language === 'ur' ? item.labelUr : item.labelEn}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}