const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/explore', optionalAuth, async (req, res) => {
  try {
    const { category, difficulty, muscleGroup, search, page = 1, limit = 20, sort = 'popular' } = req.query;
    const query = { isPublic: true };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (muscleGroup) query.muscleGroups = muscleGroup;
    if (search) query.$text = { $search: search };

    let sortObj = {};
    if (sort === 'popular') sortObj = { timesUsed: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };
    else if (sort === 'rating') sortObj = { rating: -1 };

    const workouts = await Workout.find(query)
      .populate('creator', 'username displayName avatar')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Workout.countDocuments(query);
    res.json({ workouts, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/mine', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ creator: req.user._id }).sort({ createdAt: -1 });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id)
      .populate('creator', 'username displayName avatar stats')
      .populate('exercises.exercise');
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    if (!workout.isPublic && workout.creator._id.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(workout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const workout = await Workout.create({ ...req.body, creator: req.user._id });
    res.status(201).json(workout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, creator: req.user._id });
    if (!workout) return res.status(404).json({ message: 'Workout not found or unauthorized' });
    Object.assign(workout, req.body);
    await workout.save();
    res.json(workout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Workout.findOneAndDelete({ _id: req.params.id, creator: req.user._id });
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/save', auth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    const user = req.user;
    const saved = user.savedWorkouts.includes(workout._id);

    if (saved) {
      user.savedWorkouts.pull(workout._id);
      workout.savedBy.pull(user._id);
    } else {
      user.savedWorkouts.push(workout._id);
      workout.savedBy.push(user._id);
    }

    await user.save();
    await workout.save();
    res.json({ saved: !saved, savedCount: workout.savedBy.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating } = req.body;
    const workout = await Workout.findById(req.params.id);
    const newRating = (workout.rating * workout.ratingCount + rating) / (workout.ratingCount + 1);
    workout.rating = newRating;
    workout.ratingCount += 1;
    await workout.save();
    res.json({ rating: workout.rating });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
