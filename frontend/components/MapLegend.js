'use client';

import { useState } from 'react';

export default function MapLegend({ language = 'ur' }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const legendItems = [
    { color: '#ef4444', labelEn: 'Critical', labelUr: 'نہایت خطرناک' },
    { color: '#f97316', labelEn: 'High Risk', labelUr: 'شدید خطرہ' },
    { color: '#eab308', labelEn: 'Elevated', labelUr: 'خطرہ موجود' },
    { color: '#22c55e', labelEn: 'Safe', labelUr: 'محفوظ' },
    { color: '#3b82f6', labelEn: 'Flood', labelUr: 'سیلاب' }
  ];

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      background: '#0f0f1a',
      padding: isCollapsed ? '8px 12px' : '10px 14px',
      borderRadius: '8px',
      border: '1px solid #2a2a3e',
      cursor: 'pointer'
    }}>
      <div onClick={() => setIsCollapsed(!isCollapsed)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🗺️</span>
        <span style={{ fontSize: '11px', color: '#888' }}>{language === 'ur' ? 'کلید' : 'Legend'}</span>
        <span>{isCollapsed ? '▶' : '▼'}</span>
      </div>
      
      {!isCollapsed && (
        <div style={{ marginTop: '10px' }}>
          {legendItems.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '16px', height: '3px', background: item.color }}></div>
              <span style={{ fontSize: '10px', color: '#ccc' }}>
                {language === 'ur' ? item.labelUr : item.labelEn}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}