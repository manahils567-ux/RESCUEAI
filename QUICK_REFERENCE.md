╔════════════════════════════════════════════════════════════════════════════╗
║               BACHAO — QUICK REFERENCE GUIDE (Person 3)                     ║
║                      WhatsApp Delivery Bot System                           ║
╚════════════════════════════════════════════════════════════════════════════╝

🚀 QUICK START (5 MINUTES)
══════════════════════════════════════════════════════════════════════════════

1. Setup .env
   ```
   cp .env.example .env
   # Edit with your WhatsApp credentials
   ```

2. Install & Start
   ```
   npm install
   npm run dev
   ```

3. Test Locally
   ```
   curl http://localhost:5000/api/health
   # Response: {"status":"ok"}
   ```


📱 WHATSAPP USER FLOWS
══════════════════════════════════════════════════════════════════════════════

FLOW 1: User Registration
─────────────────────────
User: "register"
Bot:  [Asks for district]
User: "Rajanpur"
Bot:  "✅ Registered for Rajanpur alerts"
→ User added to RegisteredPhone collection


FLOW 2: Road Status Query
────────────────────────
User: "N-55 khula hai?"
Bot:  "N-55 ابھی کھلی ہے۔ محفوظ سفر کریں۔"
→ Queries RoadSegment, returns status


FLOW 3: Relief Camp Finder
──────────────────────────
User: "camp kahan hai?"
Bot:  "📍 قریب ترین کیمپ: راجن پور حکومتی اسکول"
→ Finds nearest active relief camp


FLOW 4: Automatic Flood Alert
──────────────────────────────
[Every 30 mins, if risk >= 80]
Bot: "🚨 BACHAO FLOOD ALERT 🚨
      Rajanpur میں سیلاب کا شدید خطرہ ہے!
      📍 محفوظ سڑک: N-55 تاونسہ بائی پاس
      🏕️ رِلیف کیمپ: راجن پور حکومتی اسکول کیمپ
      فوری نکلیں! مدد: 1122"
→ Delivered to all registered users in Rajanpur


🔌 API ENDPOINTS
══════════════════════════════════════════════════════════════════════════════

REGISTER USER:
POST /api/register
Body: {
  "phone": "+923001234567",
  "union_council": "Rajanpur City",
  "district": "Rajanpur",
  "language": "ur"
}
Response: 201 Created + registration details


CHECK STATUS:
GET /api/register/status/%2B923001234567
Response: {
  "registered": true,
  "union_council": "Rajanpur City",
  "delivery_method": "whatsapp",
  "active": true
}


UNREGISTER:
DELETE /api/register/%2B923001234567
Response: {"message": "Unregistered successfully"}


GET RISK SCORES:
GET /api/risk?district=Rajanpur
Response: [
  {
    "union_council": "Rajanpur City",
    "score": 87,
    "tier": "red",
    "calculated_at": "2026-05-05T10:30:00Z"
  }
]


GET ROAD STATUS:
GET /api/roads?status=red&district=Rajanpur
Response: [
  {
    "name": "N-55 Taunsa",
    "status": "red",
    "hours_to_cutoff": 2.5,
    "elevation_m": 125.5
  }
]


🗂️ KEY FILES & LOCATIONS
══════════════════════════════════════════════════════════════════════════════

WhatsApp Service:
  server/services/whatsapp.js
  → handleIncomingMessage()
  → getRoadStatusReply()
  → saveGroundReport()
  → sendText()

Alert Service:
  server/services/sms.js
  → triggerWhatsAppAlerts()
  → buildAlertMessage()
  → registerPhone()

Intent Detection:
  server/services/intentDetector.js
  → detectIntent()

Webhook Handler:
  server/routes/webhook.js
  → GET /webhook (verify)
  → POST /webhook (messages)

Registration API:
  server/routes/register.js
  → POST /api/register
  → GET /api/register/status
  → DELETE /api/register

Database Model:
  server/models/RegisteredPhone.js
  → Stores users: phone, district, language, delivery_method

Cron Jobs:
  server/jobs/cron.js
  → Runs risk scoring every 30 mins
  → Triggers alerts if score >= 80

Messages:
  server/locales/ur.js (Urdu)
  server/locales/pa.js (Punjabi)
  server/locales/sd.js (Sindhi)


📊 INTENT TYPES
══════════════════════════════════════════════════════════════════════════════

INTENT                KEYWORDS (SAMPLE)              BOT RESPONSE
──────────────────────────────────────────────────────────────────────────────
ROAD_STATUS           "N-55", "road", "khula",      Road status from DB
                      "band", "sadak"

