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
      auth: {
        username: accountSid,
        password: authToken
      }
    });

    console.log(`📱 SMS sent to ${to}`);

  } catch (err) {
    console.error(`❌ SMS failed to ${to}:`, err.message);
  }
}