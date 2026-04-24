const cron = require('node-cron');
const { fetchFIRMSData }   = require('../scrapers/firms');
const { scrapePMDGauges }  = require('../scrapers/pmd');
const { scrapeNDMAAlerts } = require('../scrapers/ndma');

// NASA FIRMS every 3 hours
cron.schedule('0 */3 * * *', fetchFIRMSData);

// PMD gauges every 30 minutes
cron.schedule('*/30 * * * *', scrapePMDGauges);

// NDMA alerts every 30 minutes
cron.schedule('*/30 * * * *', scrapeNDMAAlerts);

// Run all immediately on server start
fetchFIRMSData();
scrapePMDGauges();
scrapeNDMAAlerts();

console.log('All cron jobs scheduled and running');