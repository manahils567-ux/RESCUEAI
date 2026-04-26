require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

connectDB();

// Start all data scrapers and cron jobs
require('./jobs/cron');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// ─── ROUTES ───────────────────────────────────────────────────

// Person 3 — WhatsApp webhook
app.use('/webhook', require('./routes/webhook'));

// Person 3 — Ground reports
app.use('/api/reports', require('./routes/reports'));

app.use('/api/register', require('./routes/register'));

// Person 2 routes — will be uncommented when Person 2 pushes
app.use('/api/risk', require('./routes/risk'));
app.use('/api/roads', require('./routes/roads'));
app.use('/api/replay', require('./routes/replay'));

// ─── HEALTH CHECK ─────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', ts: new Date() })
);

// ─── START SERVER ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 Webhook ready at /webhook`);
  console.log(`📊 Reports ready at /api/reports`);
});