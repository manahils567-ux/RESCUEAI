const express = require('express');
const router = express.Router();
const { registerPhone } = require('../services/sms');

// POST /api/register
// Citizens register via WhatsApp to receive flood alerts
router.post('/', async (req, res) => {
  try {
    const { phone, union_council, district, language } = req.body;

    if (!phone || !union_council || !district) {
      return res.status(400).json({ 
        error: 'phone, union_council, and district are required' 
      });
    }

    // Validate phone number format (should start with + or country code)
    if (!phone.match(/^\+?92\d{10}$|^\+\d{10,14}$/)) {
      return res.status(400).json({
        error: 'Invalid phone number format. Use +92XXXXXXXXXX format'
      });
    }

    const success = await registerPhone(
      phone, 
      union_council, 
      district, 
      language || 'ur',
      'whatsapp' // Always WhatsApp delivery
    );

    if (success) {
      res.status(201).json({ 
        message: 'Phone registered successfully for WhatsApp alerts',
        phone,
        union_council,
        district,
        delivery_method: 'whatsapp',
        language: language || 'ur'
      });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/register/status/:phone
// Check if phone is registered
router.get('/status/:phone', async (req, res) => {
  try {
    const RegisteredPhone = require('../models/RegisteredPhone');
    const record = await RegisteredPhone.findOne({ phone: req.params.phone });
    
    if (!record) {
      return res.status(404).json({ registered: false });
    }

    res.json({
      registered: true,
      phone: record.phone,
      union_council: record.union_council,
      district: record.district,
      language: record.language,
      active: record.active,
      delivery_method: record.delivery_method || 'whatsapp'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/register/:phone
// Unregister phone from alerts
router.delete('/:phone', async (req, res) => {
  try {
    const RegisteredPhone = require('../models/RegisteredPhone');
    await RegisteredPhone.findOneAndUpdate(
      { phone: req.params.phone },
      { active: false }
    );

    res.json({ message: 'Unregistered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
