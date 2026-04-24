const axios = require('axios');
const cheerio = require('cheerio');

const NDMA_URL = 'https://ndma.gov.pk/flood-advisories/';

const ALERT_KEYWORDS = {
  3: ['emergency', 'red alert', 'extreme', 'catastrophic', 'critical'],
  2: ['high alert', 'severe', 'warning', 'danger'],
  1: ['advisory', 'watch', 'moderate', 'caution', 'alert']
};

const PUNJAB_DISTRICTS = [
  'Rajanpur', 'DG Khan', 'Dera Ghazi Khan', 'Muzaffargarh', 'Layyah',
  'Multan', 'Bahawalpur', 'Rahim Yar Khan', 'Mianwali', 'Bhakkar',
  'Taunsa', 'Sukkur', 'Kashmore', 'Jacobabad', 'Shikarpur'
];

function detectAlertLevel(text) {
  const lower = text.toLowerCase();
  for (const [level, words] of Object.entries(ALERT_KEYWORDS).reverse()) {
    if (words.some(w => lower.includes(w))) return parseInt(level);
  }
  return 0;
}

function extractDistricts(text) {
  return PUNJAB_DISTRICTS.filter(d => text.toLowerCase().includes(d.toLowerCase()));
}

async function scrapeNDMAAlerts() {
  try {
    const { data } = await axios.get(NDMA_URL, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    const alerts = [];

    $('p, li, td, h3, h4').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length < 20 || text.length > 1000) return;
      const level = detectAlertLevel(text);
      if (level === 0) return;
      const districts = extractDistricts(text);
      districts.forEach(district => {
        alerts.push({ district, alert_level: level, raw_text: text.slice(0, 300), scraped_at: new Date() });
      });
    });

    console.log(`NDMA: ${alerts.length} district alerts parsed`);
    return alerts;
  } catch (err) {
    console.error('NDMA scrape error:', err.message);
    return [];
  }
}

module.exports = { scrapeNDMAAlerts };