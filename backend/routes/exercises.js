const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { muscle, equipment, category, difficulty, search, limit = 50 } = req.query;
    const query = {};
    if (muscle) query['muscleGroup.primary'] = muscle;
    if (equipment) query.equipment = equipment;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.$text = { $search: search };

    const exercises = await Exercise.find(query).limit(Number(limit)).sort({ name: 1 });
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found' });
    res.json(exercise);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const exercise = await Exercise.create({
      ...req.body,
      isCustom: true,
      createdBy: req.user._id,
    });
    res.status(201).json(exercise);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/meta/muscles', async (_req, res) => {
  res.json([
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'core', 'quads', 'hamstrings', 'glutes', 'calves', 'full body', 'cardio',
  ]);
});

router.get('/meta/equipment', async (_req, res) => {
  res.json([
    'barbell', 'dumbbell', 'kettlebell', 'cable', 'machine', 'bodyweight',
    'resistance band', 'pull-up bar', 'bench', 'trx', 'smith machine', 'ez bar',
  ]);
});

module.exports = router;
