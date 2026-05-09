require('dotenv').config({ path: __dirname + '/.env' });

console.log('MONGO_URI loaded:', process.env.MONGO_URI ? '✅ Yes' : '❌ No');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

connectDB();
require('./jobs/cron');

const app = express();

app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:3000',
      'http://192.168.100.50:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked:', origin);
      callback(new Error('CORS blocked: ' + origin));
    }
  },
  credentials: true
}));
app.use(express.json());

// ROUTES
app.use('/webhook', require('./routes/webhook'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/register', require('./routes/register'));
app.use('/api/risk', require('./routes/risk'));
app.use('/api/roads', require('./routes/roads'));
app.use('/api/floods', require('./routes/floods'));
app.use('/api/replay', require('./routes/replay'));
app.use('/api/relief-camps', require('./routes/reliefCamps'));
app.use('/api/river-gauges', require('./routes/riverGauges'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 Webhook ready at /webhook`);
  console.log(`📊 Reports ready at /api/reports`);
  console.log(`🏕️ Relief camps ready at /api/relief-camps`);
  console.log(`🌊 River gauges ready at /api/river-gauges`);
  console.log(`⚠️ Risk ready at /api/risk`);
  console.log(`🛣️ Roads ready at /api/roads`);
  console.log(`🌊 Floods ready at /api/floods`);
});