const mongoose = require('mongoose');

const NDMAAlertSchema = new mongoose.Schema({
  district:    { type: String, required: true },
  alert_level: { type: Number, enum: [1, 2, 3], required: true },
  raw_text:    { type: String },
  scraped_at:  { type: Date, default: Date.now }
}, { timestamps: true });

NDMAAlertSchema.index({ district: 1, scraped_at: -1 });

module.exports = mongoose.model('NDMAAlert', NDMAAlertSchema);