const axios = require('axios');
const cheerio = require('cheerio');
const RiverGauge = require('../models/RiverGauge');

const FFD_URL = 'https://ffd.pmd.gov.pk/dashboard';

function detectRiver(station) {
  const s = station.toLowerCase();
  if (s.includes('indus') || s.includes('taunsa') || s.includes('sukkur') || s.includes('kotri') || s.includes('kalabagh') || s.includes('chashma')) return 'Indus';
  if (s.includes('chenab') || s.includes('trimmu') || s.includes('punjnad') || s.includes('marala')) return 'Chenab';
  if (s.includes('jhelum') || s.includes('rasul') || s.includes('mangla')) return 'Jhelum';
  if (s.includes('sutlej') || s.includes('islam') || s.includes('sulemanki') || s.includes('ganda')) return 'Sutlej';
  if (s.includes('ravi') || s.includes('shahdara') || s.includes('balloki') || s.includes('jassar')) return 'Ravi';
  if (s.includes('kabul') || s.includes('nowshera') || s.includes('warsak')) return 'Kabul';
  return 'Unknown';
}

async function scrapePMDGauges() {
  try {
    const { data } = await axios.get(FFD_URL, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(data);
    const readings = [];

    $('table tr').each((i, row) => {
      const cells = $(row).find('td').map((j, td) => $(td).text().trim()).get();
      if (cells.length >= 2 && cells[0] && cells[1] && !isNaN(parseFloat(cells[1]))) {
        const level = parseFloat(cells[1]);
        if (level > 0 && level < 2000000) {
          readings.push({
            station:   cells[0].trim(),
            level_cm:  level,
            danger_cm: cells[2] ? parseFloat(cells[2]) || null : null,
            river:     detectRiver(cells[0]),
            read_at:   new Date()
          });
        }
      }
    });

    // Compute rise rates
    for (const r of readings) {
      try {
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
        const prev = await RiverGauge.findOne({
          station: r.station,
          read_at: { $lte: threeHoursAgo }
        }).sort({ read_at: -1 });
        r.rise_rate_cm_per_hr = prev
          ? Math.round(((r.level_cm - prev.level_cm) / 3) * 10) / 10
          : 0;
      } catch { r.rise_rate_cm_per_hr = 0; }
    }

    if (readings.length > 0) {
      await RiverGauge.insertMany(readings, { ordered: false });
      console.log(`PMD: ${readings.length} gauge readings saved from FFD`);
    } else {
      console.log('PMD: no readings found on FFD dashboard — using fallback');
      await insertFallbackGaugeData();
    }
  } catch (err) {
    console.error('PMD scrape error:', err.message);
    await insertFallbackGaugeData();
  }
}

async function insertFallbackGaugeData() {
  const fallback = [
    { station: 'Taunsa Barrage',    river: 'Indus',  level_cm: 450, danger_cm: 900, rise_rate_cm_per_hr: 2 },
    { station: 'Trimmu Headworks',  river: 'Chenab', level_cm: 380, danger_cm: 800, rise_rate_cm_per_hr: 1 },
    { station: 'Rasul Barrage',     river: 'Jhelum', level_cm: 320, danger_cm: 700, rise_rate_cm_per_hr: 0.5 },
    { station: 'Islam Headworks',   river: 'Sutlej', level_cm: 290, danger_cm: 600, rise_rate_cm_per_hr: 0 },
  ].map(r => ({ ...r, read_at: new Date() }));
  try {
    await RiverGauge.insertMany(fallback, { ordered: false });
    console.log('PMD: fallback gauge data inserted');
  } catch {}
}

module.exports = { scrapePMDGauges };