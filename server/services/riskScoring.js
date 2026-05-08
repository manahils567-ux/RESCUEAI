
const FloodEvent   = require('../models/FloodEvent');
const RiverGauge   = require('../models/RiverGauge');
const GroundReport = require('../models/GroundReport');
const RiskScore    = require('../models/RiskScore');

const UNION_COUNCILS = [
  { name: "Rajanpur City",  district: "Rajanpur",       lat: 29.10, lng: 70.33 },
  { name: "Taunsa Sharif",  district: "DG Khan",        lat: 30.70, lng: 70.65 },
  { name: "Muzaffargarh",   district: "Muzaffargarh",   lat: 30.07, lng: 71.19 },
  { name: "Layyah City",    district: "Layyah",         lat: 30.96, lng: 70.94 },
  { name: "Multan City",    district: "Multan",         lat: 30.19, lng: 71.47 },
  { name: "Bahawalpur",     district: "Bahawalpur",     lat: 29.39, lng: 71.68 },
  { name: "Rahim Yar Khan", district: "Rahim Yar Khan", lat: 28.42, lng: 70.30 },
  { name: "Mianwali",       district: "Mianwali",       lat: 32.58, lng: 71.54 },
  { name: "Bhakkar",        district: "Bhakkar",        lat: 31.63, lng: 71.06 },
];

async function calculateAllRiskScores() {
  const now = new Date();
  const twoHrsAgo = new Date(now - 2 * 60 * 60 * 1000);
  const [recentFloods, recentGauges, recentReports] = await Promise.all([
    FloodEvent.find({ fetched_at: { $gte: twoHrsAgo } }),
    RiverGauge.find({ read_at:    { $gte: twoHrsAgo } }),
    GroundReport.find({ reported_at: { $gte: twoHrsAgo } }),
  ]);
  console.log("Floods:", recentFloods.length, "Gauges:", recentGauges.length, "Reports:", recentReports.length);
  const scores = [];
  for (const uc of UNION_COUNCILS) {
    const satScore    = computeSatScore(uc, recentFloods);
    const gaugeScore  = computeGaugeScore(uc, recentGauges);
    const reportScore = computeReportScore(uc, recentReports);
    const total = Math.round(satScore * 0.40 + gaugeScore * 0.45 + reportScore * 0.15);
    const tier  = total >= 80 ? "red" : total >= 60 ? "amber" : "green";
    scores.push({ union_council: uc.name, district: uc.district, score: total, tier,
      satellite_score: satScore, gauge_score: gaugeScore, ndma_score: 0,
      report_score: reportScore, calculated_at: now });
  }
  await RiskScore.insertMany(scores);
  console.log("Risk scores saved:", scores.length);
  const redUCs = scores.filter(s => s.tier === 'red');
  if (redUCs.length > 0) {
    const { triggerSMSAlerts } = require('./sms');
    await triggerSMSAlerts(redUCs);
  }
  scores.forEach(s => console.log(" ", s.district, "/", s.union_council + ":", s.score, "(" + s.tier + ")"));
  return scores;
}

function computeSatScore(uc, floods) {
  const nearby = floods.filter(f => {
    if (!f.geometry || !f.geometry.coordinates || !f.geometry.coordinates[0]) return false;
    return f.geometry.coordinates[0].some(([lng, lat]) =>
      Math.abs(lat - uc.lat) < 0.05 && Math.abs(lng - uc.lng) < 0.05);
  });
  return nearby.length > 0 ? 100 : 0;
}

function computeGaugeScore(uc, gauges) {
  // Match by river name when lat/lng not available (fallback gauge data)
  const DISTRICT_RIVERS = {
    "Rajanpur":      "Indus",
    "DG Khan":       "Indus",
    "Layyah":        "Indus",
    "Mianwali":      "Indus",
    "Rahim Yar Khan":"Indus",
    "Muzaffargarh":  "Chenab",
    "Multan":        "Chenab",
    "Bahawalpur":    "Sutlej",
    "Bhakkar":       "Indus",
  };

  const river = DISTRICT_RIVERS[uc.district];
  
  // Try lat/lng match first (real PMD data)
  const byLocation = gauges.filter(g =>
    g.lat && g.lng &&
    Math.abs(g.lat - uc.lat) < 0.5 && Math.abs(g.lng - uc.lng) < 0.5);
  
  // Fall back to river name match (fallback gauge data)
  const byRiver = gauges.filter(g => g.river === river);
  
  const nearby = byLocation.length > 0 ? byLocation : byRiver;
  
  if (!nearby.length) return 0;
  const maxRate = Math.max(...nearby.map(g => g.rise_rate_cm_per_hr || 0));
  return Math.min(100, Math.round(maxRate * 10));
}

function computeReportScore(uc, reports) {
  const nearby = reports.filter(r =>
    Math.abs(r.lat - uc.lat) < 0.2 && Math.abs(r.lng - uc.lng) < 0.2);
  if (nearby.length === 0) return 0;
  if (nearby.length === 1) return 33;
  if (nearby.length <= 3) return 66;
  return 100;
}

module.exports = { calculateAllRiskScores };
