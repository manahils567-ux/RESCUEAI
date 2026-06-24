RESCUEAI - Final Round Improvement Plan

Purpose
-------
This document lists prioritized, actionable improvements to prepare RESCUEAI for the final hackathon round and for production readiness. Each item contains: problem statement, rationale, files/areas to change, step-by-step implementation guidance, tests/acceptance criteria, recommended owner/ETA, and risk/notes.

How to use
----------
- Assign owners and ETAs for P0/P1 items first.
- Implement in small PRs with CI/tests.
- Use the Demo Checklist to rehearse the final presentation.

PRIORITY KEY
------------
- P0 (Critical): must-have for reliability/security and correct alerts.
- P1 (Important): greatly improves robustness/user experience and scoring.
- P2 (Nice-to-have): polish, performance, and demo features.

P0 — Security, Data Integrity, & Alert Safety
-------------------------------------------
1) Secure env/secrets & remove sensitive keys from client
   - Problem: NEXT_PUBLIC_GEMINI_API_KEY referenced in frontend; client-stored keys leak.
   - Rationale: leaking LLM keys or WhatsApp tokens is critical.
   - Files: frontend/components/AIChatbot.js, .env.example, server/index.js
   - Steps:
     a. Remove any NEXT_PUBLIC_* LLM keys from client. Replace with a server proxy endpoint /api/ai that accepts authenticated requests and calls Gemini using server-side env key (GEMINI_API_KEY).
     b. Add server route server/routes/aiProxy.js validating auth and rate-limiting.
     c. Update frontend to POST user prompt to /api/ai (no secret exposure).
     d. Ensure .env is in .gitignore and document required vars in .env.example.
   - Tests/Acceptance:
     • Verified no NEXT_PUBLIC_GEMINI_* in built frontend bundle.
     • /api/ai returns 401 without auth and proxies correctly with valid token.
   - Owner: Backend + Frontend dev. ETA: 1-2 days.

2) Webhook verification, signature checking, input validation & rate limiting
   - Problem: Webhook GET currently returns 403 test; no signature verification for POST.
   - Rationale: Prevent spoofed messages and spam causing false alerts.
   - Files: server/routes/webhook.js, server/services/intentDetector.js
   - Steps:
     a. Implement signature verification (Meta HMAC or verify header) and reject invalid signatures with 401.
     b. Validate incoming payload schema and types; reject invalid requests early.
     c. Add per-phone rate limiting (e.g., in-memory token bucket or Redis) and global rate limit for webhook.
     d. Log webhook signatures and suspicious IPs.
   - Tests:
     • Replay webhook with invalid signature → 401.
     • High volume of synthetic messages → rate limit returns 429.
   - Owner: Backend. ETA: 1 day.

3) Alert sending: make it queued, idempotent, and retryable
   - Problem: Immediate synchronous sends may fail & duplicate. triggerSMSAlerts called after insertMany.
   - Rationale: Prevent duplicate messages, respect rate limits, handle failures.
   - Files: server/services/sms.js, server/services/whatsapp.js, server/services/riskScoring.js
   - Steps:
     a. Add a message queue (BullMQ or simple Mongo queue with processing worker). Enqueue alerts rather than sending inline.
     b. Add idempotency key per alert (e.g., riskScoreId + phone) to avoid duplicate sends.
     c. Implement retries with exponential backoff and dead-letter queue for permanent failures.
     d. Ensure workers respect the 200ms-per-send throttle; batch sends where allowed.
   - Tests:
     • Simulate transient WhatsApp API failure → worker retries and succeeds.
     • Duplicate scoring job should not send duplicate messages.
   - Owner: Backend. ETA: 1-2 days.

4) Database: prevent unbounded insertMany growth & use upserts
   - Problem: riskScoring currently insertMany scores every run -> duplicate/historic pollution.
   - Rationale: DB growth, query inefficiency, inaccurate latest queries.
   - Files: server/services/riskScoring.js, server/models/RiskScore.js
   - Steps:
     a. Replace insertMany with upsert (findOneAndUpdate with {upsert: true}) keyed on {union_council, district, calculated_at?} or store only latest per run and move historic to separate collection flagged is_historical.
     b. Add TTL index for historical rows if older than needed, or compress weekly snapshots.
     c. Add compound index on {district, union_council, calculated_at} and ensure queries use indexes.
   - Tests:
     • After running scoring twice, DB contains one latest record per union_council for current timestamp or clearly versioned rows.
   - Owner: Backend/DB. ETA: 1 day.

