const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('displayName').optional().trim().isLength({ max: 50 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { username, email, password, displayName, fitnessLevel, goals } = req.body;

      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        const field = existingUser.email === email ? 'email' : 'username';
        return res.status(400).json({ message: `${field} already in use` });
      }

      const user = await User.create({
        username,
        email,
        password,
        displayName: displayName || username,
        fitnessLevel: fitnessLevel || 'beginner',
        goals: goals || [],
      });

      const token = generateToken(user._id);
      res.status(201).json({ token, user: user.toPublicJSON() });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.post('/login', [body('email').isEmail(), body('password').exists()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.json({ token, user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('following', 'username displayName avatar')
    .populate('followers', 'username displayName avatar');
  res.json(user);
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { displayName, bio, fitnessLevel, goals, bodyWeight, height, dateOfBirth, gender, preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { displayName, bio, fitnessLevel, goals, bodyWeight, height, dateOfBirth, gender, preferences } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
