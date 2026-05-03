console.log('🔥 floods.js route file loaded successfully');

const express = require('express');
const router = express.Router();
const FloodEvent = require('../models/FloodEvent');

router.get('/', async (req, res) => {
  try {
    console.log('🔍 /api/floods hit!');
    
    const count = await FloodEvent.countDocuments();
    console.log(`📊 Total flood events in DB: ${count}`);
    
    const floods = await FloodEvent.find({ province: 'Punjab' })
      .sort({ fetched_at: -1 })
      .limit(100);
    
    console.log(`✅ Sending ${floods.length} flood events`);
    res.json(floods);
  } catch (error) {
    console.error('❌ Floods error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;