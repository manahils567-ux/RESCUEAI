'use client';

export default function LayerControls({ activeLayers, setActiveLayers, language = 'ur' }) {
  
  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const layers = [
    { id: 'roads', labelEn: 'Main Roads', labelUr: 'مرکزی سڑکیں', color: '#22c55e' },
    { id: 'floods', labelEn: 'Flood Area', labelUr: 'سیلاب کا علاقہ', color: '#3b82f6' },
    { id: 'citizenReports', labelEn: 'Citizen Reports', labelUr: 'شہری اطلاع', color: '#f97316' },
    { id: 'rescue', labelEn: 'Rescue Stations', labelUr: 'ریسکیو اسٹیشن', color: '#06b6d4' },
    { id: 'gauges', labelEn: 'River Level Gauges', labelUr: 'دریا گیج', color: '#f59e0b' }
  ];

  return (
    <div style={{ 
      background: '#0f0f1a', 
      borderRadius: '10px', 
      padding: '12px',
      border: '1px solid #2a2a3e'
    }}>
      <h3 style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '12px' }}>
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
            background: activeLayers[layer.id] ? 'rgba(59,130,246,0.1)' : 'transparent',
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
            <span style={{ color: activeLayers[layer.id] ? '#fff' : '#888', fontSize: '12px', flex: 1 }}>
              {language === 'ur' ? layer.labelUr : layer.labelEn}
            </span>
            <span style={{ 
              fontSize: '10px', 
              color: activeLayers[layer.id] ? '#22c55e' : '#666',
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
        borderTop: '1px solid #2a2a3e',
        fontSize: '10px',
        color: '#666',
        textAlign: 'center'
      }}>
        {language === 'ur' ? '💡 منظر کو حسب ضرورت بنانے کے لیے ٹوگل کریں۔' : '💡 Toggle layers to customize view'}
      </div>
    </div>
  );
}