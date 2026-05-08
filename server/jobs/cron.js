const cron = require('node-cron');
const { fetchFIRMSData }   = require('../scrapers/firms');
const { scrapePMDGauges }  = require('../scrapers/pmd');
const { scrapeNDMAAlerts } = require('../scrapers/ndma');
const { calculateAllRiskScores } = require('../services/riskScoring');
const { updateAllRoadStatuses } = require('../services/roadCutoff');
const RoadSegment = require('../models/RoadSegment');

console.log('⏰ Initializing cron jobs...\n');

cron.schedule('0 */3 * * *', () => {
  console.log('🛰️  [CRON] Fetching NASA FIRMS satellite data...');
  fetchFIRMSData();
});

cron.schedule('*/30 * * * *', () => {
  console.log('📊 [CRON] Scraping PMD river gauges...');
  scrapePMDGauges();
});

cron.schedule('*/30 * * * *', () => {
  console.log('📢 [CRON] Scraping NDMA alerts...');
  scrapeNDMAAlerts();
});

cron.schedule('*/30 * * * *', async () => {
  console.log('⚠️  [CRON] Calculating risk scores...');
  try {
    await calculateAllRiskScores();
  } catch (err) {
    console.error('❌ Risk scoring failed:', err.message);
  }
});

cron.schedule('*/30 * * * *', async () => {
  console.log('🛣️  [CRON] Updating road statuses...');
  try {
    await updateAllRoadStatuses();
  } catch (err) {
    console.error('❌ Road status update failed:', err.message);
  }
});

console.log('✅ All cron jobs scheduled and running\n');
console.log('📅 Schedule Summary:');
console.log('   • NASA FIRMS: Every 3 hours');
console.log('   • PMD Gauges: Every 30 minutes');
console.log('   • NDMA Alerts: Every 30 minutes');
console.log('   • Risk Scores: Every 30 minutes');
console.log('   • Road Status: Every 30 minutes\n');

// Run startup jobs — road status is SKIPPED on startup to prevent OOM crash
(async () => {
  console.log('🚀 Running startup jobs...\n');

  console.log('⏭️  Skipping FIRMS on startup (runs on 3hr schedule)\n');

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

  // Road status: only run on startup if road count is safe
  try {
    const count = await RoadSegment.countDocuments();
    if (count > 0 && count <= 5000) {
      console.log(`🛣️  Running road status on startup (${count} roads)...\n`);
      await updateAllRoadStatuses();
      console.log('✅ Road Status completed\n');
    } else {
      console.log(`⏭️  Skipping road status on startup (${count} roads — too many, runs on 30min schedule)\n`);
    }
  } catch (e) { console.log('⚠️  Road status not available:', e.message, '\n'); }

})();