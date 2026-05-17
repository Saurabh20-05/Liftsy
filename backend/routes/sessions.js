const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const User = require('../models/User');
const Post = require('../models/Post');
const { auth } = require('../middleware/auth');

router.post('/start', auth, async (req, res) => {
  try {
    const { workoutId, workoutName, exercises } = req.body;

    await Session.updateMany(
      { user: req.user._id, status: 'active' },
      { status: 'abandoned', endTime: new Date() }
    );

    const session = await Session.create({
      user: req.user._id,
      workout: workoutId,
      workoutName,
      startTime: new Date(),
      exercises: exercises || [],
      status: 'active',
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/active', auth, async (req, res) => {
  try {
    const session = await Session.findOne({ user: req.user._id, status: 'active' })
      .populate('exercises.exercise');
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    Object.assign(session, req.body);
    await session.save();

    req.app.get('io').to(`user:${req.user._id}`).emit('sessionUpdate', session);

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/complete', auth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const endTime = new Date();
    const duration = Math.floor((endTime - session.startTime) / 1000);

    let totalVolume = 0, totalReps = 0, totalSets = 0;
    const prs = [];

    session.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.completed) {
          totalSets++;
          totalReps += set.reps || 0;
          totalVolume += (set.weight || 0) * (set.reps || 0);
          if (set.personalRecord) {
            prs.push({ exerciseName: ex.exerciseName, value: `${set.weight}kg x ${set.reps}` });
          }
        }
      });
    });

    session.endTime = endTime;
    session.duration = duration;
    session.status = 'completed';
    session.stats = {
      totalVolume,
      totalReps,
      totalSets,
      totalExercises: session.exercises.length,
      personalRecords: prs,
    };

    if (req.body.mood) session.mood = req.body.mood;
    if (req.body.energyLevel) session.energyLevel = req.body.energyLevel;
    if (req.body.notes) session.notes = req.body.notes;
    if (req.body.bodyWeight) session.bodyWeight = req.body.bodyWeight;

    await session.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'stats.totalWorkouts': 1,
        'stats.totalVolume': totalVolume,
        'stats.totalSessions': 1,
      },
      $set: { 'stats.lastWorkoutDate': endTime },
    });

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/:id/share', auth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const { content, visibility } = req.body;

    const post = await Post.create({
      author: req.user._id,
      type: 'workout_log',
      content: content || '',
      session: session._id,
      sessionSummary: {
        workoutName: session.workoutName,
        duration: session.duration,
        totalVolume: session.stats.totalVolume,
        totalSets: session.stats.totalSets,
        totalReps: session.stats.totalReps,
        exercises: session.exercises.map((e) => ({
          name: e.exerciseName,
          sets: e.sets.filter((s) => s.completed).length,
          topSet: e.sets.reduce((top, s) => (!top || (s.weight || 0) > (top.weight || 0) ? s : top), null),
        })),
        prs: session.stats.personalRecords,
        mood: session.mood,
        caloriesBurned: session.stats.caloriesBurned,
      },
      visibility: visibility || 'public',
    });

    session.sharedAsPost = true;
    session.post = post._id;
    await session.save();

    const populatedPost = await Post.findById(post._id).populate('author', 'username displayName avatar');
    res.json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const sessions = await Session.find({ user: req.user._id, status: 'completed' })
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Session.countDocuments({ user: req.user._id, status: 'completed' });
    res.json({ sessions, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('exercises.exercise');
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const since = new Date(Date.now() - Number(period) * 24 * 60 * 60 * 1000);

    const sessions = await Session.find({
      user: req.user._id,
      status: 'completed',
      startTime: { $gte: since },
    });

    const volumeByDay = {};
    sessions.forEach((s) => {
      const day = s.startTime.toISOString().split('T')[0];
      volumeByDay[day] = (volumeByDay[day] || 0) + (s.stats.totalVolume || 0);
    });

    const exerciseFrequency = {};
    sessions.forEach((s) => {
      s.exercises.forEach((e) => {
        exerciseFrequency[e.exerciseName] = (exerciseFrequency[e.exerciseName] || 0) + 1;
      });
    });

    res.json({
      totalSessions: sessions.length,
      totalVolume: sessions.reduce((sum, s) => sum + (s.stats.totalVolume || 0), 0),
      avgDuration: sessions.length ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length : 0,
      volumeByDay,
      exerciseFrequency,
      sessions: sessions.map((s) => ({
        date: s.startTime,
        duration: s.duration,
        volume: s.stats.totalVolume,
        mood: s.mood,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
