# 🚨 BACHAO — Flood Intelligence System

> Real-time flood prediction and evacuation guidance for Pakistan via WhatsApp

**BACHAO** is an AI-powered flood intelligence platform that combines satellite imagery, real-time river gauge data, and citizen reports to predict flood risk and provide actionable evacuation routes via WhatsApp.

## 🎯 Mission

Save lives by delivering early, localized flood warnings and safe evacuation routes to vulnerable communities in Punjab, Pakistan.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SATELLITE DATA                            │
│         (NASA FIRMS, Sentinel-1 SAR, Google Earth)          │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                   DATA SCRAPERS                              │
│    • NASA FIRMS flood detection (every 3 hours)             │
│    • PMD river gauges (every 30 mins)                       │
│    • NDMA official alerts (every 30 mins)                   │
│    • Ground reports via WhatsApp                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                   AI ALGORITHMS                              │
│    • District risk scoring (4-signal weighted formula)       │
│    • Road cut-off prediction (hours-to-inundation)          │
│    • Safe route pathfinding + camp locator                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│              WHATSAPP DELIVERY BOT                           │
│    • Real-time alerts (when risk >= 80)                     │
│    • Road status queries ("Is N-55 open?")                  │
│    • Relief camp finder ("Where is nearest camp?")          │
│    • User registration & agent updates                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │  9 Million Citizens  │
        │   (via WhatsApp)     │
        └─────────────────────┘
```

---

## 👥 Team Roles & Status

| Role | Owner | Status | Deliverables |
|------|-------|--------|--------------|
| **Person 1** | Data Infrastructure | ✅ Complete | Scrapers, Data Loading, OSM Import |
| **Person 2** | AI & Algorithms | ✅ Complete | Risk Scoring, Road Cut-off, Safe Routes |
| **Person 3** | Delivery Bots | ✅ Complete | WhatsApp Bot, Intent Detection, Alerts |
| **Person 4** | Frontend Demo | ✅ Complete | Dashboard, Map, Timeline Replay |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/BACHAO.git
cd BACHAO
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your:
# - MONGO_URI (MongoDB connection)
# - WHATSAPP_PHONE_NUMBER_ID (from Meta Business)
# - WHATSAPP_TOKEN (from Meta Business)
# - WHATSAPP_VERIFY_TOKEN (any random string)
```

### 3. Start Server

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 4. Test Webhook

```bash
# Should return 403 (not a valid Meta request)
curl http://localhost:5000/webhook
```

---

## 📱 WhatsApp Bot Features

### User Registration

User texts "register" → Bot asks for district → User gets alerts

```
User: "register"
Bot: "رجسٹریشن کے لیے اپنا ضلع لکھیں۔ مثال: Rajanpur"
User: "Rajanpur"
Bot: "✅ Rajanpur کے لیے رجسٹر ہو گئے!"
```

### Road Status Query

```
User: "N-55 khula hai?"
Bot: "N-55 ابھی کھلی ہے۔ محفوظ سفر کریں۔"
```

### Location Sharing

User sends location → Saved as ground report → Increases risk score

### Flood Alert (Automatic)

When risk hits red (score >= 80):

```
🚨 BACHAO FLOOD ALERT 🚨

Rajanpur میں سیلاب کا شدید خطرہ ہے!

📍 محفوظ سڑک: N-55 تاونسہ بائی پاس
🏕️ رِلیف کیمپ: راجن پور حکومتی اسکول کیمپ

فوری نکلیں! مدد: 1122
```

---

## 🗄️ Database Schema

### RegisteredPhone
```javascript
{
  phone: "+923001234567",
  union_council: "Rajanpur City",
  district: "Rajanpur",
  language: "ur",
  delivery_method: "whatsapp",
  active: true,
  registered_at: Date
}
```

### RiskScore
```javascript
{
  union_council: "Rajanpur City",
  district: "Rajanpur",
  score: 87,  // 0-100
  tier: "red", // "red" (80+), "amber" (60-80), "green" (<60)
  satellite_score: 100,
  gauge_score: 80,
  report_score: 60,
  calculated_at: Date
}
```

### RoadSegment
```javascript
{
  name: "N-55 Taunsa Road",
  osm_id: 123456,
  status: "amber", // green, amber, red
  hours_to_cutoff: 4.5,
  elevation_m: 125.5,
  distance_to_river_km: 8,
  district: "DG Khan",
  geometry: { type: "LineString", coordinates: [...] }
}
```

---

## 🔧 API Endpoints

### User Management

```
POST   /api/register                    - Register for alerts
GET    /api/register/status/:phone      - Check registration
DELETE /api/register/:phone             - Unregister
```

### Data Queries

```
GET    /api/risk?district=Rajanpur           - Get risk scores
GET    /api/roads?status=red                 - Get road status
GET    /api/floods                           - Get satellite floods
GET    /api/river-gauges                     - Get gauge readings
GET    /api/relief-camps                     - Get camp locations
GET    /api/reports                          - Get ground reports
```

### Webhook (Meta WhatsApp)

