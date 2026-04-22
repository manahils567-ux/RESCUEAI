const mongoose = require('mongoose');

const GroundReportSchema = new mongoose.Schema({
  reporter_phone: { type: String, required: true },
  lat:            { type: Number, required: true },
  lng:            { type: Number, required: true },
  photo_url:      { type: String },
  message_text:   { type: String },
  district:       { type: String },
  verified:       { type: Boolean, default: false },
  severity:       { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  reported_at:    { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('GroundReport', GroundReportSchema);