const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workout: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout' },
    workoutName: { type: String, required: true },

    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number }, // seconds
    status: { type: String, enum: ['active', 'paused', 'completed', 'abandoned'], default: 'active' },

    exercises: [
      {
        exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
        exerciseName: String,
        sets: [
          {
            setNumber: Number,
            reps: Number,
            weight: Number,
            duration: Number,
            distance: Number,
            rpe: Number,
            restTime: Number,
            notes: String,
            isWarmup: Boolean,
            isDropset: Boolean,
            completed: { type: Boolean, default: false },
            completedAt: Date,
            personalRecord: { type: Boolean, default: false },
          },
        ],
        notes: String,
        order: Number,
        completed: { type: Boolean, default: false },
      },
    ],

    notes: { type: String, maxlength: 1000 },
    mood: { type: String, enum: ['terrible', 'bad', 'ok', 'good', 'great', 'amazing'] },
    energyLevel: { type: Number, min: 1, max: 10 },
    bodyWeight: { type: Number },

    stats: {
      totalVolume: { type: Number, default: 0 }, // total kg lifted
      totalReps: { type: Number, default: 0 },
      totalSets: { type: Number, default: 0 },
      totalExercises: { type: Number, default: 0 },
      personalRecords: [{ exerciseName: String, metric: String, value: Number, previous: Number }],
      caloriesBurned: { type: Number },
      avgHeartRate: { type: Number },
      maxHeartRate: { type: Number },
    },

    location: { type: String },
    weather: { type: String },

    sharedAsPost: { type: Boolean, default: false },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },

    aiAnalysis: {
      summary: String,
      improvements: [String],
      nextWorkoutSuggestion: String,
      muscleRecovery: { type: Map, of: Number },
      generatedAt: Date,
    },
  },
  { timestamps: true }
);

sessionSchema.index({ user: 1, startTime: -1 });
sessionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Session', sessionSchema);
