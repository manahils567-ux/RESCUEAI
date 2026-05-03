const express = require('express');
const router = express.Router();
const RiverGauge = require('../models/RiverGauge');

// GET /api/river-gauges
router.get('/', async (req, res) => {
  try {
    const gauges = await RiverGauge.find().sort({ read_at: -1 }).limit(50);
    res.json(gauges);
  } catch (error) {
    console.error('River gauges error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;