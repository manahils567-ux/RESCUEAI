'use client';

export default function LayerControls({ activeLayers, setActiveLayers, language = 'ur' }) {
  
  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const layers = [
    { id: 'roads', labelEn: 'Main Roads', labelUr: 'مرکزی سڑکیں', color: 'var(--safe)' },
    { id: 'floods', labelEn: 'Flood Area', labelUr: 'سیلاب کا علاقہ', color: 'var(--info)' },
    { id: 'citizenReports', labelEn: 'Citizen Reports', labelUr: 'شہری اطلاع', color: 'var(--warning)' },
    { id: 'rescue', labelEn: 'Rescue Stations', labelUr: 'ریسکیو اسٹیشن', color: '#06b6d4' },
    { id: 'gauges', labelEn: 'River Level Gauges', labelUr: 'دریا گیج', color: 'var(--warning)' }
  ];

  return (
    <div style={{ 
      background: 'var(--bg-card)', 
      borderRadius: '10px', 
      padding: '12px',
      border: '1px solid var(--border)'
    }}>
      <h3 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        {language === 'ur' ? '🎮 پرت کنٹرول' : '🎮 LAYER CONTROLS'}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {layers.map(layer => (
          <label key={layer.id} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            cursor: 'pointer',
            padding: '6px 8px',
            borderRadius: '6px',
            background: activeLayers[layer.id] ? 'var(--info-light)' : 'transparent',
            transition: 'all 0.2s ease'
          }}>
            <input
              type="checkbox"
              checked={activeLayers[layer.id] || false}
              onChange={() => toggleLayer(layer.id)}
              style={{ 
                width: '18px', 
                height: '18px', 
                cursor: 'pointer',
                accentColor: layer.color
              }}
            />
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: layer.color }}></div>
            <span style={{ color: activeLayers[layer.id] ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '12px', flex: 1 }}>
              {language === 'ur' ? layer.labelUr : layer.labelEn}
            </span>
            <span style={{ 
              fontSize: '10px', 
              color: activeLayers[layer.id] ? 'var(--safe)' : 'var(--text-muted)',
              fontWeight: 'bold'
            }}>
              {activeLayers[layer.id] ? (language === 'ur' ? 'آن' : 'ON') : (language === 'ur' ? 'آف' : 'OFF')}
            </span>
          </label>
        ))}
      </div>
      
      <div style={{ 
        marginTop: '12px', 
        paddingTop: '10px', 
        borderTop: '1px solid var(--border)',
        fontSize: '10px',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        {language === 'ur' ? '💡 منظر کو حسب ضرورت بنانے کے لیے ٹوگل کریں۔' : '💡 Toggle layers to customize view'}
      </div>
    </div>
  );
}