const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  setNumber: { type: Number, required: true },
  reps: { type: Number },
  weight: { type: Number, default: 0 },
  duration: { type: Number },
  distance: { type: Number },
  restTime: { type: Number, default: 60 },
  rpe: { type: Number, min: 1, max: 10 },
  notes: { type: String },
  isWarmup: { type: Boolean, default: false },
  isDropset: { type: Boolean, default: false },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

const exerciseEntrySchema = new mongoose.Schema({
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  exerciseName: { type: String },
  sets: [setSchema],
  notes: { type: String },
  order: { type: Number, default: 0 },
  supersetWith: { type: mongoose.Schema.Types.ObjectId },
  personalRecord: { type: Boolean, default: false },
  prDetails: { type: String },
});

const workoutSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    category: {
      type: String,
      enum: ['strength', 'cardio', 'hiit', 'yoga', 'pilates', 'crossfit', 'powerlifting', 'bodybuilding', 'calisthenics', 'sports', 'rehabilitation', 'custom'],
      default: 'custom',
    },
    muscleGroups: [{ type: String }],
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'elite'], default: 'intermediate' },
    estimatedDuration: { type: Number },
    exercises: [exerciseEntrySchema],
    tags: [{ type: String }],
    isTemplate: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
    coverImage: { type: String },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    timesUsed: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    aiGenerated: { type: Boolean, default: false },
    aiPrompt: { type: String },
  },
  { timestamps: true }
);

workoutSchema.index({ creator: 1, createdAt: -1 });
workoutSchema.index({ isPublic: 1, category: 1 });
workoutSchema.index({ tags: 1 });

module.exports = mongoose.model('Workout', workoutSchema);
