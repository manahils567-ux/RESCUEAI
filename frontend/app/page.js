'use client';

import MapComponent from '../components/map';
import 'leaflet/dist/leaflet.css';
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

export default function Home() {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <h1 style={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        zIndex: 1000, 
        backgroundColor: 'rgba(0,0,0,0.7)', 
        color: 'white', 
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        pointerEvents: 'none'
      }}>
        🗺️ RESCUEAI - Flood Intelligence System
      </h1>
      <MapComponent />
    </div>
  );
}