const axios = require('axios');
const FloodEvent = require('../models/FloodEvent');

// Pakistan bounding box: lat 23-37, lng 60-77
const PAKISTAN_BBOX = '60,23,77,37';

async function fetchFIRMSData() {
  try {
    // The FIRMS CSV endpoint requires an API key from firms.modaps.eosdis.nasa.gov/api/
    // If FIRMS_API_KEY is not set, skip silently rather than erroring every 3 hours
    if (!process.env.FIRMS_API_KEY) {
      console.log('FIRMS: no API key set (FIRMS_API_KEY) — skipping satellite fetch');
      return;
    }

    // Correct URL format: /api/area/csv/{key}/{source}/{bbox}/{days}/{date}
    const today = new Date().toISOString().split('T')[0];
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${process.env.FIRMS_API_KEY}/VIIRS_SNPP_NRT/${PAKISTAN_BBOX}/1/${today}`;

    const response = await axios.get(url, { timeout: 30000 });
    const lines = response.data.split('\n').filter(l => l.trim());

    if (lines.length < 2) {
      console.log('FIRMS: no data returned for today');
      return;
    }

    const headers = lines[0].split(',');
    const events = [];

    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(',');
      const row = {};
      headers.forEach((h, idx) => row[h.trim()] = vals[idx]?.trim());
      if (!row.latitude || !row.longitude) continue;

      const lat = parseFloat(row.latitude);
      const lng = parseFloat(row.longitude);
      if (isNaN(lat) || isNaN(lng)) continue;

      events.push({
        source: 'NASA_FIRMS',
        satellite: 'VIIRS',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [lng - 0.002, lat - 0.002],
            [lng + 0.002, lat - 0.002],
            [lng + 0.002, lat + 0.002],
            [lng - 0.002, lat + 0.002],
            [lng - 0.002, lat - 0.002]
          ]]
        },
        confidence: parseFloat(row.confidence) / 100 || 0.8,
        fetched_at: new Date()
      });
    }

    // Limit to 100 to avoid memory issues in Railway's free tier
    const limitedEvents = events.slice(0, 100);
    if (limitedEvents.length > 0) {
      await FloodEvent.insertMany(limitedEvents, { ordered: false });
      console.log(`FIRMS: inserted ${limitedEvents.length} flood events`);
    } else {
      console.log('FIRMS: 0 valid events parsed');
    }
  } catch (err) {
    // Don't crash the server — FIRMS is supplementary data
    console.error('FIRMS fetch error:', err.message);
  }
}

module.exports = { fetchFIRMSData };