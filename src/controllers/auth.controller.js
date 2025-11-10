const bcrypt = require('bcrypt');
const jwtLib = require('../utils/jwt');
const User = require('../models/user.model');
const { generateOTP } = require('../utils/otp');
const { sendOTPEmail } = require('../utils/mailer');
const redisClient = require('../config/redis');
const jwt = require('jsonwebtoken');

const OTP_TTL_SEC = 10 * 60; // 10 minutes
const REFRESH_TTL_SEC = 60 * 60 * 24 * Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);

async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'name,email,password required' });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, isVerified: false });

    const otp = generateOTP(6);
    const key = `otp:signup:${email}`;
    await redisClient.setEx(key, OTP_TTL_SEC, otp);

    await sendOTPEmail(email, otp, 'verification').catch(err => {
      console.warn('Mail send failed:', err?.message || err);
    });

    return res.status(201).json({ message: 'User created. OTP sent to email' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'email and otp required' });

    const key = `otp:signup:${email}`;
    const stored = await redisClient.get(key);
    if (!stored) return res.status(400).json({ message: 'OTP expired or not found' });
    if (stored !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isVerified = true;
    await user.save();

    await redisClient.del(key);
    return res.json({ message: 'User verified successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ message: 'Account not verified' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = jwtLib.signAccessToken({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = jwtLib.signRefreshToken({ sub: user.id });

    const rKey = `refresh:${user.id}`;
    await redisClient.setEx(rKey, REFRESH_TTL_SEC, refreshToken);

    return res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const userId = payload.sub;
    const rKey = `refresh:${userId}`;
    const stored = await redisClient.get(rKey);
    if (!stored || stored !== refreshToken) return res.status(401).json({ message: 'Invalid refresh token' });

    const newAccess = jwtLib.signAccessToken({ sub: userId });
    const newRefresh = jwtLib.signRefreshToken({ sub: userId });
    await redisClient.setEx(rKey, REFRESH_TTL_SEC, newRefresh);

    return res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}

async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const userId = payload.sub;
    const rKey = `refresh:${userId}`;
    await redisClient.del(rKey);
    return res.json({ message: 'Logged out' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: 'Invalid token' });
  }
}

module.exports = { signup, verifyOtp, login, refresh, logout };