P1 — Algorithm correctness, data validation, metrics
--------------------------------------------------
5) Align documentation with code & standardize risk formula
   - Problem: README shows different weights than code; gauges units unclear.
   - Rationale: Team alignment; avoid surprise thresholds.
   - Files: README.md, server/services/riskScoring.js, TESTING_GUIDE.md
   - Steps:
     a. Choose canonical formula and units (document in README & PERSON2 notes).
     b. Add unit tests for computeSatScore, computeGaugeScore, computeNDMAScore, computeReportScore with synthetic data.
     c. Add validation to ensure gauge rise units (cm/hr) and normalize incoming gauge inputs.
   - Tests:
     • Unit tests pass and demonstrate expected outputs for edge cases.
   - Owner: ML/Algorithm. ETA: 1 day.

6) Smoothing & anomaly detection for gauge rise rates
   - Problem: Single noisy spikes may trigger score 100.
   - Rationale: Reduce false positives.
   - Files: server/models/RiverGauge.js, server/services/riskScoring.js
   - Steps:
     a. Store last N gauge readings and compute moving average / median.
     b. Flag anomalous spikes and require sustained rise over X readings to escalate.
   - Tests:
     • Synthetic spike followed by normal → score not immediately 100.
   - Owner: ML/Alg. ETA: 1-2 days.

7) More robust satellite flood matching
   - Problem: computeSatScore uses a simple coordinate box match.
   - Rationale: Increase spatial accuracy and avoid false positives.
   - Files: server/services/riskScoring.js, server/models/FloodEvent.js
   - Steps:
     a. Use turf.js (or geospatial queries in MongoDB) to compute intersect/within buffer (e.g., 2km radius) against union council centroid/boundary if available.
     b. If possible, precompute UC polygons and use geospatial indexes in Mongo.
   - Tests:
     • Satellite event at edge of UC → correct matching behavior.
   - Owner: Data infra/ML. ETA: 2 days.

