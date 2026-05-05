╔════════════════════════════════════════════════════════════════════════════╗
║                   TESTING GUIDE - Complete Instructions                     ║
║                     RESCUEAI/BACHAO Project                                 ║
╚════════════════════════════════════════════════════════════════════════════╝

📂 FOLDER STRUCTURE & WHERE TO RUN COMMANDS
═══════════════════════════════════════════════════════════════════════════════

Your project is located at:
C:\Users\Hamza\Desktop\RESCUEAI\

This is the ROOT FOLDER where you run ALL commands.

Directory structure:
C:\Users\Hamza\Desktop\RESCUEAI\
├── package.json              ← npm config (what tells npm what to run)
├── server/                   ← All backend code
├── frontend/                 ← Frontend (Person 4)
└── documentation files


🚀 STEP 1: OPEN TERMINAL IN PROJECT ROOT
═══════════════════════════════════════════════════════════════════════════════

METHOD 1: Using Command Prompt
─────────────────────────────

1. Press: Windows Key + R
2. Type: cmd
3. Press: Enter
4. In cmd window, type:
   cd C:\Users\Hamza\Desktop\RESCUEAI
5. Press: Enter

Expected output:
C:\Users\Hamza\Desktop\RESCUEAI>

✓ You are now in the correct folder


METHOD 2: Using PowerShell (Recommended)
─────────────────────────────────────────

1. Press: Windows Key
2. Type: powershell
3. Click: "Windows PowerShell"
4. Type:
   cd C:\Users\Hamza\Desktop\RESCUEAI
5. Press: Enter

Expected output:
PS C:\Users\Hamza\Desktop\RESCUEAI>

✓ You are now in the correct folder


METHOD 3: Using VS Code Terminal (Easiest)
──────────────────────────────────────────

