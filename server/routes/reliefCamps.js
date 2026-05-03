const express = require('express');
const router = express.Router();
const ReliefCamp = require('../models/ReliefCamp');

// GET /api/relief-camps
router.get('/', async (req, res) => {
  try {
    const { district } = req.query;
    const filter = {};
    if (district) filter.district = district;
    
    const camps = await ReliefCamp.find(filter);
    res.json(camps); // Empty array aayega (data nahi hai)
  } catch (error) {
    console.error('Relief camps error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;