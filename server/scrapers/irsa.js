/**
 * pmd.js — River Gauge Scraper (IRSA Daily Water Situation PDF)
 *
 * Source: Indus River System Authority (pakirsa.gov.pk)
 * Data:   Daily PDF published each morning, e.g. Data07-05-2026.pdf
 * Units:  Cusecs (stored in level_cm field for schema compatibility)
 *
 * Strategy:
 *   1. Try today's PDF → yesterday's → day before (in case of late publish)
 *   2. Parse the structured PDF text to extract station discharge values
 *   3. Fall back to static representative data if all PDFs fail
 *
 * NOTE: filename stays pmd.js intentionally — no changes needed in cron.js
 */

const axios = require('axios');
const RiverGauge = require('../models/RiverGauge');

// ─── Station Definitions ───────────────────────────────────────────────────────
// For each station: which PDF keyword to search for, and which value type
// to prefer (dams → MEAN INFLOW, barrages → U/S DISCHARGE)
const STATIONS = [
  { header: 'INDUS @ TARBELA', name: 'Tarbela', river: 'Indus', lat: 33.99, lng: 72.67, danger: 450000, prefer: 'MEAN INFLOW' },
  { header: 'KABUL @ NOWSHERA', name: 'Nowshera', river: 'Kabul', lat: 34.01, lng: 71.98, danger: 200000, prefer: 'MEAN DISCHARGE' },
  { header: 'KALABAGH', name: 'Kalabagh', river: 'Indus', lat: 32.96, lng: 71.55, danger: 400000, prefer: 'U/S DISCHARGE' },
  { header: 'CHASHMA', name: 'Chashma', river: 'Indus', lat: 32.45, lng: 71.37, danger: 350000, prefer: 'MEAN INFLOW' },
  { header: 'TAUNSA', name: 'Taunsa', river: 'Indus', lat: 30.68, lng: 70.65, danger: 300000, prefer: 'U/S DISCHARGE' },
  { header: 'GUDDU', name: 'Guddu', river: 'Indus', lat: 28.43, lng: 69.72, danger: 600000, prefer: 'U/S DISCHARGE' },
  { header: 'SUKKUR', name: 'Sukkur', river: 'Indus', lat: 27.70, lng: 68.86, danger: 800000, prefer: 'U/S DISCHARGE' },
  { header: 'KOTRI', name: 'Kotri', river: 'Indus', lat: 25.37, lng: 68.31, danger: 800000, prefer: 'U/S DISCHARGE' },
  { header: 'JHELUM @ MANGLA', name: 'Mangla', river: 'Jhelum', lat: 33.15, lng: 73.65, danger: 250000, prefer: 'MEAN INFLOW' },
  { header: 'CHENAB @ MARALA', name: 'Marala', river: 'Chenab', lat: 32.68, lng: 74.47, danger: 300000, prefer: 'MEAN U/S' },
  { header: 'PANJNAD', name: 'Panjnad', river: 'Chenab', lat: 29.36, lng: 70.97, danger: 400000, prefer: 'U/S DISCHARGE' },
];

const VALUE_PATTERNS = {
  'U/S DISCHARGE': /U\/S DISCHARGE\s*=\s*([\d,]+)/,
  'MEAN DISCHARGE': /MEAN DISCHARGE\s*=\s*([\d,]+)/,
  'MEAN INFLOW': /MEAN INFLOW\s*=\s*([\d,]+)/,
  'MEAN U/S': /MEAN U\/S DISCHARGE\s*=\s*([\d,]+)/,
};

const FALLBACK_ORDER = ['U/S DISCHARGE', 'MEAN DISCHARGE', 'MEAN INFLOW', 'MEAN U/S'];

// ─── PDF Text Parser ───────────────────────────────────────────────────────────
function parsePDFText(text) {
  const readings = [];

  for (const station of STATIONS) {
    const idx = text.indexOf(station.header);
    if (idx === -1) continue;

    // 500-char window handles the two-column layout of the IRSA PDF
    const segment = text.substring(idx, idx + 500);

    let val = null;

    // Try preferred value type first
    const prefMatch = segment.match(VALUE_PATTERNS[station.prefer]);
    if (prefMatch) {
      val = parseInt(prefMatch[1].replace(/,/g, ''), 10);
    } else {
      // Fallback through other value types
      for (const fb of FALLBACK_ORDER) {
        const m = segment.match(VALUE_PATTERNS[fb]);
        if (m) { val = parseInt(m[1].replace(/,/g, ''), 10); break; }
      }
    }

    if (val && val > 0) {
      readings.push({
        station: station.name,
        river: station.river,
        lat: station.lat,
        lng: station.lng,
        level_cs: val,
        danger_cs: station.danger,
        rise_rate_cs_per_hr: 0,           
        read_at: new Date(),
      });
    }
  }

  return readings;
}

