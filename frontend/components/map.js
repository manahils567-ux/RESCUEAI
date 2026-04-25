'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { mockRoads, mockFloodPolygons, mockGroundReports, mockReliefCamps } from '../lib/mockData';

// Dynamically import Leaflet components (SSR fix)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then(mod => mod.Polygon), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Road colors according to status
const STATUS_COLORS = {
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444'
};

export default function MapComponent({ district = 'Rajanpur', replayTimestamp = null }) {
  const [roads, setRoads] = useState([]);
  const [floods, setFloods] = useState([]);
  const [reports, setReports] = useState([]);
  const [camps, setCamps] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Dynamically import Leaflet icons only on client side
    import('leaflet').then(L => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    // Using mock data for now
    setRoads(mockRoads);
    setFloods(mockFloodPolygons);
    setReports(mockGroundReports);
    setCamps(mockReliefCamps);
  }, [district, replayTimestamp, isMounted]);

  const center = [29.5, 70.5];
  const zoom = 7;

  // Don't render map on server side
  if (!isMounted) {
    return <div style={{ height: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      Loading map...
    </div>;
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', minHeight: '500px' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Flood polygons */}
      {floods.map((flood, idx) => (
        <Polygon
          key={`flood-${idx}`}
          positions={flood.geometry.coordinates[0].map(([lng, lat]) => [lat, lng])}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.35,
            weight: 1.5
          }}
        >
          <Popup>
            <strong>Flood Extent</strong><br />
            District: {flood.district}
          </Popup>
        </Polygon>
      ))}

      {/* Roads - colored by status */}
      {roads.map((road) => (
        <Polyline
          key={road.osm_id}
          positions={road.geometry.coordinates.map(([lng, lat]) => [lat, lng])}
          pathOptions={{
            color: STATUS_COLORS[road.status] || '#888',
            weight: road.status === 'red' ? 4 : 3,
            opacity: 0.9
          }}
        >
          <Popup>
            <strong>{road.name}</strong><br />
            Status: {road.status === 'green' ? '✅ Open' : road.status === 'amber' ? '⚠️ At Risk' : '🔴 Closed'}<br />
            {road.hours_to_cutoff && `Hours remaining: ~${road.hours_to_cutoff}h`}
          </Popup>
        </Polyline>
      ))}

      {/* Relief camps */}
      {camps.map((camp, idx) => (
        <CircleMarker
          key={`camp-${idx}`}
          center={[camp.lat, camp.lng]}
          radius={8}
          pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.8 }}
        >
          <Popup>
            <strong>🏕️ {camp.name}</strong><br />
            District: {camp.district}
          </Popup>
        </CircleMarker>
      ))}

      {/* Citizen ground reports */}
      {reports.map((report, idx) => (
        <CircleMarker
          key={`report-${idx}`}
          center={[report.lat, report.lng]}
          radius={6}
          pathOptions={{ color: '#ea580c', fillColor: '#f97316', fillOpacity: 0.8 }}
        >
          <Popup>
            <strong>📢 Citizen Report</strong><br />
            Severity: {report.severity}<br />
            Reported: {new Date(report.reported_at).toLocaleString()}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}