P1 — Observability & Ops
------------------------
8) Logging, monitoring, and alerting
   - Problem: No structured logs or health metrics.
   - Rationale: Needed for real incidents and debugging.
   - Files: server/index.js, jobs/cron.js, server/services/*
   - Steps:
     a. Add structured logging (pino/winston) with correlation IDs.
     b. Add health checks and metrics (Prometheus / prom-client) for queue length, job failures, risk calculations.
     c. Integrate Sentry for error tracking.
   - Tests:
     • Simulate crash → Sentry error visible; metrics update.
   - Owner: DevOps. ETA: 1-2 days.

9) Add tests & CI
   - Problem: No unit/integration tests or CI.
   - Rationale: Ensures changes don't regress; good for judges.
   - Files: package.json, server/services/*, frontend/components/*
   - Steps:
     a. Add Jest for backend unit tests; add a few core tests for scoring functions and webhook validation.
     b. Add GitHub Actions workflow: run lint, tests, build frontend, and optionally start server for integration tests.
   - Tests:
     • CI passes on PRs; coverage threshold defined (e.g., 70%).
   - Owner: Any dev. ETA: 2 days.

P1 — Frontend & UX
------------------
10) Frontend demo polish & localization flows
   - Problem: AIChatbot is referencing client-side API keys and uses text prompts; overall look needs polishing for demo.
   - Rationale: Clear, secure demo; multi-language UX should be smooth.
   - Files: frontend/components/AIChatbot.js, frontend/app/page.js
   - Steps:
     a. Remove client-side secrets (see P0).
     b. Improve default messages in Urdu/Punjabi, add loading states and error messages consistent with server responses.
     c. Add demo-mode toggle to load seeded historical data (replay mode) for offline demos.
   - Tests:
     • Demo-mode reproduces a scripted high-risk alert scenario reproducibly.
   - Owner: Frontend. ETA: 1 day.

P2 — Performance and Deployment
-------------------------------
11) Dockerize & add one-click deploy instructions
   - Problem: Deployment steps are manual; Procfile exists but containerization eases judges' reproducibility.
   - Files: Dockerfile, docker-compose.yml, Procfile, README.md
   - Steps:
     a. Create Dockerfile for server and frontend (or combined if simple). Add docker-compose for local demo with Mongo.
     b. Add quick deploy steps to README and a Heroku/Render/Vercel plan if demo requires.
   - Tests:
     • docker-compose up launches services and demo script runs
   - Owner: DevOps. ETA: 1-2 days.

12) Caching and API performance
   - Problem: Repeated risk queries could be heavy.
   - Rationale: Faster UI and reduced DB costs.
   - Files: server/routes/risk.js, server/services/riskScoring.js
   - Steps:
     a. Cache recent risk results in memory (LRU) or Redis for 1-5 minutes.
     b. Add ETag/last-modified headers for GET endpoints to reduce frontend fetch load.
   - Tests:  • Load test shows reduced DB queries.
   - Owner: Backend. ETA: 1 day.

P2 — Data & Privacy
-------------------
13) Data minimization & user privacy
   - Problem: Ground reports may include PII and location data.
   - Rationale: Minimize sensitive storage and comply with privacy principles.
   - Files: server/models/GroundReport.js, server/routes/reports.js
   - Steps:
     a. Store minimal metadata; encrypt or hash phone numbers in DB if storing long term.
     b. Add retention policy for ground reports older than X months.
   - Tests:  • Confirm PII removal/retention implemented.
   - Owner: Backend. ETA: 1 day.

P2 — Demo & Rehearsal
---------------------
14) Demo scenario scripts and replay data
   - Problem: Judges want reproducible demos showing impact.
   - Rationale: A rehearsed scenario wins presentations.
   - Files: server/scripts/loadHistorical.js, frontend/lib/mockData.js, server/routes/replay.js
   - Steps:
     a. Create 2-3 scripted scenarios (rapid gauge rise, satellite flood, ground reports) with timestamps.
     b. Build a replay UI that steps through events and shows alert path (frontend app/replay-2022).
     c. Add a README section: "How to run the final demo" with exact commands and expected outputs.
   - Tests:  • Replay produces same alerts and UI changes each run.
   - Owner: Frontend + Data. ETA: 1-2 days.

Acceptance & Demo Checklist
---------------------------
- [ ] Server runs with docker-compose and connects to seeded Mongo.
- [ ] Webhook verifies signature and rejects invalid hits.
- [ ] Risk scoring unit tests pass; DB contains upserted latest scores.
- [ ] Alerts sent via queued worker with idempotency (no duplicates).
- [ ] Frontend demo-mode reproduces scenario and AI chatbot uses server proxy.
- [ ] Monitoring metrics visible (at least: queue length, job failure count, last run timestamp).

Suggested Timeline (3-7 days sprint)
-----------------------------------
Day 1: P0 items (env, webhook verification, DB upsert), begin alert queue
Day 2: Finish alert queue, idempotency; start LLM proxy & frontend changes
Day 3: Add tests + CI; logging & basic metrics
Day 4: Demo scenarios, frontend polish, caching
Day 5: Dockerize, run final rehearsal, buffer for fixes

Who does what (example)
-----------------------
- Backend lead: webhook verification, queueing, upserts, DB indexes
- ML/Alg: scoring formula alignment, smoothing, sat matching improvements
- Frontend dev: AI proxy integration, demo mode, localization polish
- DevOps: Docker, CI, monitoring, metrics
- QA: tests, demo rehearsals

Appendix: Small code suggestions
-------------------------------
- Replace RiskScore.insertMany(scores) with an upsert loop:
  for (const s of scores) {
    await RiskScore.findOneAndUpdate({ union_council: s.union_council, district: s.district, calculated_at: { $gte: /* current run range */ } }, s, { upsert: true });
  }
- Use geospatial queries for satellite matching (create 2dsphere index on FloodEvent.geometry).
- Use a worker like BullMQ (Redis) or a small Mongo-based queue if Redis is not available.

Notes & Risks
-------------
- Adding external services (Redis, Sentry) may require additional infra; for hackathon, use in-memory / fallback with clear trade-offs (document them).
- Be careful with message throttling (WhatsApp Business API limits). Use test mode and explain to judges.

Contact & Runbook for Final Demo
--------------------------------
- On demo day: ensure you have valid WhatsApp token (or test token) and Mongo DB running; run docker-compose and execute scenario script: 
  node server/scripts/loadDemoScenario.js --scenario=rapid-rise
- Keep a local copy of expected logs and sample phone numbers for the judges.

If you want, can convert this into a presentation slide deck and split tasks into GitHub issues with checklists. 

-- END --
