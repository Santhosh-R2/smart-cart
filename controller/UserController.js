const User = require('../models/User');
const mailer = require('../utils/mailer');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, profileImage } = req.body;

    if (password !== confirmPassword) return res.status(400).json({ message: "Passwords match fail" });

    const check = await User.findOne({ $or: [{ email }, { phone }] });
    if (check) return res.status(400).json({ message: "Email or Phone already exists" });

    const user = await User.create({ name, email, phone, password, profileImage });
    res.status(201).json({ message: "Registration Successful", userId: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.viewUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetOtp -resetOtpExpires');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, profileImage, email } = req.body;
    const userId = req.params.id;

    const duplicateCheck = await User.findOne({
      _id: { $ne: userId }, 
      $or: [{ email }, { phone }]
    });

    if (duplicateCheck) {
      const field = duplicateCheck.email === email ? "Email" : "Phone number";
      return res.status(400).json({ message: `${field} is already in use by another account.` });
    }

    const user = await User.findByIdAndUpdate(
      userId, 
      { name, phone, profileImage, email }, 
      { new: true, runValidators: true }
    ).select('-password -resetOtp -resetOtpExpires');

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile Updated Successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await mailer.sendOtpEmail(user.email, otp);
    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ 
      email, 
      resetOtp: otp, 
      resetOtpExpires: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // 'identifier' can be email or phone

    if (!identifier || !password) {
      return res.status(400).json({ message: "Please provide email/phone and password" });
    }

    // 1. Find user by email OR phone
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid Email/Phone or Password" });
    }

    // 2. Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Email/Phone or Password" });
    }

    // 3. Success (Excluding sensitive data)
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.resetOtp;
    delete userResponse.resetOtpExpires;

    res.status(200).json({
      message: "Login Successful",
      user: userResponse
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};