AGENT_UPDATE          "update", "band karo",        Updates road status
                      "kholo"                       (field worker)

CAMP_LOCATION         "camp", "kahan", "shelter"    Nearest relief camp

FLOOD_RISK            "selaab", "khatra",           Link to dashboard
                      "danger"                       + emergency number

REGISTER              "register", "alert me",       Multi-step registration
                      "subscribe"

REPORT                "report", "water", "help"     Save to GroundReport


⚙️ CRON JOBS SCHEDULE
══════════════════════════════════════════════════════════════════════════════

Every 30 Minutes:
  □ calculateAllRiskScores()
    • Fetches floods, gauges, reports
    • Calculates 0-100 risk per district
    • Triggers alerts if score >= 80
    
  □ updateAllRoadStatuses()
    • Gets latest river gauge readings
    • Calculates hours-to-inundation per road
    • Updates status: green/amber/red

Every 3 Hours:
  □ fetchFIRMSData()
    • Gets NASA satellite flood data
    
Every 30 Minutes:
  □ scrapePMDGauges()
    • Gets Pakistan Met Dept river readings
    
  □ scrapeNDMAAlerts()
    • Gets government flood alerts


🔑 ENVIRONMENT VARIABLES
══════════════════════════════════════════════════════════════════════════════

Required:
  MONGO_URI=mongodb://localhost:27017/bachao
  WHATSAPP_PHONE_NUMBER_ID=123456789012345
  WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxx
  WHATSAPP_VERIFY_TOKEN=any_random_string
  PORT=5000

Optional:
  NODE_ENV=development
  LOG_LEVEL=info


🐛 DEBUGGING TIPS
══════════════════════════════════════════════════════════════════════════════

WhatsApp message not sending?
→ Check: WHATSAPP_TOKEN is valid
→ Check: Recipient phone format: +92XXXXXXXXXX
→ Check: Rate limit (200ms delay added)
→ Log: console shows "✅ Message sent to +92..."

Alerts not triggering?
→ Check: Risk score >= 80 in database
→ Check: Phone registered with active: true
→ Check: Cron job running (watch console)
→ Log: "⚠️ [CRON] Calculating risk scores..."

Intent not detected?
→ Run: node server/services/intentDetector.js
→ Test exact keywords from INTENTS object
→ Check: Case-insensitive matching

Registration not working?
→ Check: MongoDB connected
→ Check: RegisteredPhone model loaded
→ Check: Phone number validation (E.164 format)


🚨 IMPORTANT RULES
══════════════════════════════════════════════════════════════════════════════

1. PAKISTAN COMPLIANCE
   ✓ WhatsApp only (Twilio removed)
   ✓ No Jazz integration (no license)
   ✓ No SMS fallback
   → Any change must respect these constraints

2. MESSAGE DELIVERY
   ✓ 200ms delay between messages (rate limiting)
   ✓ Urdu preferred for local users
   ✓ Always include emergency number: 1122
   ✓ Max message size: 4096 characters (WhatsApp)

3. DATA PRIVACY
   ✓ Only store phone in RegisteredPhone
   ✓ No SMS or email logs with credentials
   ✓ Delete inactive users monthly
   ✓ Encrypt WHATSAPP_TOKEN in production

4. ALERT THRESHOLDS
   ✓ Red tier: Score >= 80 (trigger alert)
   ✓ Amber tier: Score 60-79 (log only)
   ✓ Green tier: Score < 60 (no action)
   → Do NOT change without Person 2 approval


📞 WHO TO CONTACT
══════════════════════════════════════════════════════════════════════════════

Component Issue              → Person
─────────────────────────────────────
Data scrapers/gauges        → Person 1
Risk scoring/algorithms     → Person 2
WhatsApp bot/alerts         → Person 3 (Hamza)
Frontend/dashboard          → Person 4


✅ FINAL CHECKLIST
══════════════════════════════════════════════════════════════════════════════

Before going live:

□ .env file created with all required fields
□ MongoDB database running and connected
□ Meta Business Account set up
□ Webhook URL added to Meta
□ Verify token matches between .env and Meta
□ npm dependencies installed
□ Server starts without errors
□ Test registration API works
□ Intent detector tested locally
□ Alert message format approved
□ Cron jobs scheduling verified
□ Database indexes created
□ Monitoring/logging configured
□ Backups scheduled
□ Emergency rollback plan ready


═══════════════════════════════════════════════════════════════════════════════
Last Updated: May 05, 2026
Maintained by: Hamza (Person 3)
═══════════════════════════════════════════════════════════════════════════════
