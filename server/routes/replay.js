const express = require('express');
const router  = express.Router();
const FloodEvent  = require('../models/FloodEvent');
const RiskScore   = require('../models/RiskScore');

// GET /api/replay?timestamp=2022-08-25T12:00:00Z
router.get('/', async (req, res) => {
  try {
    const ts          = new Date(req.query.timestamp || Date.now());
    const windowStart = new Date(ts - 3 * 60 * 60 * 1000);

    const [floods, riskScores] = await Promise.all([
      FloodEvent.find({
        is_historical: true,
        historical_date: { $gte: windowStart, $lte: ts }
      }).select('geometry district confidence'),
      RiskScore.find({
        is_historical: true,
        historical_date: { $gte: windowStart, $lte: ts }
      }).select('union_council district score tier'),
    ]);

    res.json({ timestamp: ts, floods, riskScores });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;