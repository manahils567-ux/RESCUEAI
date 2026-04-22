const mongoose = require('mongoose');

const RoadSegmentSchema = new mongoose.Schema({
  osm_id:               { type: String, required: true, unique: true },
  name:                 { type: String },
  road_type:            { type: String, enum: ['motorway', 'primary', 'secondary', 'tertiary', 'residential', 'track'] },
  geometry:             { type: { type: String, default: 'LineString' }, coordinates: { type: [[Number]], required: true } },
  district:             { type: String },
  elevation_m:          { type: Number, required: true },
  nearest_river:        { type: String },
  distance_to_river_km: { type: Number },
  status:               { type: String, enum: ['green', 'amber', 'red'], default: 'green' },
  hours_to_cutoff:      { type: Number, default: null },
  last_calculated:      { type: Date, default: Date.now }
}, { timestamps: true });

RoadSegmentSchema.index({ district: 1 });
RoadSegmentSchema.index({ status: 1 });

module.exports = mongoose.model('RoadSegment', RoadSegmentSchema);