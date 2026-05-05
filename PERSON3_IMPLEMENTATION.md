═════════════════════════════════════════════════════════════════════════════
BACHAO — Person 3 Implementation Guide
Delivery Bots: WhatsApp-Based Alert System
═════════════════════════════════════════════════════════════════════════════

📋 IMPLEMENTATION CHECKLIST
═════════════════════════════════════════════════════════════════════════════

✅ COMPLETED IMPLEMENTATIONS:

1. WhatsApp Bot Service (server/services/whatsapp.js)
   - Incoming message handler
   - Intent detection
   - Road status queries
   - Ground report collection (location + photos)
   - Registration flow
   - Agent updates

2. Intent Detector (server/services/intentDetector.js)
   - Keyword matching for Urdu/Punjabi/Sindhi
   - 6 intents: ROAD_STATUS, AGENT_UPDATE, CAMP_LOCATION, FLOOD_RISK, REGISTER, REPORT
   - Extensible keyword system

3. Alert Delivery Service (server/services/sms.js)
   - WhatsApp-only alerts (Twilio SMS removed)
   - Alert message builder with Urdu messaging
   - Phone registration system
   - Safe route & relief camp finder integration

4. Webhook Handler (server/routes/webhook.js)
   - Meta webhook verification
   - Incoming message processing
   - Fast response (<5s) for reliability

5. Registration Route (server/routes/register.js)
   - Phone registration
   - Status checking
   - Unregistration
   - Format validation

6. Database Model (server/models/RegisteredPhone.js)
   - Phone number storage
   - Union council & district
   - Language preference (Urdu/Punjabi/Sindhi)
   - Delivery method tracking
   - Active status toggle

7. Cron Jobs (server/jobs/cron.js)
   - Risk scoring every 30 minutes
   - Road status updates every 30 minutes
   - Alert triggering on red-tier districts
   - Schedule management


═════════════════════════════════════════════════════════════════════════════
HOW IT WORKS
═════════════════════════════════════════════════════════════════════════════

1. USER REGISTRATION
   ───────────────────
   
   via WhatsApp:
   → User types "register" or similar intent
   → Bot asks for district name
   → Bot saves phone + district to database
   → User marked as "active" and receives alerts
   
   via API:
   → POST /api/register
   → Body: { phone: "+923001234567", union_council: "Rajanpur City", district: "Rajanpur" }
   → Phone registered in database


2. CONTINUOUS MONITORING (Every 30 mins)
   ───────────────────────────────
   
   Cron Job #1: Risk Scoring
   → Fetches recent satellite floods, gauge data, ground reports
   → Calculates 0-100 risk score for each district
   → Triggers alerts if score >= 80 (red tier)
   
   Cron Job #2: Road Status Updates
   → Uses gauge rise rates + road elevations
   → Calculates hours-to-inundation per road
   → Updates road status: green (safe), amber (warn), red (evacuate)


3. ALERT DELIVERY
   ───────────────
   
   When district risk hits red (score >= 80):
   → System finds all registered users in that district
   → Retrieves safe evacuation road + nearest relief camp
   → Sends WhatsApp message with:
      - 🚨 BACHAO ALERT header
      - Location + risk level
      - Safe route name
      - Relief camp location
      - Emergency number (1122)
   
   Example message (Urdu):
   "🚨 BACHAO FLOOD ALERT 🚨
    Rajanpur میں سیلاب کا شدید خطرہ ہے!
    📍 محفوظ سڑک: N-55 تاونسہ بائی پاس
    🏕️ رِلیف کیمپ: راجن پور حکومتی اسکول کیمپ
    فوری نکلیں! مدد: 1122"


4. USER QUERIES
   ─────────────
   
   User: "N-55 khula hai?" (Is N-55 open?)
   → Bot detects: ROAD_STATUS intent
   → Queries RoadSegment collection
   → Returns: "N-55 ابھی کھلی ہے۔ محفوظ سفر کریں۔"
   
   User: "camp kahan hai?" (Where is camp?)
   → Bot detects: CAMP_LOCATION intent
   → Returns nearest relief camp location
   
   User: "road open/band karo" (Open/Close road)
   → Bot detects: AGENT_UPDATE intent (field worker)
   → Updates road status in database
   → Requires agent authentication in production


5. GROUND REPORTS
   ───────────────
   
   User shares location via WhatsApp:
   → Saved to GroundReport collection
   → Used in risk scoring (citizen reports = 15% weight)
   
   User uploads photo with caption:
   → Photo URL + caption saved
   → Geotagged for analysis
   → Helps validate satellite predictions


