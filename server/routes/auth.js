const express = require('express');
const router = express.Router();

// Simple mock user credentials
const MOCK_USER = {
  identifier: 'agent@rescue.ai', // email or phone
  password: 'secret',
};

router.post('/login', (req, res) => {
  const { identifier, password } = req.body;
  if (identifier === MOCK_USER.identifier && password === MOCK_USER.password) {
    // In a real app you would issue a JWT or session cookie
    return res.json({ success: true, token: 'demo-token' });
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

module.exports = router;
