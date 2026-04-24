const axios = require('axios');
const FloodEvent = require('../models/FloodEvent');

const PAKISTAN_BBOX = '60,23,77,37';

async function fetchFIRMSData() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${process.env.FIRMS_API_KEY}/VIIRS_SNPP_NRT/${PAKISTAN_BBOX}/1/${today}`;

    const response = await axios.get(url, { timeout: 30000 });
    const lines = response.data.split('\n').filter(l => l.trim());
    if (lines.length < 2) {
      console.log('FIRMS: no data returned');
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

    if (events.length > 0) {
      await FloodEvent.insertMany(events, { ordered: false });
      console.log(`FIRMS: inserted ${events.length} flood events`);
    } else {
      console.log('FIRMS: 0 events parsed');
    }
  } catch (err) {
    console.error('FIRMS fetch error:', err.message);
  }
}

module.exports = { fetchFIRMSData };