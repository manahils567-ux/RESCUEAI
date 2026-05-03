require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

async function testAlert() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const RegisteredPhone = require('./server/models/RegisteredPhone');
  const { triggerSMSAlerts } = require('./server/services/sms');

  // Register a test number first
  await RegisteredPhone.findOneAndUpdate(
    { phone: '+923139303465' }, // your number
    { 
      phone: '+923139303465', 
      union_council: 'Rajanpur City',
      district: 'Rajanpur',
      language: 'ur',
      active: true
    },
    { upsert: true }
  );
  console.log('✅ Test number registered');

  // Trigger alert
  await triggerSMSAlerts([{
    union_council: 'Rajanpur City',
    district: 'Rajanpur',
    score: 87,
    tier: 'red'
  }]);

  console.log('\n✅ Full alert flow complete!');
  process.exit(0);
}

testAlert().catch(console.error);