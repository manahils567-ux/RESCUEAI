const mongoose = require('mongoose');

const RiskScoreSchema = new mongoose.Schema({
  union_council:   { type: String, required: true },
  district:        { type: String, required: true },
  province:        { type: String, default: 'Punjab' },
  score:           { type: Number, min: 0, max: 100, required: true },
  tier:            { type: String, enum: ['green', 'amber', 'red'], required: true },
  satellite_score: { type: Number },
  gauge_score:     { type: Number },
  ndma_score:      { type: Number },
  is_historical:   { type: Boolean, default: false },
  historical_date: { type: Date },
  calculated_at:   { type: Date, default: Date.now }
}, { timestamps: true });

RiskScoreSchema.index({ district: 1, calculated_at: -1 });

module.exports = mongoose.model('RiskScore', RiskScoreSchema);