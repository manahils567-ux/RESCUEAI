// Intent Detector — Understands Urdu, Punjabi, Sindhi queries
// Uses keyword matching for instant intent classification (no ML needed)

const INTENTS = {
  // User asking about road/highway status
  ROAD_STATUS: [
    // English
    'road', 'route', 'highway', 'bridge', 'open', 'closed', 'safe', 'blocked',
    // Urdu
    'sadak', 'rasta', 'khula', 'band', 'pakki', 'kya', 'pul', 'sarak',
    // Road names
    'N-55', 'N-70', 'N-85', 'N-5', 'M-4', 'N5', 'M4',
    // Locations
    'Taunsa', 'Rajanpur', 'DG Khan', 'Muzaffargarh', 'Dera Ghazi Khan',
  ],

  // Field agent/worker updating road status
  AGENT_UPDATE: [
    // English
    'update', 'blocked', 'closed', 'open', 'clear', 'agent', 'worker',
    // Urdu
    'band karo', 'kholo', 'update karo', 'band', 'update',
  ],

  // User asking for nearest relief camp/shelter
  CAMP_LOCATION: [
    // English
    'camp', 'shelter', 'relief', 'where', 'location', 'refuge',
    // Urdu
    'kahan', 'madad', 'camp kahan', 'shelter kahan', 'mahfooz',
  ],

  // User asking about flood risk in their area
  FLOOD_RISK: [
    // English
    'flood', 'risk', 'danger', 'safe area', 'evacuate', 'warning',
    // Urdu
    'selaab', 'khatra', 'mehfooz', 'nikal', 'bachao', 'danger',
  ],

  // User wants to register/sign up for alerts
  REGISTER: [
    'register', 'sign up', 'subscribe', 'alert me', 'register karo',
    'mujhe alert', 'SMS chahiye', 'alerts', 'notification',
  ],

  // User providing information/report
  REPORT: [
    'report', 'flood', 'water', 'damaged', 'help', 'injured',
    'situation', 'update', 'information',
  ]
};

function detectIntent(text) {
  if (!text || typeof text !== 'string') {
    return 'UNKNOWN';
  }

  const lower = text.toLowerCase();

  // Check each intent's keywords
  for (const [intent, keywords] of Object.entries(INTENTS)) {
    if (keywords.some(k => lower.includes(k.toLowerCase()))) {
      return intent;
    }
  }

  return 'UNKNOWN';
}

// ─── TEST FUNCTION ───────────────────────────────────────────
function testDetector() {
  const testMessages = [
    'N-55 khula hai?',
    'Rajanpur road band hai?',
    'camp kahan hai?',
    'selaab ka khatra hai?',
    'N-55 band karo',
    'hello there',
    'register karo please',
    'mujhe alert dena',
    'water aa gaya',
  ];

  console.log('\n' + '='.repeat(60));
  console.log('Intent Detector Test');
  console.log('='.repeat(60) + '\n');

  testMessages.forEach(msg => {
    const intent = detectIntent(msg);
    console.log(`"${msg}" → ${intent}`);
  });

  console.log('\n' + '='.repeat(60) + '\n');
}

// Run test when file is executed directly
if (require.main === module) {
  testDetector();
}

module.exports = { detectIntent, INTENTS };
