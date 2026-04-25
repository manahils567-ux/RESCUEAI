const RoadSegment = require('../models/RoadSegment');
const ReliefCamp  = require('../models/ReliefCamp');

async function getSafeRouteForUC(union_council, uc_lat, uc_lng) {
  const greenRoads = await RoadSegment.find({ status: 'green' })
    .sort({ elevation_m: -1 })
    .limit(200);
  if (!greenRoads.length) {
    return { union_council, safe_road: null, nearest_camp: null, message: 'No safe roads found' };
  }
  let bestRoad = null;
  let minDist  = Infinity;
  for (const road of greenRoads) {
    const coords = road.geometry.coordinates;
    if (!coords || coords.length === 0) continue;
    const mid    = coords[Math.floor(coords.length / 2)];
    const midLng = mid[0];
    const midLat = mid[1];
    const dist   = Math.sqrt(Math.pow(midLat - uc_lat, 2) + Math.pow(midLng - uc_lng, 2));
    if (dist < minDist) {
      minDist  = dist;
      bestRoad = { name: road.name, osm_id: road.osm_id, elevation_m: road.elevation_m, status: road.status };
    }
  }
  const camps = await ReliefCamp.find({ active: true });
  let nearestCamp = null;
  let minCampDist = Infinity;
  for (const camp of camps) {
    const d = Math.sqrt(Math.pow(camp.lat - uc_lat, 2) + Math.pow(camp.lng - uc_lng, 2));
    if (d < minCampDist) { minCampDist = d; nearestCamp = { name: camp.name, lat: camp.lat, lng: camp.lng, district: camp.district }; }
  }
  return { union_council, safe_road: bestRoad, nearest_camp: nearestCamp };
}

module.exports = { getSafeRouteForUC };
