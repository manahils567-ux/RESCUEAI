// Mock data — jab tak real API ready nahi, tab tak yeh use karo

export const mockRoads = [
  {
    osm_id: "1001",
    name: "N-55 Taunsa Bypass",
    status: "amber",
    hours_to_cutoff: 6.5,
    geometry: {
      type: "LineString",
      coordinates: [[70.65, 30.68], [70.70, 30.72], [70.75, 30.75]]
    }
  },
  {
    osm_id: "1002",
    name: "N-70 Rajanpur Road",
    status: "red",
    hours_to_cutoff: 1.2,
    geometry: {
      type: "LineString",
      coordinates: [[70.30, 29.08], [70.35, 29.12]]
    }
  },
  {
    osm_id: "1003",
    name: "M-4 Motorway",
    status: "green",
    hours_to_cutoff: null,
    geometry: {
      type: "LineString",
      coordinates: [[71.50, 30.50], [71.60, 30.55], [71.70, 30.60]]
    }
  }
];

export const mockRiskScores = [
  { union_council: "Rajanpur City", district: "Rajanpur", score: 87, tier: "red", calculated_at: new Date().toISOString() },
  { union_council: "Taunsa Sharif", district: "DG Khan", score: 64, tier: "amber", calculated_at: new Date().toISOString() },
  { union_council: "Multan South", district: "Multan", score: 22, tier: "green", calculated_at: new Date().toISOString() }
];

export const mockFloodPolygons = [
  {
    district: "Rajanpur",
    geometry: {
      type: "Polygon",
      coordinates: [[[70.25, 29.0], [70.45, 29.0], [70.45, 29.2], [70.25, 29.2], [70.25, 29.0]]]
    }
  }
];

export const mockGroundReports = [
  { lat: 29.10, lng: 70.33, severity: "high", reported_at: new Date().toISOString() },
  { lat: 30.70, lng: 70.65, severity: "medium", reported_at: new Date().toISOString() }
];

export const mockReliefCamps = [
  { name: "Rajanpur Relief Camp 1", lat: 29.05, lng: 70.28, district: "Rajanpur" },
  { name: "DG Khan Camp", lat: 30.05, lng: 70.63, district: "DG Khan" }
];