═════════════════════════════════════════════════════════════════════════════
API ENDPOINTS FOR TESTING
═════════════════════════════════════════════════════════════════════════════

1. REGISTER A PHONE
   ─────────────────
   POST /api/register
   
   Request:
   {
     "phone": "+923001234567",
     "union_council": "Rajanpur City",
     "district": "Rajanpur",
     "language": "ur"
   }
   
   Response:
   {
     "message": "Phone registered successfully for WhatsApp alerts",
     "phone": "+923001234567",
     "union_council": "Rajanpur City",
     "district": "Rajanpur",
     "delivery_method": "whatsapp",
     "language": "ur"
   }


2. CHECK REGISTRATION STATUS
   ─────────────────────────
   GET /api/register/status/:phone
   
   Example: GET /api/register/status/%2B923001234567
   
   Response:
   {
     "registered": true,
     "phone": "+923001234567",
     "union_council": "Rajanpur City",
     "district": "Rajanpur",
     "language": "ur",
     "active": true,
     "delivery_method": "whatsapp"
   }


3. UNREGISTER
   ──────────
   DELETE /api/register/:phone
   
   Response:
   { "message": "Unregistered successfully" }


4. GET RISK SCORES
   ────────────────
   GET /api/risk?district=Rajanpur
   
   Returns all risk scores for the district, ordered by recency


5. GET ROAD STATUS
   ────────────────
   GET /api/roads?district=Rajanpur&status=red
   
   Returns roads in the district matching the status (red/amber/green)


═════════════════════════════════════════════════════════════════════════════
ENVIRONMENT VARIABLES REQUIRED
═════════════════════════════════════════════════════════════════════════════

Create a .env file with:

  # WhatsApp
  WHATSAPP_PHONE_NUMBER_ID=123456789012345
  WHATSAPP_TOKEN=EAAxxxxxx...
  WHATSAPP_VERIFY_TOKEN=random_webhook_verify_token
  
  # Database
  MONGO_URI=mongodb://localhost:27017/bachao
  
  # Server
  PORT=5000
  NODE_ENV=development


═════════════════════════════════════════════════════════════════════════════
KEY CHANGES FROM ORIGINAL SPECIFICATION
═════════════════════════════════════════════════════════════════════════════

1. ✅ WHATSAPP ONLY (No Twilio SMS)
   ─────────────────────────────────
   Original: Mentioned both SMS and WhatsApp
   Updated: Removed all Twilio SMS code
   Reason: Twilio SMS not available in Pakistan
   
   What was removed:
   - Twilio account SID/token authentication
   - Twilio HTTP API calls
   - SMS in riskScoring.js
   - SMS fallback logic
   
   What changed:
   - triggerSMSAlerts() → triggerWhatsAppAlerts()
   - All alerts now use sendText() from whatsapp.js
   - RegisteredPhone model now tracks delivery_method


2. ✅ REMOVED JAZZ DELIVERY BOTS
   ────────────────────────────
   Original: Plan included Jazz (mobile operator) integration
   Updated: Removed all Jazz-specific code
   Reason: Would require Jazz driving licence not available
   
   What was removed:
   - Any Jazz telecom integration
   - Jazz delivery flow
   - Jazz registration endpoints


3. ✅ ALERT FLOW SIMPLIFIED
   ─────────────────────────
   Original: Complex multi-step alert routing
   Updated: Direct WhatsApp delivery
   
   Flow:
   Risk Score >= 80 → Get registered phones → Send WhatsApp → Done
   (No SMS fallback, no multi-channel complexity)


4. ✅ INTENT DETECTION ENHANCED
   ────────────────────────────
   Added: REPORT intent for future damage reports
   Enhanced: More Urdu/Punjabi keywords
   Added: Better error handling


═════════════════════════════════════════════════════════════════════════════
TESTING CHECKLIST
═════════════════════════════════════════════════════════════════════════════

[ ] 1. Start server: npm run dev
[ ] 2. Server prints: "✅ Server running on port 5000"
[ ] 3. Webhook ready: "📡 Webhook ready at /webhook"

[ ] 4. Test registration API:
       curl -X POST http://localhost:5000/api/register \
         -H "Content-Type: application/json" \
         -d '{"phone":"+923001234567","union_council":"Rajanpur City","district":"Rajanpur"}'

[ ] 5. Test status check:
       curl http://localhost:5000/api/register/status/%2B923001234567

