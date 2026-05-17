const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Exercise = require('../models/Exercise');

const exercises = [
  { name: 'Bench Press', category: 'compound', muscleGroup: { primary: ['chest'], secondary: ['shoulders', 'triceps'] }, equipment: ['barbell', 'bench'], difficulty: 'intermediate', mechanics: 'push', type: 'reps_weight', instructions: ['Lie flat on bench', 'Grip bar slightly wider than shoulder width', 'Lower bar to chest', 'Press up explosively'], tips: ['Keep feet flat on floor', 'Maintain arch in lower back', 'Tuck elbows 45 degrees'] },
  { name: 'Incline Dumbbell Press', category: 'compound', muscleGroup: { primary: ['chest'], secondary: ['shoulders', 'triceps'] }, equipment: ['dumbbell', 'bench'], difficulty: 'intermediate', mechanics: 'push', type: 'reps_weight', instructions: ['Set bench to 30-45 degrees', 'Press dumbbells up from shoulder level', 'Lower with control'] },
  { name: 'Cable Flye', category: 'isolation', muscleGroup: { primary: ['chest'], secondary: [] }, equipment: ['cable'], difficulty: 'beginner', mechanics: 'push', type: 'reps_weight', instructions: ['Stand between cables', 'Bring handles together in arc motion', 'Squeeze chest at peak'] },
  { name: 'Push-Up', category: 'compound', muscleGroup: { primary: ['chest'], secondary: ['shoulders', 'triceps', 'core'] }, equipment: ['bodyweight'], difficulty: 'beginner', mechanics: 'push', type: 'reps', instructions: ['Start in plank position', 'Lower chest to floor', 'Push back up'] },
  { name: 'Dips', category: 'compound', muscleGroup: { primary: ['chest', 'triceps'], secondary: ['shoulders'] }, equipment: ['bodyweight', 'pull-up bar'], difficulty: 'intermediate', mechanics: 'push', type: 'reps', instructions: ['Grip parallel bars', 'Lower body until elbows at 90deg', 'Press back up'] },


  { name: 'Deadlift', category: 'compound', muscleGroup: { primary: ['back', 'hamstrings', 'glutes'], secondary: ['core', 'forearms', 'quads'] }, equipment: ['barbell'], difficulty: 'advanced', mechanics: 'hinge', type: 'reps_weight', instructions: ['Stand over barbell', 'Hinge at hips, grip bar', 'Drive through heels, extend hips and knees', 'Lower with control'], tips: ['Keep bar close to body', 'Neutral spine throughout', 'Brace core before lifting'], commonMistakes: ['Rounding lower back', 'Bar drifting from body', 'Not engaging lats'] },
  { name: 'Pull-Up', category: 'compound', muscleGroup: { primary: ['back', 'biceps'], secondary: ['shoulders', 'core'] }, equipment: ['pull-up bar', 'bodyweight'], difficulty: 'intermediate', mechanics: 'pull', type: 'reps', instructions: ['Hang from bar with overhand grip', 'Pull chest to bar', 'Lower with control'] },
  { name: 'Barbell Row', category: 'compound', muscleGroup: { primary: ['back'], secondary: ['biceps', 'shoulders'] }, equipment: ['barbell'], difficulty: 'intermediate', mechanics: 'pull', type: 'reps_weight', instructions: ['Hinge forward 45 degrees', 'Pull bar to lower chest', 'Lower with control'] },
  { name: 'Lat Pulldown', category: 'compound', muscleGroup: { primary: ['back', 'biceps'], secondary: ['shoulders'] }, equipment: ['cable', 'machine'], difficulty: 'beginner', mechanics: 'pull', type: 'reps_weight', instructions: ['Grip bar wide', 'Pull to upper chest', 'Control the ascent'] },
  { name: 'Seated Cable Row', category: 'compound', muscleGroup: { primary: ['back'], secondary: ['biceps', 'shoulders'] }, equipment: ['cable'], difficulty: 'beginner', mechanics: 'pull', type: 'reps_weight', instructions: ['Sit upright', 'Pull handle to abdomen', 'Squeeze shoulder blades'] },


  { name: 'Overhead Press', category: 'compound', muscleGroup: { primary: ['shoulders'], secondary: ['triceps', 'core'] }, equipment: ['barbell'], difficulty: 'intermediate', mechanics: 'push', type: 'reps_weight', instructions: ['Clean bar to shoulders', 'Press overhead', 'Lower with control'] },
  { name: 'Dumbbell Lateral Raise', category: 'isolation', muscleGroup: { primary: ['shoulders'], secondary: [] }, equipment: ['dumbbell'], difficulty: 'beginner', mechanics: 'push', type: 'reps_weight', instructions: ['Stand with dumbbells at sides', 'Raise arms to shoulder height', 'Lower slowly'] },
  { name: 'Face Pull', category: 'isolation', muscleGroup: { primary: ['shoulders'], secondary: ['back'] }, equipment: ['cable'], difficulty: 'beginner', mechanics: 'pull', type: 'reps_weight', instructions: ['Set cable at head height', 'Pull rope to face, elbows flared', 'Squeeze rear delts'] },


  { name: 'Barbell Curl', category: 'isolation', muscleGroup: { primary: ['biceps'], secondary: ['forearms'] }, equipment: ['barbell', 'ez bar'], difficulty: 'beginner', mechanics: 'pull', type: 'reps_weight', instructions: ['Stand with barbell', 'Curl to shoulders', 'Lower slowly'] },
  { name: 'Hammer Curl', category: 'isolation', muscleGroup: { primary: ['biceps', 'forearms'], secondary: [] }, equipment: ['dumbbell'], difficulty: 'beginner', mechanics: 'pull', type: 'reps_weight', instructions: ['Neutral grip dumbbells', 'Curl to shoulders', 'Lower slowly'] },
  { name: 'Tricep Pushdown', category: 'isolation', muscleGroup: { primary: ['triceps'], secondary: [] }, equipment: ['cable'], difficulty: 'beginner', mechanics: 'push', type: 'reps_weight', instructions: ['Grip cable attachment', 'Push down until arms extended', 'Slow return'] },
  { name: 'Skull Crusher', category: 'isolation', muscleGroup: { primary: ['triceps'], secondary: [] }, equipment: ['barbell', 'ez bar', 'dumbbell'], difficulty: 'intermediate', mechanics: 'push', type: 'reps_weight', instructions: ['Lie on bench', 'Lower bar to forehead', 'Extend arms'] },


  { name: 'Squat', category: 'compound', muscleGroup: { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'core', 'calves'] }, equipment: ['barbell'], difficulty: 'intermediate', mechanics: 'squat', type: 'reps_weight', instructions: ['Bar on upper traps', 'Feet shoulder width, toes out', 'Squat to parallel or below', 'Drive through heels'], tips: ['Keep chest up', 'Knees track over toes', 'Brace core'], commonMistakes: ['Caving knees', 'Heels rising', 'Forward lean'] },
  { name: 'Romanian Deadlift', category: 'compound', muscleGroup: { primary: ['hamstrings', 'glutes'], secondary: ['back', 'core'] }, equipment: ['barbell', 'dumbbell'], difficulty: 'intermediate', mechanics: 'hinge', type: 'reps_weight', instructions: ['Stand with bar', 'Hinge at hips, slight knee bend', 'Lower until stretch in hamstrings', 'Drive hips forward'] },
  { name: 'Leg Press', category: 'compound', muscleGroup: { primary: ['quads', 'glutes'], secondary: ['hamstrings'] }, equipment: ['machine'], difficulty: 'beginner', mechanics: 'squat', type: 'reps_weight', instructions: ['Seat in machine', 'Place feet shoulder width', 'Lower platform, press back'] },
  { name: 'Leg Curl', category: 'isolation', muscleGroup: { primary: ['hamstrings'], secondary: [] }, equipment: ['machine'], difficulty: 'beginner', mechanics: 'pull', type: 'reps_weight', instructions: ['Lie face down', 'Curl heels to glutes', 'Lower slowly'] },
  { name: 'Bulgarian Split Squat', category: 'compound', muscleGroup: { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'core'] }, equipment: ['dumbbell', 'barbell', 'bodyweight'], difficulty: 'intermediate', mechanics: 'squat', type: 'reps_weight', instructions: ['Rear foot elevated on bench', 'Lower front knee toward floor', 'Drive through front heel'] },
  { name: 'Calf Raise', category: 'isolation', muscleGroup: { primary: ['calves'], secondary: [] }, equipment: ['machine', 'bodyweight', 'barbell'], difficulty: 'beginner', mechanics: 'push', type: 'reps_weight', instructions: ['Stand on edge', 'Rise onto toes', 'Lower below platform level'] },
  { name: 'Hip Thrust', category: 'compound', muscleGroup: { primary: ['glutes'], secondary: ['hamstrings', 'core'] }, equipment: ['barbell', 'dumbbell'], difficulty: 'intermediate', mechanics: 'hinge', type: 'reps_weight', instructions: ['Upper back on bench', 'Bar across hips', 'Drive hips to ceiling', 'Squeeze glutes at top'] },


  { name: 'Plank', category: 'compound', muscleGroup: { primary: ['core'], secondary: ['shoulders'] }, equipment: ['bodyweight'], difficulty: 'beginner', mechanics: 'isometric', type: 'duration', instructions: ['Forearms on floor', 'Body straight line', 'Hold position'] },
  { name: 'Hanging Leg Raise', category: 'isolation', muscleGroup: { primary: ['core'], secondary: ['hip flexors'] }, equipment: ['pull-up bar'], difficulty: 'intermediate', mechanics: 'pull', type: 'reps', instructions: ['Hang from bar', 'Raise legs to 90 degrees', 'Lower slowly'] },
  { name: 'Cable Crunch', category: 'isolation', muscleGroup: { primary: ['core'], secondary: [] }, equipment: ['cable'], difficulty: 'beginner', mechanics: 'pull', type: 'reps_weight', instructions: ['Kneel at cable', 'Crunch down bringing elbows to knees', 'Slow return'] },


  { name: 'Treadmill Run', category: 'cardio', muscleGroup: { primary: ['cardio'], secondary: ['quads', 'calves'] }, equipment: ['machine'], difficulty: 'beginner', mechanics: 'cardio', type: 'duration', instructions: ['Set speed and incline', 'Maintain steady pace', 'Breathe rhythmically'] },
  { name: 'Jump Rope', category: 'cardio', muscleGroup: { primary: ['cardio', 'calves'], secondary: ['shoulders'] }, equipment: ['resistance band'], difficulty: 'beginner', mechanics: 'cardio', type: 'duration', instructions: ['Jump with both feet', 'Keep elbows close to body', 'Maintain rhythm'] },
  { name: 'Burpee', category: 'plyometric', muscleGroup: { primary: ['full body', 'cardio'], secondary: [] }, equipment: ['bodyweight'], difficulty: 'intermediate', mechanics: 'cardio', type: 'reps', instructions: ['Stand, drop to push-up', 'Perform push-up', 'Jump feet to hands', 'Jump up with arms overhead'] },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Exercise.deleteMany({});
    console.log('Cleared exercises');

    await Exercise.insertMany(exercises);
    console.log(`✅ Seeded ${exercises.length} exercises`);

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
