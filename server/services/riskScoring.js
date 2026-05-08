const FloodEvent   = require('../models/FloodEvent');
const RiverGauge   = require('../models/RiverGauge');
const NDMAAlert    = require('../models/NDMAAlert');
const GroundReport = require('../models/GroundReport');
const RiskScore    = require('../models/RiskScore');

const UNION_COUNCILS = [
  { name: "Rajanpur City",  district: "Rajanpur",       lat: 29.10, lng: 70.33, river: "Indus"  },
  { name: "Taunsa Sharif",  district: "DG Khan",        lat: 30.70, lng: 70.65, river: "Indus"  },
  { name: "Muzaffargarh",   district: "Muzaffargarh",   lat: 30.07, lng: 71.19, river: "Chenab" },
  { name: "Layyah City",    district: "Layyah",         lat: 30.96, lng: 70.94, river: "Indus"  },
  { name: "Multan City",    district: "Multan",         lat: 30.19, lng: 71.47, river: "Chenab" },
  { name: "Bahawalpur",     district: "Bahawalpur",     lat: 29.39, lng: 71.68, river: "Sutlej" },
  { name: "Rahim Yar Khan", district: "Rahim Yar Khan", lat: 28.42, lng: 70.30, river: "Indus"  },
  { name: "Mianwali",       district: "Mianwali",       lat: 32.58, lng: 71.54, river: "Indus"  },
  { name: "Bhakkar",        district: "Bhakkar",        lat: 31.63, lng: 71.06, river: "Indus"  },
];

async function calculateAllRiskScores() {
  const now = new Date();
  const twoHrsAgo = new Date(now - 2 * 60 * 60 * 1000);
  const sixHrsAgo = new Date(now - 6 * 60 * 60 * 1000);

  const [recentFloods, recentGauges, recentAlerts, recentReports] = await Promise.all([
    FloodEvent.find({ fetched_at: { $gte: twoHrsAgo } }),
    RiverGauge.find({ read_at: { $gte: twoHrsAgo } }),
    NDMAAlert.find({ scraped_at: { $gte: sixHrsAgo } }),
    GroundReport.find({ reported_at: { $gte: twoHrsAgo } }),
  ]);

  console.log("Floods:", recentFloods.length, "Gauges:", recentGauges.length,
    "Alerts:", recentAlerts.length, "Reports:", recentReports.length);

  const scores = [];

  for (const uc of UNION_COUNCILS) {
    const satScore    = computeSatScore(uc, recentFloods);
    const gaugeScore  = computeGaugeScore(uc, recentGauges);
    const ndmaScore   = computeNDMAScore(uc, recentAlerts);
    const reportScore = computeReportScore(uc, recentReports);

    const total = Math.round(
      satScore    * 0.35 +
      gaugeScore  * 0.35 +
      ndmaScore   * 0.20 +
      reportScore * 0.10
    );
    const tier = total >= 80 ? 'red' : total >= 60 ? 'amber' : 'green';

    scores.push({
      union_council:   uc.name,
      district:        uc.district,
      score:           total,
      tier,
      satellite_score: satScore,
      gauge_score:     gaugeScore,
      ndma_score:      ndmaScore,
      report_score:    reportScore,
      calculated_at:   now
    });
  }

  await RiskScore.insertMany(scores);
  console.log("Risk scores saved:", scores.length);

  const redUCs = scores.filter(s => s.tier === 'red');
  if (redUCs.length > 0) {
    const { triggerSMSAlerts } = require('./sms');
    await triggerSMSAlerts(redUCs);
  }

  scores.forEach(s =>
    console.log(" ", s.district, "/", s.union_council + ":", s.score, "(" + s.tier + ")")
  );
  return scores;
}

function computeSatScore(uc, floods) {
  const nearby = floods.filter(f => {
    if (!f.geometry || !f.geometry.coordinates || !f.geometry.coordinates[0]) return false;
    return f.geometry.coordinates[0].some(([lng, lat]) =>
      Math.abs(lat - uc.lat) < 0.05 && Math.abs(lng - uc.lng) < 0.05
    );
  });
  return nearby.length > 0 ? 100 : 0;
}

function computeGaugeScore(uc, gauges) {
  // PRIMARY: match by lat/lng (real PMD data with coordinates)
  const byLocation = gauges.filter(g =>
    g.lat != null && g.lng != null &&
    Math.abs(g.lat - uc.lat) < 0.5 &&
    Math.abs(g.lng - uc.lng) < 0.5
  );

  // FALLBACK: match by river name (fallback gauge data has no lat/lng)
  // This is the key fix — previously this fallback was missing so scores were always 0
  const byRiver = byLocation.length > 0
    ? byLocation
    : gauges.filter(g => g.river === uc.river);

  if (!byRiver.length) return 0;

  const maxRate = Math.max(...byRiver.map(g => g.rise_rate_cs_per_hr || 0));
  // 10 cm/hr rise = score of 100; 2 cm/hr (Indus fallback) = score of 20
  return Math.min(100, Math.round(maxRate * 10));
}

function computeNDMAScore(uc, alerts) {
  // Match by district name or 'National'
  const match = alerts.find(a =>
    a.district === uc.district || a.district === 'National'
  );
  if (!match) return 0;
  return { 3: 100, 2: 66, 1: 33 }[match.alert_level] || 0;
}

function computeReportScore(uc, reports) {
  const nearby = reports.filter(r =>
    Math.abs(r.lat - uc.lat) < 0.2 &&
    Math.abs(r.lng - uc.lng) < 0.2
  );
  if (nearby.length === 0) return 0;
  if (nearby.length === 1) return 33;
  if (nearby.length <= 3) return 66;
  return 100;
}

module.exports = { calculateAllRiskScores };
