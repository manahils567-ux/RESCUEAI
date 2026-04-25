const fs = require('fs');

const code = `
const FloodEvent   = require('../models/FloodEvent');
const RiverGauge   = require('../models/RiverGauge');
const GroundReport = require('../models/GroundReport');
const RiskScore    = require('../models/RiskScore');

// Which river is nearest to each union council
const UNION_COUNCILS = [
  { name: "Rajanpur City",  district: "Rajanpur",       lat: 29.10, lng: 70.33, river: "Indus" },
  { name: "Taunsa Sharif",  district: "DG Khan",        lat: 30.70, lng: 70.65, river: "Indus" },
  { name: "Muzaffargarh",   district: "Muzaffargarh",   lat: 30.07, lng: 71.19, river: "Chenab" },
  { name: "Layyah City",    district: "Layyah",         lat: 30.96, lng: 70.94, river: "Indus" },
  { name: "Multan City",    district: "Multan",         lat: 30.19, lng: 71.47, river: "Chenab" },
  { name: "Bahawalpur",     district: "Bahawalpur",     lat: 29.39, lng: 71.68, river: "Sutlej" },
  { name: "Rahim Yar Khan", district: "Rahim Yar Khan", lat: 28.42, lng: 70.30, river: "Indus" },
  { name: "Mianwali",       district: "Mianwali",       lat: 32.58, lng: 71.54, river: "Indus" },
  { name: "Bhakkar",        district: "Bhakkar",        lat: 31.63, lng: 71.06, river: "Indus" },
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
  // Match by river name since gauges have no lat/lng
  const matching = gauges.filter(g =>
    g.river