const express = require('express');
const router = express.Router();
const { detectIntent } = require('../services/intentDetector');

// POST /api/chat
// Web-based AI assistant that uses the same intent detection as WhatsApp
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    const intent = detectIntent(message);
    let reply = '';

    if (intent === 'ROAD_STATUS') {
      // Try to find road info in database
      const roadNames = ['N-55', 'N-70', 'N-85', 'N-5', 'M-4', 'Taunsa', 'Rajanpur', 'DG Khan', 'Muzaffargarh'];
      const mentioned = roadNames.find(r => message.toLowerCase().includes(r.toLowerCase()));

      if (mentioned) {
        try {
          const RoadSegment = require('../models/RoadSegment');
          const road = await RoadSegment.findOne({ name: { $regex: mentioned, $options: 'i' } });
          if (road) {
            const statusText = road.status === 'green' ? 'OPEN and passable' :
                               road.status === 'amber' ? `WARNING — may close in ${road.hours_to_cutoff || '?'} hours` :
                               'CLOSED — impassable';
            reply = `Road ${road.name}: ${statusText}. District: ${road.district || 'N/A'}. Road type: ${road.road_type || 'N/A'}.`;
          } else {
            reply = `No data found for "${mentioned}" in the database. Emergency: 1122.`;
          }
        } catch {
          reply = `Road status for ${mentioned} is currently unavailable. Emergency: 1122.`;
        }
      } else {
        reply = 'Please specify a road name (e.g., N-55, N-70) or a district (e.g., Rajanpur, DG Khan).';
      }
    }
    else if (intent === 'CAMP_LOCATION') {
      try {
        const ReliefCamp = require('../models/ReliefCamp');
        const camps = await ReliefCamp.find().limit(5);
        if (camps.length > 0) {
          reply = 'Nearest relief camps:\n' + camps.map(c => `• ${c.name} — ${c.district}`).join('\n');
        } else {
          reply = 'Nearest camp: Rajanpur Government School Camp. Emergency: 1122';
        }
      } catch {
        reply = 'Nearest camp: Rajanpur Government School Camp. Emergency: 1122';
      }
    }
    else if (intent === 'FLOOD_RISK') {
      try {
        const RiskScore = require('../models/RiskScore');
        const topRisks = await RiskScore.find().sort({ score: -1 }).limit(3);
        if (topRisks.length > 0) {
          reply = 'Current flood risk analysis:\n' + topRisks.map(r =>
            `• ${r.district} — Score: ${r.score}, Tier: ${r.tier}`
          ).join('\n') + '\nEvacuate if in critical zones. Emergency: 1122.';
        } else {
          reply = 'No active risk scores available. Check the Risk Analytics panel for latest data. Emergency: 1122';
        }
      } catch {
        reply = 'Flood risk data is currently unavailable. Please check the Risk Analytics dashboard. Emergency: 1122';
      }
    }
    else if (intent === 'REGISTER') {
      reply = 'To register for WhatsApp flood alerts, send a message to our WhatsApp number. You can also register via the public sign-up page.';
    }
    else if (intent === 'REPORT') {
      reply = 'To submit a field report, please use the Field Reports section in the side navigation, or send a photo/location via WhatsApp.';
    }
    else {
      reply = 'I can help with:\n• Road status queries (e.g., "Is N-55 open?")\n• Flood risk information\n• Relief camp locations\n• Field report submission\n\nPlease ask a specific question about flood conditions, road status, or relief operations.';
    }

    res.json({ reply, intent });

  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