[ ] 6. Check MongoDB has RegisteredPhone document

[ ] 7. Test intent detector:
       node server/services/intentDetector.js

[ ] 8. Test alert system:
       node server/services/sms.js

[ ] 9. Verify WhatsApp webhook verification token is set

[ ] 10. Check cron jobs run:
        Should see "Risk scores saved" etc. every 30 mins


═════════════════════════════════════════════════════════════════════════════
DEPLOYMENT NOTES
═════════════════════════════════════════════════════════════════════════════

1. WhatsApp Setup (Meta Business Platform):
   - Create WhatsApp Business Account
   - Get WHATSAPP_PHONE_NUMBER_ID
   - Generate WHATSAPP_TOKEN (with messages:manage scope)
   - Create WHATSAPP_VERIFY_TOKEN (random string, any value)
   - Point webhook URL to: https://your-domain.com/webhook
   - Subscribe to webhook events: messages, message_status

2. Database:
   - Connect to MongoDB Atlas or local MongoDB
   - Database name: "bachao"
   - Collections created automatically by Mongoose

3. Cron Jobs:
   - Run on main server process
   - Execute every 30 minutes automatically
   - Logs printed to console

4. Rate Limiting:
   - WhatsApp API: ~100 messages/second
   - Added 200ms delay between messages to be safe
   - Adjust if needed for larger deployments

5. Monitoring:
   - Check console logs for errors
   - Monitor MongoDB connection
   - Track webhook responses from Meta (200 OK required)


═════════════════════════════════════════════════════════════════════════════
FILE STRUCTURE
═════════════════════════════════════════════════════════════════════════════

server/
├── services/
│   ├── whatsapp.js              ← Main WhatsApp bot handler
│   ├── sms.js                   ← Alert delivery (WhatsApp only)
│   ├── intentDetector.js        ← Intent classification
│   ├── riskScoring.js           ← Risk calculation (Person 2)
│   ├── roadCutoff.js            ← Road prediction (Person 2)
│   └── safeRoute.js             ← Route finder (Person 2)
├── routes/
│   ├── webhook.js               ← Meta webhook receiver
│   ├── register.js              ← Registration API
│   ├── risk.js                  ← Risk query API
│   ├── roads.js                 ← Road status API
│   └── ...others
├── models/
│   ├── RegisteredPhone.js       ← User registration (UPDATED)
│   ├── RiskScore.js             ← Risk storage
│   ├── RoadSegment.js           ← Road data
│   └── ...others
├── jobs/
│   └── cron.js                  ← Scheduled tasks (UPDATED)
├── locales/
│   ├── ur.js                    ← Urdu messages
│   ├── pa.js                    ← Punjabi messages
│   └── sd.js                    ← Sindhi messages
├── index.js                     ← Express app entry
└── config/
    └── db.js                    ← MongoDB config

.env                             ← Create this with your credentials
.env.example                     ← Template (CREATED)
package.json                     ← Dependencies


═════════════════════════════════════════════════════════════════════════════
SUPPORT & DEBUGGING
═════════════════════════════════════════════════════════════════════════════

Issue: WhatsApp messages not sending
→ Check: WHATSAPP_TOKEN is valid in .env
→ Check: WHATSAPP_PHONE_NUMBER_ID is correct
→ Check: Recipient phone number format: +92XXXXXXXXXX
→ Check: Meta webhook is verified (200 response)

Issue: Alerts not triggering
→ Check: Risk scores being calculated (watch console)
→ Check: Registered phones exist in database
→ Check: Risk score >= 80 for red tier
→ Monitor: cron.js logs

Issue: Registration not working
→ Check: MongoDB connection
→ Check: RegisteredPhone model has delivery_method field
→ Check: Phone number format validation

Issue: Intent not detected
→ Check: keywords match user text
→ Run: node server/services/intentDetector.js to test

═════════════════════════════════════════════════════════════════════════════
PERSON 3 DELIVERABLES SUMMARY
═════════════════════════════════════════════════════════════════════════════

✅ WhatsApp integration (Meta Business Account)
✅ Incoming message handling (text, location, images)
✅ Intent-based bot responses
✅ User registration system
✅ Field agent updates
✅ Alert delivery (WhatsApp only)
✅ Risk-based triggering
✅ Safe route recommendations
✅ Relief camp location sharing
✅ Ground report collection
✅ API endpoints for testing
✅ Database models
✅ Cron job integration
✅ Multi-language support (Urdu/Punjabi/Sindhi)

═════════════════════════════════════════════════════════════════════════════
