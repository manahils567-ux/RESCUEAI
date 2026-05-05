const cron = require('node-cron');
const { fetchFIRMSData }   = require('../scrapers/firms');
const { scrapePMDGauges }  = require('../scrapers/pmd');
const { scrapeNDMAAlerts } = require('../scrapers/ndma');
const { calculateAllRiskScores } = require('../services/riskScoring');
const { updateAllRoadStatuses } = require('../services/roadCutoff');

console.log('⏰ Initializing cron jobs...\n');

// ─── SATELLITE DATA ──────────────────────────────────────────
// NASA FIRMS flood detection every 3 hours
cron.schedule('0 */3 * * *', () => {
  console.log('🛰️  [CRON] Fetching NASA FIRMS satellite data...');
  fetchFIRMSData();
});

// ─── GAUGE DATA ──────────────────────────────────────────────
// PMD river gauge readings every 30 minutes
cron.schedule('*/30 * * * *', () => {
  console.log('📊 [CRON] Scraping PMD river gauges...');
  scrapePMDGauges();
});

// ─── GOVERNMENT ALERTS ───────────────────────────────────────
// NDMA official flood alerts every 30 minutes
cron.schedule('*/30 * * * *', () => {
  console.log('📢 [CRON] Scraping NDMA alerts...');
  scrapeNDMAAlerts();
});

// ─── RISK CALCULATION ────────────────────────────────────────
// Calculate district risk scores every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  console.log('⚠️  [CRON] Calculating risk scores for all districts...');
  try {
    await calculateAllRiskScores();
  } catch (err) {
    console.error('❌ Risk scoring failed:', err.message);
  }
});

// ─── ROAD CUT-OFF PREDICTION ─────────────────────────────────
// Predict hours-to-inundation for each road every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  console.log('🛣️  [CRON] Updating road cut-off predictions...');
  try {
    await updateAllRoadStatuses();
  } catch (err) {
    console.error('❌ Road status update failed:', err.message);
  }
});

// ─── RUN ALL JOBS ON SERVER START ────────────────────────────
console.log('🚀 Running all jobs on startup...\n');

(async () => {
  try {
    await fetchFIRMSData();
    console.log('✅ NASA FIRMS completed\n');
  } catch (e) { console.log('⚠️  FIRMS not available:', e.message, '\n'); }

  try {
    await scrapePMDGauges();
    console.log('✅ PMD Gauges completed\n');
  } catch (e) { console.log('⚠️  PMD not available:', e.message, '\n'); }

  try {
    await scrapeNDMAAlerts();
    console.log('✅ NDMA Alerts completed\n');
  } catch (e) { console.log('⚠️  NDMA not available:', e.message, '\n'); }

  try {
    await calculateAllRiskScores();
    console.log('✅ Risk Scores completed\n');
  } catch (e) { console.log('⚠️  Risk scoring not available:', e.message, '\n'); }

  try {
    await updateAllRoadStatuses();
    console.log('✅ Road Status completed\n');
  } catch (e) { console.log('⚠️  Road status not available:', e.message, '\n'); }
})();

console.log('✅ All cron jobs scheduled and running\n');
console.log('📅 Schedule Summary:');
console.log('   • NASA FIRMS: Every 3 hours');
console.log('   • PMD Gauges: Every 30 minutes');
console.log('   • NDMA Alerts: Every 30 minutes');
console.log('   • Risk Scores: Every 30 minutes');
console.log('   • Road Status: Every 30 minutes\n');
