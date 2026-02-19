const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: "" }, 
  resetOtp: String,
  resetOtpExpires: Date
}, { timestamps: true });

// Change this block in models/User.js
userSchema.pre('save', async function() {
  // 1. Only run if password was modified
  if (!this.isModified('password')) return;

  try {
    // 2. Hash the password
    this.password = await bcrypt.hash(this.password, 10);
    
    // 3. Clear confirmPassword if it exists in the schema
    this.confirmPassword = undefined; 
  } catch (error) {
    throw new Error(error);
  }
  // Notice: NO next() call here
});

module.exports = mongoose.model('User', userSchema);