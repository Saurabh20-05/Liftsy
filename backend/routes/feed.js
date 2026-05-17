const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const posts = await Post.find({ visibility: 'public' })
      .populate('author', 'username displayName avatar stats')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
