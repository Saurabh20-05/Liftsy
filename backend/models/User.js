const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    displayName: { type: String, trim: true, maxlength: 50 },
    avatar: { type: String, default: '' },
    bio: { type: String, maxlength: 300, default: '' },
    fitnessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'elite'], default: 'beginner' },
    goals: [{ type: String }],
    bodyWeight: { type: Number },
    height: { type: Number },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    stats: {
      totalWorkouts: { type: Number, default: 0 },
      totalVolume: { type: Number, default: 0 },
      totalSessions: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastWorkoutDate: { type: Date },
      personalRecords: { type: Map, of: Number, default: {} },
    },

    preferences: {
      units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
      isPublic: { type: Boolean, default: true },
      notifications: { type: Boolean, default: true },
    },

    badges: [
      {
        name: String,
        icon: String,
        description: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],

    savedWorkouts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout' }],
    notifications: [
      {
        type: { type: String, enum: ['like', 'comment', 'follow', 'pr', 'streak', 'mention'] },
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
      },
    ],

    isVerified: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.notifications;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
