const express = require('express');
const router = express.Router();
const GroundReport = require('../models/GroundReport');

// GET /api/reports?district=Rajanpur
// Returns citizen ground reports for the map
router.get('/', async (req, res) => {
  try {
    const filter = {};

    // Filter by district if provided
    if (req.query.district) {
      filter.district = req.query.district;
    }

    // Only return last 24 hours of reports
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    filter.reported_at = { $gte: oneDayAgo };

    const reports = await GroundReport.find(filter)
      .sort({ reported_at: -1 })
      .limit(100);

    res.json(reports);

  } catch (err) {
    console.error('Reports fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reports — register a new ground report
router.post('/', async (req, res) => {
  try {
    const { reporter_phone, lat, lng, photo_url, message_text, district } = req.body;

    const report = await GroundReport.create({
      reporter_phone,
      lat,
      lng,
      photo_url,
      message_text,
      district,
      reported_at: new Date()
    });

    res.status(201).json(report);

  } catch (err) {
    console.error('Report creation error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;