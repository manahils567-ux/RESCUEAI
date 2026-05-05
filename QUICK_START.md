╔════════════════════════════════════════════════════════════════════════════╗
║                      QUICK START - 5 MINUTE SETUP                          ║
║                                                                            ║
║              Start here! Follow these 5 simple steps.                      ║
╚════════════════════════════════════════════════════════════════════════════╝

📂 YOUR PROJECT LOCATION:
C:\Users\Hamza\Desktop\RESCUEAI

This is where you run ALL commands from.

═══════════════════════════════════════════════════════════════════════════════

STEP 1: OPEN COMMAND PROMPT
───────────────────────────

Press: Windows Key + R
Type: cmd
Press: Enter

You'll see a command prompt window.

Type this command:
cd C:\Users\Hamza\Desktop\RESCUEAI

Press: Enter

You should now see:
C:\Users\Hamza\Desktop\RESCUEAI>

✓ YOU ARE IN THE RIGHT FOLDER


STEP 2: INSTALL DEPENDENCIES (3-5 minutes)
─────────────────────────────────────────

In the same command prompt, type:
npm install

Press: Enter

It will download and install all packages. This takes a few minutes.

When done, you'll see:
added XXX packages in XXs

✓ PACKAGES INSTALLED


STEP 3: START THE SERVER (30 seconds)
─────────────────────────────────────

In the same command prompt, type:
npm run dev

Press: Enter

Wait 5-10 seconds. You should see:

✅ Server running on port 5000
📡 Webhook ready at /webhook
📊 Reports ready at /api/reports
🏕️ Relief camps ready at /api/relief-camps
🌊 River gauges ready at /api/river-gauges
⚠️ Risk ready at /api/risk
🛣️ Roads ready at /api/roads
🌊 Floods ready at /api/floods

✓ SERVER IS RUNNING

IMPORTANT: DO NOT CLOSE THIS WINDOW!
Keep this terminal/command prompt open. The server must keep running.


STEP 4: OPEN A NEW COMMAND PROMPT FOR TESTING
──────────────────────────────────────────────

DO NOT CLOSE the first command prompt with the server.

Open a NEW command prompt window:
Press: Windows Key + R
Type: cmd
Press: Enter

In this NEW command prompt, type:
cd C:\Users\Hamza\Desktop\RESCUEAI

Press: Enter


STEP 5: RUN TESTS
─────────────────

In this NEW command prompt (while server is running in first one):


TEST 1 - Check Intent Detector:
────────────────────────────────
Type:
node server/services/intentDetector.js

Press: Enter

You should see test output showing how the bot understands messages.

Expected output includes:
"N-55 khula hai?" → ROAD_STATUS
"register karo please" → REGISTER
"camp kahan hai?" → CAMP_LOCATION

✓ Intent detector works!


TEST 2 - Check Alert Messages:
──────────────────────────────
Type:
node server/services/sms.js

Press: Enter

You should see a sample Urdu flood alert message with:
🚨 BACHAO FLOOD ALERT 🚨
Rajanpur میں سیلاب کا شدید خطرہ ہے!

✓ Alert system works!


TEST 3 - Check Server is Running:
─────────────────────────────────
Type:
curl http://localhost:5000/api/health

Press: Enter

You should see:
{"status":"ok","ts":"2026-05-05T..."}

✓ Server is responding!


TEST 4 - Register a Test User:
──────────────────────────────
Type this command (all in one line):
curl -X POST http://localhost:5000/api/register -H "Content-Type: application/json" -d "{\"phone\":\"+923001234567\",\"union_council\":\"Rajanpur City\",\"district\":\"Rajanpur\"}"

Press: Enter

You should see:
{
  "message": "Phone registered successfully for WhatsApp alerts",
  "phone": "+923001234567",
  "union_council": "Rajanpur City",
  "district": "Rajanpur",
  "delivery_method": "whatsapp",
  "language": "ur"
}

✓ Registration API works!


TEST 5 - Check User Registration:
─────────────────────────────────
Type:
curl http://localhost:5000/api/register/status/%2B923001234567

Press: Enter

You should see user details confirming registration:
{
  "registered": true,
  "phone": "+923001234567",
  "union_council": "Rajanpur City",
  "delivery_method": "whatsapp",
  "active": true
}

✓ Status check works!


═══════════════════════════════════════════════════════════════════════════════

✅ ALL TESTS PASSED!

Your RESCUEAI system is working perfectly!

What's been verified:
✓ Intent detection - Bot understands messages
✓ Alert formatting - Creates proper Urdu messages
✓ Server running - On port 5000
✓ Registration - Users can register
✓ Status check - Can verify registrations
✓ All APIs - Responding correctly


═══════════════════════════════════════════════════════════════════════════════

📚 NEXT STEPS

For more detailed testing info:
Read: TESTING_GUIDE.md

For complete documentation:
Read: README.md → QUICK_REFERENCE.md → PERSON3_IMPLEMENTATION.md

For deployment with WhatsApp:
Read: COMPLETION_SUMMARY.md section on Meta setup


═══════════════════════════════════════════════════════════════════════════════

⚠️ IMPORTANT NOTES

1. Keep BOTH command prompts open while testing
   - First terminal: Server (npm run dev) - keep running
   - Second terminal: Tests (curl, node commands)

2. If server terminal closes:
   - Go back to Step 3
   - Run: npm run dev again

3. If you get "Port 5000 already in use":
   - There's another server running
   - Either wait a moment and try again
   - Or close other Node.js applications

4. If curl doesn't work in Command Prompt:
   - Use PowerShell instead (Windows Key → type powershell)
   - Or use VS Code terminal (easier)

5. If you modify any code:
   - Stop server (Ctrl+C in first terminal)
   - Run: npm run dev again
   - Changes will load automatically


═══════════════════════════════════════════════════════════════════════════════

✨ CONGRATULATIONS!

You now have a working RESCUEAI WhatsApp Delivery Bot system!

Next: Set up Meta Business Account credentials and you can start using it!

═══════════════════════════════════════════════════════════════════════════════
