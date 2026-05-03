require('dotenv').config({ path: './server/.env' });
const axios = require('axios');

async function testSMS() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const from       = process.env.TWILIO_FROM_NUMBER;
  const to         = '+923139303465'; // PUT YOUR OWN NUMBER HERE

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams();
  params.append('To', to);
  params.append('From', from);
  params.append('Body', 'BACHAO TEST: SMS system working! Twilio connected successfully.');

  try {
    const response = await axios.post(url, params, {
      auth: { username: accountSid, password: authToken }
    });
    console.log('✅ SMS sent successfully!');
    console.log('Message SID:', response.data.sid);
  } catch (err) {
    console.error('❌ SMS failed:', err.response?.data || err.message);
  }
}

testSMS();