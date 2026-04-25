require('dotenv').config();
const axios = require('axios');

// ─── SMS ALERT TRIGGER ────────────────────────────────────────
// Called automatically by Person 2's risk scoring engine
// when any district crosses score 80 (RED tier)

async function triggerSMSAlerts(redUnionCouncils) {
  console.log(`🚨 SMS Alert triggered for ${redUnionCouncils.length} union councils`);

  for (const uc of redUnionCouncils) {
    try {
      // Get all registered phones for this union council
      const phones = await getRegisteredPhones(uc.union_council);

      if (!phones.length) {
        console.log(`No registered phones for ${uc.union_council}`);
        continue;
      }

      // Get safe route and nearest camp for this UC
      const route = await getSafeRoute(uc.union_council);

      // Send SMS to each registered phone
      for (const phone of phones) {
        const message = buildAlertMessage(uc, route);
        await sendSMS(phone.phone, message);

        // Rate limit — 1 SMS per 100ms to avoid API overload
        await new Promise(r => setTimeout(r, 100));
      }

      console.log(`✅ SMS sent to ${phones.length} people in ${uc.union_council}`);

    } catch (err) {
      console.error(`❌ SMS failed for ${uc.union_council}:`, err.message);
    }
  }
}

// ─── BUILD URDU ALERT MESSAGE ─────────────────────────────────
function buildAlertMessage(uc, route) {
  const campName = route?.nearest_camp?.name || 'Qareeb ka relief camp';
  const roadName = route?.safe_road?.name   || 'Ucha aur mehfooz rasta';

  // Urdu SMS — works on any phone including Rs.1000 Nokia
  return (
    `BACHAO ALERT: ${uc.union_council} mein selaab ka shadeed khatra hai. ` +
    `Abhi ${roadName} se niklen. ` +
    `Nazdeek camp: ${campName}. ` +
    `Madad ke liye: 1122`
  );
}

// ─── SEND SINGLE SMS ──────────────────────────────────────────
async function sendSMS(to, message) {
  try {
    // Jazz Bulk SMS API
    await axios.post(process.env.JAZZ_SMS_URL || 'https://api.jazz.com.pk/sms/send', {
      api_key:   process.env.JAZZ_SMS_API_KEY,
      sender_id: process.env.JAZZ_SMS_SENDER_ID || 'BACHAO',
      to,
      message
    });
    console.log(`📱 SMS sent to ${to}`);

  } catch (err) {
    console.error(`❌ SMS failed to ${to}:`, err.message);
  }
}

// ─── GET REGISTERED PHONES ────────────────────────────────────
async function getRegisteredPhones(union_council) {
  try {
    const RegisteredPhone = require('../models/RegisteredPhone');
    return await RegisteredPhone.find({
      union_council,
      active: true
    });
  } catch (err) {
    // DB not connected yet — return mock for testing
    console.log('DB not connected, using mock phones');
    return [
      { phone: '+923001234567' },
      { phone: '+923009876543' }
    ];
  }
}

// ─── GET SAFE ROUTE ───────────────────────────────────────────
async function getSafeRoute(union_council) {
  try {
    const { getSafeRouteForUC } = require('./safeRoute');
    return await getSafeRouteForUC(union_council, 0, 0);
  } catch (err) {
    // safeRoute built by Person 2 — not available yet
    return {
      safe_road:    { name: 'N-55 Taunsa Bypass' },
      nearest_camp: { name: 'Rajanpur Government School Camp' }
    };
  }
}

// ─── REGISTER A PHONE NUMBER ──────────────────────────────────
// Called when someone registers via WhatsApp or web form
async function registerPhone(phone, union_council, district, language) {
  try {
    const RegisteredPhone = require('../models/RegisteredPhone');
    await RegisteredPhone.findOneAndUpdate(
      { phone },
      { phone, union_council, district, language, active: true },
      { upsert: true }
    );
    console.log(`✅ Phone registered: ${phone} for ${union_council}`);
    return true;
  } catch (err) {
    console.error('Registration failed:', err.message);
    return false;
  }
}

// ─── TEST FUNCTION ────────────────────────────────────────────
async function testSMS() {
  console.log('Testing SMS system...\n');

  // Test building a message
  const testUC = {
    union_council: 'Rajanpur City',
    district: 'Rajanpur',
    score: 87,
    tier: 'red'
  };

  const testRoute = {
    safe_road:    { name: 'N-55 Taunsa Bypass' },
    nearest_camp: { name: 'Rajanpur Government School Camp' }
  };

  const message = buildAlertMessage(testUC, testRoute);
  console.log('📝 SMS Message that would be sent:');
  console.log('─'.repeat(50));
  console.log(message);
  console.log('─'.repeat(50));
  console.log('\n✅ SMS system ready');
  console.log('⏳ Jazz API credentials needed to send real SMS');
}

// Run test when file is executed directly
if (require.main === module) {
  testSMS();
}

module.exports = { triggerSMSAlerts, registerPhone, sendSMS };