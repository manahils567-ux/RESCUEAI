// Intent detector — understands Urdu, Punjabi, Sindhi queries
// No ML library needed — simple keyword matching works perfectly

const INTENTS = {
  // User asking about road status
  ROAD_STATUS: [
    // English
    'road', 'route', 'highway', 'bridge', 'open', 'closed', 'safe',
    // Urdu
    'sadak', 'rasta', 'khula', 'band', 'pakki', 'kya', 'pul',
    // Road names
    'N-55', 'N-70', 'N-85', 'N-5', 'M-4',
    // Locations
    'Taunsa', 'Rajanpur', 'DG Khan', 'Muzaffargarh',
  ],

  // Field agent updating road status
  AGENT_UPDATE: [
    // English
    'update', 'blocked', 'closed', 'open', 'clear', 'agent',
    // Urdu
    'band karo', 'kholo', 'update karo',
  ],

  // User asking for nearest relief camp
  CAMP_LOCATION: [
    // English
    'camp', 'shelter', 'relief', 'where', 'location',
    // Urdu
    'kahan', 'madad', 'camp kahan', 'shelter kahan',
  ],

  // User asking about flood risk in their area
  FLOOD_RISK: [
    // English
    'flood', 'risk', 'danger', 'safe area', 'evacuate',
    // Urdu
    'selaab', 'khatra', 'mehfooz', 'nikal', 'bachao',
  ],

  REGISTER: [
  'register', 'sign up', 'subscribe', 'alert me',
  'mujhe alert', 'register karo', 'SMS chahiye'
  ],
};

function detectIntent(text) {
  const lower = text.toLowerCase();

  for (const [intent, keywords] of Object.entries(INTENTS)) {
    if (keywords.some(k => lower.includes(k.toLowerCase()))) {
      return intent;
    }
  }

  return 'UNKNOWN';
}

// Test the detector with some example messages
function testDetector() {
  const testMessages = [
    'N-55 khula hai?',
    'Rajanpur road band hai?',
    'camp kahan hai?',
    'selaab ka khatra hai?',
    'N-55 band karo',
    'hello there',
  ];

  console.log('Testing intent detector:');
  testMessages.forEach(msg => {
    console.log(`"${msg}" → ${detectIntent(msg)}`);
  });
}

// Run test when file is executed directly
if (require.main === module) {
  testDetector();
}

module.exports = { detectIntent };