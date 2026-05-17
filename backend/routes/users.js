const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    const query = { 'preferences.isPublic': true };
    if (q && q.trim()) {
      query.$or = [
        { username: { $regex: q.trim(), $options: 'i' } },
        { displayName: { $regex: q.trim(), $options: 'i' } },
      ];
    }
    const users = await User.find(query)
      .select('username displayName avatar bio stats fitnessLevel followers following')
      .limit(Number(limit))
      .sort({ 'stats.totalWorkouts': -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -notifications')
      .populate('followers', 'username displayName avatar')
      .populate('following', 'username displayName avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: "Can't follow yourself" });

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    const isFollowing = req.user.following.map(String).includes(String(target._id));

    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: target._id } });
      await User.findByIdAndUpdate(target._id, { $pull: { followers: req.user._id } });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: target._id } });
      await User.findByIdAndUpdate(target._id, { $addToSet: { followers: req.user._id } });
      await User.findByIdAndUpdate(target._id, {
        $push: {
          notifications: {
            type: 'follow',
            from: req.user._id,
            message: `${req.user.displayName} started following you`,
          },
        },
      });
      req.app.get('io').to(`user:${target._id}`).emit('notification', {
        type: 'follow',
        from: { _id: req.user._id, displayName: req.user.displayName, avatar: req.user.avatar },
        message: `${req.user.displayName} started following you`,
      });
    }

    res.json({ following: !isFollowing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('notifications')
      .populate('notifications.from', 'username displayName avatar');
    res.json(user.notifications.sort((a, b) => b.createdAt - a.createdAt).slice(0, 50));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/me/notifications/read', auth, async (req, res) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $set: { 'notifications.$[].read': true } });
    res.json({ message: 'Marked all as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/leaderboard/volume', optionalAuth, async (req, res) => {
  try {
    const users = await User.find({ 'preferences.isPublic': true })
      .select('username displayName avatar stats fitnessLevel followers')
      .sort({ 'stats.totalVolume': -1 })
      .limit(50);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
