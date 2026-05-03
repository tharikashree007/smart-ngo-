const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format']
  },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'ngo', 'donor'], required: true },
  organization: {
    type: String,
    required: function () { return this.role === 'ngo'; },
    trim: true
  },
  verified: { type: Boolean, default: false },
  approvedByAdmin: { type: Boolean, default: false },
  flagged: { type: Boolean, default: false },
  transparencyRating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ email: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