```
GET    /webhook          - Verify webhook (Meta calls this once)
POST   /webhook          - Receive messages (Meta calls continuously)
```

---

## 📊 Cron Jobs (Automatic)

| Job | Schedule | What it Does |
|-----|----------|-------------|
| NASA FIRMS | Every 3 hours | Fetch satellite flood data |
| PMD Gauges | Every 30 mins | Scrape river gauge readings |
| NDMA Alerts | Every 30 mins | Scrape government alerts |
| Risk Scoring | Every 30 mins | Calculate 0-100 risk per district |
| Road Status | Every 30 mins | Predict hours-to-inundation |

---

## 🔑 Risk Scoring Formula

```
Risk Score = 
  (Satellite Floods)    × 0.40 +
  (Gauge Rise Rate)     × 0.45 +
  (Ground Reports)      × 0.15
```

**Thresholds:**
- 🔴 **Red**: Score >= 80 (trigger alerts)
- 🟠 **Amber**: Score 60-79 (warning)
- 🟢 **Green**: Score < 60 (safe)

---

## 🛣️ Road Cut-off Algorithm

```
Hours to Inundation = 
  (Road Elevation - Current Water Level) 
  ÷ 
  (Rise Rate × Proximity Factor)

Proximity Factor:
  - 1.0 if < 2km from river
  - 0.6 if 2-10km from river
  - 0.2 if > 10km from river
```

---

## 📍 Safe Route Finder

Algorithm:
1. Find all green (safe) roads
2. Sort by elevation (highest first)
3. Find nearest green road to user location
4. Find nearest active relief camp
5. Return both in alert message

---

## 🌍 Supported Districts

| Province | Districts |
|----------|-----------|
| Punjab | Rajanpur, DG Khan, Muzaffargarh, Layyah, Multan, Bahawalpur, Rahim Yar Khan, Mianwali, Bhakkar |

(Expandable to other provinces)

---

## 🗣️ Multi-Language Support

- 🇵🇰 **Urdu** (اردو) - Primary
- 🇵🇰 **Punjabi** (پنجابی) - Regional
- 🇵🇰 **Sindhi** (سندھی) - Regional

---

## 📋 Important Implementation Notes

### ✅ What's Included

- ✅ WhatsApp integration (no SMS)
- ✅ Intent-based bot
- ✅ Risk scoring
- ✅ Road cut-off prediction
- ✅ Relief camp finder
- ✅ Ground report collection
- ✅ Cron job scheduling
- ✅ Multi-language Urdu/Punjabi/Sindhi

### ❌ Explicitly Excluded

- ❌ Twilio SMS (not available in Pakistan)
- ❌ Jazz mobile operator integration (requires driving licence)
- ❌ Facebook Messenger
- ❌ Telegram
- ❌ Email alerts

---

## 🧪 Testing

### Test Intent Detector
```bash
node server/services/intentDetector.js
```

### Test Alert System
```bash
node server/services/sms.js
```

### Test Registration
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"+923001234567","union_council":"Rajanpur City","district":"Rajanpur"}'
```

---

## 📚 Documentation

- `PERSON3_IMPLEMENTATION.md` - Detailed bot implementation guide
- `CONTRACTS.md` - API contract definitions
- `.env.example` - Environment variables template

---

## 🔐 Security Checklist

- [ ] Verify `.env` is in `.gitignore`
- [ ] Use strong WHATSAPP_VERIFY_TOKEN
- [ ] Validate phone numbers (E.164 format)
- [ ] Rate limit WhatsApp messages (200ms between sends)
- [ ] Log webhook signatures (production)
- [ ] Use HTTPS for webhook URL
- [ ] Rotate WHATSAPP_TOKEN monthly
- [ ] Monitor database for unusual access

---

## 📞 Emergency Contact

In a real flood event, users receive message:
```
🆘 مدد کے لیے: 1122
```

This is the official Pakistan Disaster Management emergency hotline.

---

## 📈 Monitoring & Logs

```bash
# Watch server logs
npm run dev

# Expected output:
✅ Server running on port 5000
📡 Webhook ready at /webhook
⏰ All cron jobs scheduled and running
📅 Schedule Summary:
   • NASA FIRMS: Every 3 hours
   • PMD Gauges: Every 30 minutes
   • NDMA Alerts: Every 30 minutes
   • Risk Scores: Every 30 minutes
   • Road Status: Every 30 minutes
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| WhatsApp messages not sending | Check WHATSAPP_TOKEN validity |
| Alerts not triggering | Verify risk score >= 80 |
| Webhook not receiving messages | Ensure WHATSAPP_VERIFY_TOKEN matches |
| Database errors | Check MONGO_URI connection |
| Intent not detected | Test with exact keywords |

---

## 📄 License

ISC

---

## 🙏 Acknowledgments

- **NASA FIRMS** - Satellite flood detection
- **Pakistan Meteorological Department** - River gauge data
- **NDMA** - Official flood alerts
- **Meta/Facebook** - WhatsApp Business API
- **OpenStreetMap** - Road network data

---

**Built with ❤️ for Pakistan's flood survivors**

*Last Updated: May 2026*
