const mongoose = require('mongoose');

const ReliefCampSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  district:      { type: String, required: true },
  union_council: { type: String },
  lat:           { type: Number, required: true },
  lng:           { type: Number, required: true },
  capacity:      { type: Number },
  active:        { type: Boolean, default: true },
  source:        { type: String, default: 'NDMA' }
}, { timestamps: true });

module.exports = mongoose.model('ReliefCamp', ReliefCampSchema);