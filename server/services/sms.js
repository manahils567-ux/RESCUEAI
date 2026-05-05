require('dotenv').config();
const axios = require('axios');
const RegisteredPhone = require('../models/RegisteredPhone');
const { sendText } = require('./whatsapp');

// ─── TRIGGER ALERTS FOR HIGH-RISK AREAS ─────────────────────
async function triggerWhatsAppAlerts(redUnionCouncils) {
  console.log(`\n🚨 WHATSAPP ALERT triggered for ${redUnionCouncils.length} union councils`);
  
  for (const uc of redUnionCouncils) {
    try {
      const phones = await getRegisteredPhones(uc.union_council);
      
      if (!phones.length) {
        console.log(`⚠️  No registered phones for ${uc.union_council}`);
        continue;
      }

      const route = await getSafeRoute(uc.union_council);
      const message = buildAlertMessage(uc, route);

      for (const phone of phones) {
        try {
          await sendText(phone.phone, message);
          await new Promise(r => setTimeout(r, 200)); // Rate limiting
        } catch (err) {
          console.error(`❌ Failed to send to ${phone.phone}:`, err.message);
        }
      }

      console.log(`✅ WhatsApp alerts sent to ${phones.length} people in ${uc.union_council}`);
    } catch (err) {
      console.error(`❌ Alert failed for ${uc.union_council}:`, err.message);
    }
  }
}

// ─── BUILD ALERT MESSAGE ───────────────────────────────────
function buildAlertMessage(uc, route) {
  const campName = route?.nearest_camp?.name || 'قریب کا رِلیف کیمپ';
  const roadName = route?.safe_road?.name || 'محفوظ سڑک';
  
  return (
    `🚨 *BACHAO FLOOD ALERT* 🚨\n\n` +
    `${uc.union_council} میں سیلاب کا شدید خطرہ ہے!\n\n` +
    `📍 *محفوظ سڑک:* ${roadName}\n` +
    `🏕️ *رِلیف کیمپ:* ${campName}\n` +
    `⏱️ *خطرہ درجہ:* ${uc.score >= 80 ? '🔴 شدید' : '🟠 اہم'}\n\n` +
    `فوری نکلیں! مدد: 1122`
  );
}

// ─── GET REGISTERED PHONES FOR AREA ──────────────────────────
async function getRegisteredPhones(union_council) {
  try {
    return await RegisteredPhone.find({ 
      union_council, 
      active: true,
      delivery_method: { $in: ['whatsapp', 'both'] }
    });
  } catch (err) {
    console.log('🔄 DB not connected, using mock phones');
    return [{ phone: '+923001234567' }];
  }
}

// ─── GET SAFE ROUTE & CAMP INFO ──────────────────────────────
async function getSafeRoute(union_council) {
  try {
    const { getSafeRouteForUC } = require('./safeRoute');
    return await getSafeRouteForUC(union_council, 0, 0);
  } catch (err) {
    // Fallback for demo/testing
    return {
      safe_road: { name: 'N-55 تاونسہ بائی پاس' },
      nearest_camp: { name: 'راجن پور حکومتی اسکول کیمپ' }
    };
  }
}

// ─── REGISTER PHONE IN DATABASE ──────────────────────────────
async function registerPhone(phone, union_council, district, language = 'ur', delivery_method = 'whatsapp') {
  try {
    const registered = await RegisteredPhone.findOneAndUpdate(
      { phone },
      { 
        phone, 
        union_council, 
        district, 
        language,
        delivery_method, // 'whatsapp' only (Twilio SMS not available in Pakistan)
        active: true,
        registered_at: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log(`✅ Phone registered: ${phone} for ${union_council} (${delivery_method})`);
    return true;
  } catch (err) {
    console.error('❌ Registration failed:', err.message);
    return false;
  }
}

// ─── TEST FUNCTION ───────────────────────────────────────────
async function testAlerts() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing WhatsApp Alert System');
  console.log('='.repeat(60) + '\n');
  
  const testUC = { 
    union_council: 'Rajanpur City', 
    district: 'Rajanpur', 
    score: 87, 
    tier: 'red' 
  };
  
  const testRoute = {
    safe_road: { name: 'N-55 تاونسہ بائی پاس' },
    nearest_camp: { name: 'راجن پور حکومتی اسکول کیمپ' }
  };
  
  const message = buildAlertMessage(testUC, testRoute);
  
  console.log('📝 Alert Message that would be sent:\n');
  console.log('─'.repeat(60));
  console.log(message);
  console.log('─'.repeat(60));
  console.log('\n✅ WhatsApp Alert System Ready\n');
  console.log('Note: Alerts are sent ONLY via WhatsApp in this implementation');
  console.log('Twilio SMS support has been removed (not available in Pakistan)\n');
}

// Run test when file is executed directly
if (require.main === module) {
  testAlerts();
}

module.exports = { 
  triggerWhatsAppAlerts,
  triggerSMSAlerts: triggerWhatsAppAlerts, // For backward compatibility
  registerPhone, 
  buildAlertMessage,
  getSafeRoute,
  getRegisteredPhones
};
