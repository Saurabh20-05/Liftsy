const mongoose = require('mongoose');



const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    alternativeNames: [String],
    category: {
      type: String,
      enum: ['compound', 'isolation', 'cardio', 'flexibility', 'balance', 'plyometric', 'strongman'],
    },

    muscleGroup: {
      primary: [{ type: String }],
      secondary: [{ type: String }],
    },


    equipment: [{ type: String }],
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    mechanics: { type: String, enum: ['push', 'pull', 'squat', 'hinge', 'carry', 'rotation', 'isometric', 'cardio'] },
    instructions: [{ type: String }],
    tips: [{ type: String }],
    commonMistakes: [{ type: String }],
    videoUrl: { type: String },
    imageUrl: { type: String },
    isCustom: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    force: { type: String, enum: ['push', 'pull', 'static', 'both'] },
    type: { type: String, enum: ['reps', 'duration', 'distance', 'reps_weight'], default: 'reps_weight' },
  },


  { timestamps: true }
);



exerciseSchema.index({ name: 'text', alternativeNames: 'text' });
exerciseSchema.index({ 'muscleGroup.primary': 1 });
exerciseSchema.index({ equipment: 1 });

module.exports = mongoose.model('Exercise', exerciseSchema);
