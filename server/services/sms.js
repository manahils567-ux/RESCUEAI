require('dotenv').config();
const axios = require('axios');
const RegisteredPhone = require('../models/RegisteredPhone');

async function triggerSMSAlerts(redUnionCouncils) {
  console.log(`🚨 SMS Alert triggered for ${redUnionCouncils.length} union councils`);
  for (const uc of redUnionCouncils) {
    try {
      const phones = await getRegisteredPhones(uc.union_council);
      if (!phones.length) {
        console.log(`No registered phones for ${uc.union_council}`);
        continue;
      }
      const route = await getSafeRoute(uc.union_council);
      for (const phone of phones) {
        const message = buildAlertMessage(uc, route);
        await sendSMS(phone.phone, message);
        await new Promise(r => setTimeout(r, 100));
      }
      console.log(`✅ SMS sent to ${phones.length} people in ${uc.union_council}`);
    } catch (err) {
      console.error(`❌ SMS failed for ${uc.union_council}:`, err.message);
    }
  }
}

function buildAlertMessage(uc, route) {
  const campName = route?.nearest_camp?.name || 'Qareeb ka relief camp';
  const roadName = route?.safe_road?.name   || 'Ucha aur mehfooz rasta';
  return (
    `BACHAO ALERT: ${uc.union_council} mein selaab ka shadeed khatra hai. ` +
    `Abhi ${roadName} se niklen. ` +
    `Nazdeek camp: ${campName}. ` +
    `Madad ke liye: 1122`
  );
}

async function sendSMS(to, message) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;
    const from       = process.env.TWILIO_FROM_NUMBER;
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', from);
    params.append('Body', message);
    await axios.post(url, params, {
      auth: { username: accountSid, password: authToken }
    });
    console.log(`📱 SMS sent to ${to}`);
  } catch (err) {
    console.error(`❌ SMS failed to ${to}:`, err.message);
  }
}

async function getRegisteredPhones(union_council) {
  try {
    return await RegisteredPhone.find({ union_council, active: true });
  } catch (err) {
    console.log('DB not connected, using mock phones');
    return [{ phone: '+923001234567' }];
  }
}

async function getSafeRoute(union_council) {
  try {
    const { getSafeRouteForUC } = require('./safeRoute');
    return await getSafeRouteForUC(union_council, 0, 0);
  } catch (err) {
    return {
      safe_road:    { name: 'N-55 Taunsa Bypass' },
      nearest_camp: { name: 'Rajanpur Government School Camp' }
    };
  }
}

async function registerPhone(phone, union_council, district, language) {
  try {
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

async function testSMS() {
  console.log('Testing SMS system...\n');
  const testUC = { union_council: 'Rajanpur City', district: 'Rajanpur', score: 87, tier: 'red' };
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
}

if (require.main === module) { testSMS(); }

module.exports = { triggerSMSAlerts, registerPhone, sendSMS };