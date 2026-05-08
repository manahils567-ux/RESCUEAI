const mongoose = require('mongoose');
const RiverGaugeSchema = new mongoose.Schema({
  station:             { type: String, required: true },
  river:               { type: String },
  level_cs:            { type: Number },   // discharge in cusecs (Cs)
  danger_cs:           { type: Number },   // danger threshold in cusecs (Cs)
  rise_rate_cs_per_hr: { type: Number, default: 0 },
  lat:                 { type: Number },
  lng:                 { type: Number },
  read_at:             { type: Date, default: Date.now }
}, { timestamps: true });
module.exports = mongoose.model('RiverGauge', RiverGaugeSchema);