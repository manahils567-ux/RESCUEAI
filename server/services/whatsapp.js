const axios = require('axios');
const { detectIntent } = require('./intentDetector');
const pendingRegistrations = new Map();
const ur = require('../locales/ur');
const pa = require('../locales/pa');
const sd = require('../locales/sd');

// WhatsApp API URL
const WA_API = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

// Map of supported language codes to their locale modules
const LOCALES = { ur, pa, sd };

// ─── LOCALE RESOLVER ───────────────────────────────────────────
// Looks up the registered user's saved language preference and
// returns the matching locale module. Falls back to Urdu if the
// user is unregistered, has no language set, or the DB is down.
async function getLocale(phone) {
  try {
    const RegisteredPhone = require('../models/RegisteredPhone');
    const user = await RegisteredPhone.findOne({ phone }).select('language');
    return LOCALES[user?.language] || ur;
  } catch (err) {
    console.log('Database not connected, defaulting to Urdu locale');
    return ur;
  }
}

// ─── MAIN HANDLER ───────────────────────────────────────────
async function handleIncomingMessage(message, contact) {
  const from = message.from; // sender's phone number
  const type = message.type; // "text", "location", "image"
  const t = await getLocale(from); // resolved locale for this user

  console.log(`Message from ${from}, type: ${type}`);

  // FLOW A — User shares their GPS location
  if (type === 'location') {
    const { latitude: lat, longitude: lng } = message.location;
    await saveGroundReport(from, lat, lng, null, null);
    await sendText(from, t.REPORT_RECEIVED);
    return;
  }

  // FLOW B — User sends a photo
  if (type === 'image') {
    const mediaId = message.image.id;
    const mediaUrl = await getMediaUrl(mediaId);
    const caption = message.image.caption || '';
    await saveGroundReport(from, null, null, mediaUrl, caption);
    await sendText(from, t.REPORT_RECEIVED);
    return;
  }

  // FLOW C — User sends text
  if (type === 'text') {
    const text = message.text.body;

    // Check if user is in middle of registration flow
    const pending = pendingRegistrations.get(from);
    if (pending?.step === 'awaiting_district') {
      pendingRegistrations.delete(from);
      const { registerPhone } = require('./sms');
      await registerPhone(from, text.trim(), text.trim(), pending.language || 'ur', 'whatsapp');
      await sendText(from,
        `Registered for ${text.trim()} alerts.\n` +
        `You will now receive flood alerts for ${text.trim()}.`
      );
      return;
    }

    const intent = detectIntent(text);

    console.log(`Intent detected: ${intent}`);

    if (intent === 'ROAD_STATUS') {
      const reply = await getRoadStatusReply(text, t);
      await sendText(from, reply);
    }
    else if (intent === 'AGENT_UPDATE') {
      await handleAgentUpdate(from, text);
    }
    else if (intent === 'CAMP_LOCATION') {
      await sendText(from,
        'Nearest camp: Rajanpur Government School Camp.\n' +
        'Emergency: 1122'
      );
    }
    else if (intent === 'FLOOD_RISK') {
      await sendText(from,
        'See the BACHAO dashboard for the latest flood risk information.\n' +
        'Emergency: 1122'
      );
    }
    else if (intent === 'REGISTER') {
      pendingRegistrations.set(from, { step: 'awaiting_district' });
      await sendText(from,
        `To register, reply with your district name.\n` +
        `Example: Rajanpur`
      );
    }
    else {
      await sendText(from, t.HELP_MESSAGE);
    }
  }
}

// ─── ROAD STATUS QUERY ────────────────────────────────────────
async function getRoadStatusReply(text, t) {
  // Road names to check in the message
  const roadNames = [
    'N-55', 'N-70', 'N-85', 'N-5', 'M-4',
    'Taunsa', 'Rajanpur', 'DG Khan', 'Muzaffargarh'
  ];

  const mentioned = roadNames.find(r =>
    text.toLowerCase().includes(r.toLowerCase())
  );

  if (!mentioned) {
    return t.ROAD_NOT_FOUND;
  }

  // Try to find road in database
  try {
    const RoadSegment = require('../models/RoadSegment');
    const road = await RoadSegment.findOne({
      name: { $regex: mentioned, $options: 'i' }
    });

    if (!road) return t.ROAD_NOT_FOUND;

    if (road.status === 'green') return t.ROAD_OPEN(road.name);
    if (road.status === 'amber') return t.ROAD_WARNING(road.name, road.hours_to_cutoff);
    return t.ROAD_CLOSED(road.name);

  } catch (err) {
    // Database not connected yet — return fallback response for testing
    console.log('Database not connected, using fallback response');
    return `Status for ${mentioned} is not currently available. Emergency: 1122`;
  }
}

// ─── AGENT UPDATE (Field Worker) ──────────────────────────────
async function handleAgentUpdate(from, text) {
  const isClosed = /band|closed|blocked|بند/i.test(text);
  const isOpen   = /khula|open|clear|کھلا/i.test(text);

  const roadNames = ['N-55', 'N-70', 'N-85', 'Taunsa', 'Rajanpur'];
  const road = roadNames.find(r => text.includes(r));

  if (road && (isClosed || isOpen)) {
    try {
      const RoadSegment = require('../models/RoadSegment');
      await RoadSegment.updateMany(
        { name: { $regex: road, $options: 'i' } },
        { $set: { status: isClosed ? 'red' : 'green' } }
      );
    } catch (err) {
      console.log('Database not connected, skipping update');
    }
    await sendText(from,
      `Updated: ${road} marked as ${isClosed ? 'closed' : 'open'}.`
    );
  } else {
    const t = await getLocale(from);
    await sendText(from, t.HELP_MESSAGE);
  }
}

// ─── SAVE GROUND REPORT ───────────────────────────────────────
async function saveGroundReport(phone, lat, lng, photoUrl, text) {
  try {
    const GroundReport = require('../models/GroundReport');
    await GroundReport.create({
      reporter_phone: phone,
      lat: lat || 0,
      lng: lng || 0,
      photo_url: photoUrl,
      message_text: text,
      reported_at: new Date()
    });
    console.log(`Ground report saved from ${phone}`);
  } catch (err) {
    console.log('Database not connected, skipping ground report save');
  }
}

// ─── SEND WHATSAPP MESSAGE ────────────────────────────────────
async function sendText(to, body) {
  try {
    await axios.post(WA_API, {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body }
    }, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`
      }
    });
    console.log(`Message sent to ${to}`);
  } catch (err) {
    console.error(`Failed to send message to ${to}:`, err.message);
  }
}

// ─── GET MEDIA URL ────────────────────────────────────────────
async function getMediaUrl(mediaId) {
  try {
    const { data } = await axios.get(
      `https://graph.facebook.com/v18.0/${mediaId}`,
      { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
    );
    return data.url;
  } catch (err) {
    console.error('Failed to get media URL:', err.message);
    return null;
  }
}

module.exports = { handleIncomingMessage, sendText };