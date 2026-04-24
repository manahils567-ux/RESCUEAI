const mongoose = require('mongoose');

const RiverGaugeSchema = new mongoose.Schema({
  station:             { type: String, required: true },
  river:               { type: String },
  level_cm:            { type: Number, required: true },
  danger_cm:           { type: Number },
  rise_rate_cm_per_hr: { type: Number, default: 0 },
  read_at:             { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('RiverGauge', RiverGaugeSchema);