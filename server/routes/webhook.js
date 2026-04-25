const express = require('express');
const router = express.Router();
const { handleIncomingMessage } = require('../services/whatsapp');

// ─── WEBHOOK VERIFICATION ─────────────────────────────────────
// Meta calls this once to verify your webhook is real
router.get('/', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('🔍 Verification request received');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ Webhook verified!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Verification failed - token mismatch');
    res.sendStatus(403);
  }
});

// ─── RECEIVE INCOMING MESSAGES ────────────────────────────────
// Meta calls this every time someone sends a WhatsApp message
router.post('/', async (req, res) => {
  try {
    const body = req.body;

    // Make sure this is a WhatsApp message
    if (body.object !== 'whatsapp_business_account') {
      return res.sendStatus(404);
    }

    const entry = body.entry?.[0]?.changes?.[0]?.value;

    // No messages in this request — just acknowledge
    if (!entry?.messages) {
      return res.sendStatus(200);
    }

    // Process each incoming message
    for (const message of entry.messages) {
      console.log(`📩 Incoming message type: ${message.type}`);
      await handleIncomingMessage(message, entry.contacts?.[0]);
    }

    // IMPORTANT — always respond 200 within 5 seconds
    // Meta will retry if you don't respond fast enough
    res.sendStatus(200);

  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    // Still send 200 so Meta doesn't keep retrying
    res.sendStatus(200);
  }
});

module.exports = router;