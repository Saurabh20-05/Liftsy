const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['workout_log', 'progress', 'motivation', 'question', 'pr', 'text'], default: 'text' },
    content: { type: String, maxlength: 2000 },
    images: [{ type: String }],
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    workout: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout' },



    sessionSummary: {
      workoutName: String,
      duration: Number,
      totalVolume: Number,
      totalSets: Number,
      totalReps: Number,
      exercises: [{ name: String, sets: Number, topSet: String }],
      prs: [{ exercise: String, value: String }],
      mood: String,
      caloriesBurned: Number,
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        type: { type: String, enum: ['fire', 'strong', 'heart', 'wow', 'clap', 'beast'] },
      },
    ],
    
    comments: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, required: true, maxlength: 500 },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        replies: [
          {
            author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            content: { type: String, maxlength: 500 },
            likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            createdAt: { type: Date, default: Date.now },
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],

    tags: [{ type: String }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    visibility: { type: String, enum: ['public', 'followers', 'private'], default: 'public' },
    isPinned: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });

module.exports = mongoose.model('Post', postSchema);
