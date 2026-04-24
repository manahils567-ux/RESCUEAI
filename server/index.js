require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// ROUTES
const reportsRoute = require('./routes/reports');
app.use('/api/reports', reportsRoute);

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', ts: new Date() })
);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));