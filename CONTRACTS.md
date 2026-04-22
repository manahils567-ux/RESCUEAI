# API Contracts — RescueAI

GET /api/health
→ { status: "ok", ts: "ISO timestamp" }

GET /api/roads?district=Rajanpur
→ [{ osm_id, name, status: "amber", hours_to_cutoff: 4,
     geometry: { type: "LineString", coordinates: [[lng,lat],...] } }]

GET /api/risk?province=Punjab
→ [{ union_council, district, score: 73, tier: "amber", calculated_at }]

GET /api/replay?timestamp=2022-08-25T12:00:00Z
→ { roads: [...], risk_scores: [...], flood_events: [...] }

GET /api/reports?district=Rajanpur
→ [{ lat, lng, photo_url, severity, reported_at }]