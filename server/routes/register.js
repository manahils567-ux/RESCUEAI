const express = require('express');
const router = express.Router();
const { registerPhone } = require('../services/sms');

// POST /api/register
// Citizens register to receive SMS alerts
router.post('/', async (req, res) => {
  try {
    const { phone, union_council, district, language } = req.body;

    if (!phone || !union_council || !district) {
      return res.status(400).json({ 
        error: 'phone, union_council, and district are required' 
      });
    }

    const success = await registerPhone(phone, union_council, district, language || 'ur');

    if (success) {
      res.status(201).json({ 
        message: 'Phone registered successfully',
        phone,
        union_council,
        district
      });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;