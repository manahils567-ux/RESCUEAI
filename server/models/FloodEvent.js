const mongoose = require('mongoose');

const FloodEventSchema = new mongoose.Schema({
  source:         { type: String, enum: ['NASA_FIRMS', 'SENTINEL_SAR', 'UNOSAT_HISTORICAL'], required: true },
  satellite:      { type: String, enum: ['MODIS', 'VIIRS', 'SENTINEL1'], default: 'MODIS' },
  geometry:       { type: { type: String, default: 'Polygon' }, coordinates: { type: [[[Number]]], required: true } },
  district:       { type: String },
  province:       { type: String, default: 'Punjab' },
  confidence:     { type: Number, min: 0, max: 1, default: 0.8 },
  area_km2:       { type: Number },
  is_historical:  { type: Boolean, default: false },
  historical_date:{ type: Date },
  fetched_at:     { type: Date, default: Date.now }
}, { timestamps: true });

FloodEventSchema.index({ fetched_at: -1 });
FloodEventSchema.index({ district: 1 });

module.exports = mongoose.model('FloodEvent', FloodEventSchema);