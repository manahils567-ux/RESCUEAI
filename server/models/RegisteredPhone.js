const mongoose = require('mongoose');

const RegisteredPhoneSchema = new mongoose.Schema({
  phone:            { type: String, required: true, unique: true },
  union_council:    { type: String, required: true },
  district:         { type: String, required: true },
  language:         { type: String, enum: ['ur', 'pa', 'sd'], default: 'ur' },
  delivery_method:  { type: String, enum: ['whatsapp', 'sms', 'both'], default: 'whatsapp' },
  active:           { type: Boolean, default: true },
  registered_at:    { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('RegisteredPhone', RegisteredPhoneSchema);
