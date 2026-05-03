'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { mockRoads, mockFloodPolygons, mockGroundReports, mockReliefCamps } from '../lib/mockData';
import { fetchRoads, fetchReports, fetchReliefCamps, fetchRiverGauges, fetchFloodEvents } from '../lib/api';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then(mod => mod.Polygon), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

const STATUS_COLORS = {
  green: '#22c55e',
  amber: '#f59e0b',
  red: '#ef4444'
};

const SEVERITY_COLORS = {
  high: { bg: '#ef4444', fill: '#ef4444', labelEn: 'High', labelUr: 'شدید' },
  medium: { bg: '#f97316', fill: '#f97316', labelEn: 'Medium', labelUr: 'درمیانی' },
  low: { bg: '#eab308', fill: '#eab308', labelEn: 'Low', labelUr: 'معمولی' }
};

export default function MapComponent({ activeLayers = {}, language = 'ur', district = '', replayData = null }) {
  const [roads, setRoads] = useState([]);
  const [floods, setFloods] = useState([]);
  const [reports, setReports] = useState([]);
  const [camps, setCamps] = useState([]);
  const [gauges, setGauges] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [mapKey, setMapKey] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (replayData && replayData.floods) {
      setFloods(replayData.floods);
    }
  }, [replayData]);

  useEffect(() => {
    setIsMounted(true);
    setMapKey(prev => prev + 1);
    
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
    
const loadData = async () => {
  setLoading(true);
  
  try {
    const [roadsData, reportsData, campsData, gaugesData, floodsData] = await Promise.all([
      fetchRoads().catch(() => null),
      fetchReports().catch(() => null),
      fetchReliefCamps().catch(() => null),
      fetchRiverGauges().catch(() => null),
      fetchFloodEvents().catch(() => null)
    ]);
    
    // Roads
    if (roadsData && Array.isArray(roadsData) && roadsData.length > 0) {
      console.log('✅ Using real roads data:', roadsData.length);
      setRoads(roadsData);
    } else {
      console.log('⚠️ No real roads data, using mock');
      setRoads(mockRoads);
    }
    
    // Reports
    if (reportsData && Array.isArray(reportsData) && reportsData.length > 0) {
      console.log('✅ Using real reports data:', reportsData.length);
      setReports(reportsData);
    } else {
      console.log('⚠️ No real reports data, using mock');
      setReports(mockGroundReports);
    }
    
    // Camps
    if (campsData && Array.isArray(campsData) && campsData.length > 0) {
      console.log('✅ Using real camps data:', campsData.length);
      setCamps(campsData);
    } else {
      console.log('⚠️ No real camps data, using mock');
      setCamps(mockReliefCamps);
    }
    
    // Gauges
    if (gaugesData && Array.isArray(gaugesData) && gaugesData.length > 0) {
      console.log('✅ Using real gauges data:', gaugesData.length);
      setGauges(gaugesData);
    } else {
      console.log('⚠️ No real gauges data');
      setGauges([]);
    }

    // Floods - REAL DATA from database
    if (floodsData && Array.isArray(floodsData) && floodsData.length > 0) {
      console.log('✅ Real flood data loaded:', floodsData.length);
      setFloods(floodsData);
    } else {
      console.log('⚠️ Using mock flood polygons');
      setFloods(mockFloodPolygons);
    }
    
  } catch (error) {
    console.error('Map data fetch error:', error);
    // Fallback to mock data on error
    setRoads(mockRoads);
    setReports(mockGroundReports);
    setCamps(mockReliefCamps);
    setGauges([]);
    setFloods(mockFloodPolygons);
  }
  
  setLoading(false);
};
    
    loadData();
  }, [isMounted, district]);

  if (!isMounted || loading) {
    return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', color: '#fff' }}>Loading RescueAI map...</div>;
  }

  return (
    <MapContainer 
      key={mapKey}
      center={[29.5, 70.5]} 
      zoom={7} 
      style={{ height: '100%', width: '100%' }} 
      scrollWheelZoom={true}
    >
      <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        attribution='OpenStreetMap' 
      />

      {/* Flood Area */}
      {activeLayers.floods && floods.length > 0 && floods.map((flood, idx) => (
        <Polygon key={`flood-${idx}`} positions={flood.geometry?.coordinates?.[0]?.map(([lng, lat]) => [lat, lng]) || []} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.35, weight: 1.5 }}>
          <Popup>
            <strong>{language === 'ur' ? '💧 سیلاب کا علاقہ' : '💧 Flood Area'}</strong><br />
            {language === 'ur' ? 'ضلع' : 'District'}: {flood.district || 'Unknown'}
          </Popup>
        </Polygon>
      ))}

      {/* Roads */}
      {activeLayers.roads && roads.length > 0 && roads.map((road, idx) => (
        <Polyline 
          key={road.osm_id || `road-${idx}`} 
          positions={road.geometry?.coordinates?.map(([lng, lat]) => [lat, lng]) || []} 
          pathOptions={{ color: STATUS_COLORS[road.status] || '#888', weight: road.status === 'red' ? 4 : 3, opacity: 0.9 }}
        >
          <Popup>
            <strong>{road.name || 'Unnamed Road'}</strong><br />
            {road.status === 'green' && (language === 'ur' ? '🟢 کھلی / محفوظ' : '🟢 Open / Safe')}
            {road.status === 'amber' && (language === 'ur' ? '🟡 خطرہ' : '🟡 At Risk')}
            {road.status === 'red' && (language === 'ur' ? '🔴 بند / منقطع' : '🔴 Closed')}
            {road.hours_to_cutoff && <br />}
            {road.hours_to_cutoff && (language === 'ur' ? `⏱️ ${road.hours_to_cutoff} گھنٹے باقی` : `⏱️ ${road.hours_to_cutoff}h remaining`)}
          </Popup>
        </Polyline>
      ))}

      {/* Citizen Reports */}
      {activeLayers.citizenReports && reports.length > 0 && reports.map((report, idx) => {
        const severityColor = SEVERITY_COLORS[report.severity] || SEVERITY_COLORS.medium;
        return (
          <CircleMarker 
            key={`report-${idx}`} 
            center={[report.lat, report.lng]} 
            radius={report.severity === 'high' ? 8 : 6} 
            pathOptions={{ color: severityColor.bg, fillColor: severityColor.fill, fillOpacity: 0.8, weight: 2 }}
          >
            <Popup>
              <strong>{language === 'ur' ? '📢 شہری اطلاع' : '📢 Citizen Report'}</strong><br />
              {language === 'ur' ? 'شدت' : 'Severity'}: <strong style={{ color: severityColor.bg }}>
                {language === 'ur' ? severityColor.labelUr : severityColor.labelEn}
              </strong><br />
              {language === 'ur' ? 'وقت' : 'Time'}: {new Date(report.reported_at).toLocaleTimeString()}
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Rescue Stations */}
      {activeLayers.rescue && camps.length > 0 && camps.map((camp, idx) => (
        <Marker key={`camp-${idx}`} position={[camp.lat, camp.lng]}>
          <Popup>
            <strong>{language === 'ur' ? '🏕️ ریسکیو اسٹیشن' : '🏕️ Rescue Station'}</strong><br />
            {camp.name}
          </Popup>
        </Marker>
      ))}

      {/* River Gauges */}
      {activeLayers.gauges && gauges.length > 0 && gauges.map((gauge, idx) => (
        <CircleMarker key={`gauge-${idx}`} center={[gauge.lat || 30.68, gauge.lng || 70.65]} radius={10} pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.8 }}>
          <Popup>
            <strong>{language === 'ur' ? '📊 دریا گیج' : '📊 River Gauge'}</strong><br />
            {gauge.river || 'Chenab'} {language === 'ur' ? 'دریا' : 'River'}<br />
            {language === 'ur' ? 'سطح' : 'Level'}: {gauge.level_cm || 850}cm<br />
            {language === 'ur' ? 'رفتار' : 'Rise rate'}: {gauge.rise_rate_cm_per_hr || 0}cm/hr
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}