// ─── PDF Fetcher ───────────────────────────────────────────────────────────────
// IRSA URL pattern: http://pakirsa.gov.pk/Doc/Data07-05-2026.pdf
function buildPDFUrl(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `http://pakirsa.gov.pk/Doc/Data${dd}-${mm}-${yyyy}.pdf`;
}

async function fetchPDFText(url) {
  const resp = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 20000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'http://pakirsa.gov.pk/DailyData.aspx',
      'Accept': 'application/pdf,*/*',
    },
  });

  const pdfModule = require('pdf-parse');
  const buf = Buffer.from(resp.data);

  // Handle both function export and class export styles of pdf-parse
  if (typeof pdfModule === 'function') {
    const result = await pdfModule(buf);
    return result.text;
  } else if (pdfModule.PDFParse) {
    const parser = new pdfModule.PDFParse();
    const result = await parser.parse(buf);
    return result.text;
  }
  throw new Error('pdf-parse: no usable export found — run: npm install pdf-parse');
}

// ─── Rise Rate Calculation ─────────────────────────────────────────────────────
async function addRiseRates(readings) {
  for (const r of readings) {
    try {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const prev = await RiverGauge.findOne({
        station: r.station,
        read_at: { $lte: threeHoursAgo },
      }).sort({ read_at: -1 });
      r.rise_rate_cs_per_hr = prev
        ? Math.round(((r.level_cs - prev.level_cs) / 3) * 10) / 10
        : 0;
    } catch {
      r.rise_rate_cm_per_hr = 0;
    }
  }
}

// ─── Main Entry Point ──────────────────────────────────────────────────────────
async function scrapeIRSAGauges() {
  let readings = [];
  let usedUrl = '';

  // Try today, yesterday, and 2 days back (PDF may not publish until mid-morning)
  for (let daysBack = 0; daysBack <= 2; daysBack++) {
    const date = new Date();
    date.setDate(date.getDate() - daysBack);
    const url = buildPDFUrl(date);

    try {
      console.log(`IRSA: trying ${url}`);
      const text = await fetchPDFText(url);
      readings = parsePDFText(text);

      if (readings.length > 0) {
        usedUrl = url;
        break;
      }
      console.warn(`IRSA: PDF fetched but no data parsed — ${url}`);
    } catch (e) {
      console.log(`IRSA: ${url} — PDF not yet published, trying previous day...`);
    }
  }

  if (readings.length === 0) {
    console.log('IRSA: all PDF attempts failed — using fallback data');
    await insertFallbackGaugeData();
    return;
  }

  await addRiseRates(readings);

  try {
    await RiverGauge.insertMany(readings, { ordered: false });
    const filename = usedUrl.split('/').pop();
    console.log(`✅ IRSA (${filename}): ${readings.length} gauge readings saved`);
    readings.forEach(r => {
      const pct = r.danger_cs > 0
        ? Math.round((r.level_cs / r.danger_cs) * 100)
        : 0;
      console.log(`   ${r.station.padEnd(12)} (${r.river}): ${(r.level_cs || 0).toLocaleString()} Cs — ${pct}% of danger`);
    });
  } catch (e) {
    if (!e.message.includes('duplicate')) {
      console.error('IRSA insert error:', e.message);
    }
  }
}

// ─── Static Fallback ──────────────────────────────────────────────────────────
// Representative non-flood-season values in cusecs.
// Used only when the IRSA PDF cannot be fetched after 3 attempts.
async function insertFallbackGaugeData() {
  const fallback = [
    { station: 'Tarbela', river: 'Indus', level_cs: 40000, danger_cs: 450000, lat: 33.99, lng: 72.67 },
    { station: 'Kalabagh', river: 'Indus', level_cs: 75000, danger_cs: 400000, lat: 32.96, lng: 71.55 },
    { station: 'Taunsa', river: 'Indus', level_cs: 85000, danger_cs: 300000, lat: 30.68, lng: 70.65 },
    { station: 'Guddu', river: 'Indus', level_cs: 55000, danger_cs: 600000, lat: 28.43, lng: 69.72 },
    { station: 'Sukkur', river: 'Indus', level_cs: 45000, danger_cs: 800000, lat: 27.70, lng: 68.86 },
    { station: 'Mangla', river: 'Jhelum', level_cs: 32000, danger_cs: 250000, lat: 33.15, lng: 73.65 },
    { station: 'Marala', river: 'Chenab', level_cs: 16000, danger_cs: 300000, lat: 32.68, lng: 74.47 },
    { station: 'Nowshera', river: 'Kabul', level_cs: 27000, danger_cs: 200000, lat: 34.01, lng: 71.98 },
    { station: 'Panjnad', river: 'Chenab', level_cs: 11000, danger_cs: 400000, lat: 29.36, lng: 70.97 },
  ].map(r => ({ ...r, rise_rate_cs_per_hr: 0, read_at: new Date() }));

  try {
    await RiverGauge.insertMany(fallback, { ordered: false });
    console.log('IRSA: fallback gauge data inserted');
  } catch (e) {
    // duplicate key = already inserted this run, fine
  }
}

module.exports = { scrapeIRSAGauges };