1. Open VS Code
2. File → Open Folder
3. Navigate to: C:\Users\Hamza\Desktop\RESCUEAI
4. Click: Select Folder
5. Press: Ctrl + ` (backtick, below Esc key)

Expected output:
Terminal appears at bottom of VS Code
Shows: C:\Users\Hamza\Desktop\RESCUEAI>

✓ You are now in the correct folder


═══════════════════════════════════════════════════════════════════════════════
📋 TESTING CHECKLIST (Complete Flow)
═══════════════════════════════════════════════════════════════════════════════

TEST 1: Check Node.js Installation
───────────────────────────────────

Run in terminal:
node --version

Expected output:
v16.x.x or higher (e.g., v16.14.0)

If you get "node is not recognized":
→ You need to install Node.js
→ Download from: https://nodejs.org
→ Install it, then restart terminal


TEST 2: Check npm Installation
───────────────────────────────

Run in terminal:
npm --version

Expected output:
8.x.x or higher (e.g., 8.5.0)

If error:
→ npm comes with Node.js, so reinstall Node.js


TEST 3: Install Project Dependencies
─────────────────────────────────────

Run in terminal:
npm install

What happens:
• npm reads package.json
• Downloads all required packages
• Creates node_modules folder
• Takes 2-5 minutes

Expected output (at end):
added XXX packages in X.XXs

✓ If you see this, dependencies are installed successfully


TEST 4: Test Intent Detector (No credentials needed)
─────────────────────────────────────────────────────

This tests the bot's ability to understand user intents.

Run in terminal:
node server/services/intentDetector.js

Expected output:
============================================================
Intent Detector Test
============================================================

"N-55 khula hai?" → ROAD_STATUS
"Rajanpur road band hai?" → ROAD_STATUS
"camp kahan hai?" → CAMP_LOCATION
"selaab ka khatra hai?" → FLOOD_RISK
"N-55 band karo" → AGENT_UPDATE
"hello there" → UNKNOWN
"register karo please" → REGISTER
"mujhe alert dena" → REGISTER
"water aa gaya" → REPORT

============================================================

✓ If you see this, intent detection is working


TEST 5: Test Alert Message Builder (No credentials needed)
───────────────────────────────────────────────────────────

This tests alert message generation.

Run in terminal:
node server/services/sms.js

Expected output:
============================================================
Testing WhatsApp Alert System
============================================================

📝 Alert Message that would be sent:

────────────────────────────────────────────────────────────
🚨 *BACHAO FLOOD ALERT* 🚨

Rajanpur City میں سیلاب کا شدید خطرہ ہے!

📍 *محفوظ سڑک:* N-55 تاونسہ بائی پاس
🏕️ *رِلیف کیمپ:* راجن پور حکومتی اسکول کیمپ
⏱️ *خطرہ درجہ:* 🔴 شدید

فوری نکلیں! مدد: 1122
────────────────────────────────────────────────────────────

✅ WhatsApp Alert System Ready

Note: Alerts are sent ONLY via WhatsApp in this implementation
Twilio SMS support has been removed (not available in Pakistan)

✓ If you see this, alert system is working


TEST 6: START THE SERVER
────────────────────────

This starts the backend server.

Run in terminal:
npm run dev

Expected output (takes 5-10 seconds):
╔════════════════════════════════════════════════════════╗
✅ Server running on port 5000
📡 Webhook ready at /webhook
📊 Reports ready at /api/reports
🏕️ Relief camps ready at /api/relief-camps
🌊 River gauges ready at /api/river-gauges
⚠️ Risk ready at /api/risk
🛣️ Roads ready at /api/roads
🌊 Floods ready at /api/floods
╚════════════════════════════════════════════════════════╝

✓ If you see this, server is running successfully

DO NOT CLOSE THIS WINDOW! Keep it open while testing.


TEST 7: TEST SERVER IS RUNNING (Open NEW terminal while server runs)
─────────────────────────────────────────────────────────────────

IMPORTANT: Open a NEW terminal/CMD window. Keep the server terminal open.

Steps:
1. Open another command prompt / PowerShell / VS Code terminal
2. Make sure you're still in: C:\Users\Hamza\Desktop\RESCUEAI
3. Run:

curl http://localhost:5000/api/health

Expected output:
{"status":"ok","ts":"2026-05-05T..."}

✓ If you see this, server is responding


TEST 8: TEST REGISTRATION API
──────────────────────────────

This creates a test user in the system.

In the NEW terminal (keep server running):

curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"+923001234567\",\"union_council\":\"Rajanpur City\",\"district\":\"Rajanpur\",\"language\":\"ur\"}"

(Or paste this as one line:)
curl -X POST http://localhost:5000/api/register -H "Content-Type: application/json" -d "{\"phone\":\"+923001234567\",\"union_council\":\"Rajanpur City\",\"district\":\"Rajanpur\",\"language\":\"ur\"}"

Expected output:
{
  "message": "Phone registered successfully for WhatsApp alerts",
  "phone": "+923001234567",
  "union_council": "Rajanpur City",
  "district": "Rajanpur",
  "delivery_method": "whatsapp",
  "language": "ur"
}

✓ If you see this, registration is working


TEST 9: TEST REGISTRATION STATUS CHECK
───────────────────────────────────────

This checks if a phone is registered.

In the NEW terminal:

curl http://localhost:5000/api/register/status/%2B923001234567

Expected output:
{
  "registered": true,
  "phone": "+923001234567",
  "union_council": "Rajanpur City",
  "district": "Rajanpur",
  "language": "ur",
  "active": true,
  "delivery_method": "whatsapp"
}

✓ If you see this, status check is working


TEST 10: TEST UNREGISTRATION
──────────────────────────────

This removes a user from the system.

In the NEW terminal:

curl -X DELETE http://localhost:5000/api/register/%2B923001234567

Expected output:
{"message":"Unregistered successfully"}

✓ If you see this, unregistration is working


TEST 11: TEST RISK SCORE API
──────────────────────────────

This gets flood risk data (requires database, but will show empty if DB not connected).

In the NEW terminal:

curl http://localhost:5000/api/risk

Expected output (if DB connected):
[
  {
    "union_council": "Rajanpur City",
    "district": "Rajanpur",
    "score": 45,
    "tier": "green",
    "calculated_at": "2026-05-05T..."
  }
]

Or (if DB not connected):
[]

✓ Both are fine - API is responding


TEST 12: TEST ROAD STATUS API
───────────────────────────────

This gets road status data.

In the NEW terminal:

curl "http://localhost:5000/api/roads?status=green"

Expected output:
[]
(Empty array means no roads in database yet, which is normal for testing)

✓ API is responding correctly


═══════════════════════════════════════════════════════════════════════════════
✅ FULL TESTING SUMMARY
═══════════════════════════════════════════════════════════════════════════════

All tests passing? Perfect! Here's what works:

[✓] Intent detector - Can understand user messages
[✓] Alert builder - Can format Urdu flood alerts
[✓] Server - Running on port 5000
[✓] Health check - Server is responsive
[✓] Registration - Users can register
[✓] Status check - Can query registration status
[✓] Unregistration - Users can be removed
[✓] APIs - All endpoints respond

Your system is READY!


═══════════════════════════════════════════════════════════════════════════════
🔧 TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

PROBLEM: "npm is not recognized"
SOLUTION: Reinstall Node.js from https://nodejs.org


PROBLEM: "Port 5000 is already in use"
SOLUTION: Either:
  a) Kill process on port 5000:
     netstat -ano | findstr :5000
     taskkill /PID <PID> /F
  b) Use different port:
     npm run dev (then look at output, will show different port)


PROBLEM: "curl is not recognized" (Windows)
SOLUTION: Use PowerShell instead of Command Prompt, or:
  • Install curl from: https://curl.se/download.html
  • OR use this alternative:
    
    # Using PowerShell:
    Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method Get


PROBLEM: Server won't start
SOLUTION:
  1. Check node_modules exists:
     dir node_modules
  2. If not, run: npm install
  3. Check errors in server output
  4. Make sure you're in C:\Users\Hamza\Desktop\RESCUEAI


PROBLEM: Getting connection errors
SOLUTION:
  • Make sure server is still running in first terminal
  • Don't close the server terminal
  • Tests go in DIFFERENT terminal
  • Keep both terminals open


═══════════════════════════════════════════════════════════════════════════════
📱 NEXT: SETUP META WHATSAPP (When ready for real testing)
═══════════════════════════════════════════════════════════════════════════════

To actually send WhatsApp messages, you need:

1. Meta Business Account
   → https://business.facebook.com

2. WhatsApp Business Account setup
   → Get WHATSAPP_PHONE_NUMBER_ID
   → Get WHATSAPP_TOKEN

3. Create .env file:
   cp .env.example .env

4. Edit .env with your credentials:
   MONGO_URI=mongodb://localhost:27017/bachao
   WHATSAPP_PHONE_NUMBER_ID=your_number_id
   WHATSAPP_TOKEN=your_token
   WHATSAPP_VERIFY_TOKEN=any_random_string

5. Restart server:
   npm run dev

Then WhatsApp integration will work!


═══════════════════════════════════════════════════════════════════════════════
🎯 QUICK COMMANDS REFERENCE
═══════════════════════════════════════════════════════════════════════════════

# Terminal 1 (Server):
cd C:\Users\Hamza\Desktop\RESCUEAI
npm install                          # Only once, first time
npm run dev                          # Keeps running, don't close

# Terminal 2 (Testing):
cd C:\Users\Hamza\Desktop\RESCUEAI

# Test intent detector:
node server/services/intentDetector.js

# Test alert builder:
node server/services/sms.js

# Check server health:
curl http://localhost:5000/api/health

# Register a user:
curl -X POST http://localhost:5000/api/register -H "Content-Type: application/json" -d "{\"phone\":\"+923001234567\",\"union_council\":\"Rajanpur City\",\"district\":\"Rajanpur\"}"

# Check registration:
curl http://localhost:5000/api/register/status/%2B923001234567

# Unregister:
curl -X DELETE http://localhost:5000/api/register/%2B923001234567

# Get risk scores:
curl http://localhost:5000/api/risk

# Get roads:
curl http://localhost:5000/api/roads


═══════════════════════════════════════════════════════════════════════════════
✅ YOU'RE READY TO TEST!
═══════════════════════════════════════════════════════════════════════════════

Follow the steps above and everything should work perfectly.

If you have any issues, check the TROUBLESHOOTING section above.

Good luck! 🚀
═══════════════════════════════════════════════════════════════════════════════
