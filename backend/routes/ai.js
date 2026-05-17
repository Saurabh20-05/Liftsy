console.log('AI ROUTE FILE LOADED');

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Session = require('../models/Session');
const axios = require('axios');

async function callAI(messages, maxTokens = 1024) {


    




    console.log('AI FUNCTION CALLED');
console.log('GROQ KEY:', process.env.GROQ_API_KEY);




  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') throw new Error('GROQ_API_KEY not set in .env');
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    { model: 'llama-3.1-8b-instant', messages, max_tokens: maxTokens, temperature: 0.7 },
    { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 30000 }
  );
  const text = response.data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq');
  return text;
}

router.post('/generate-workout', auth, async (req, res) => {
  try {
    const { goal, fitnessLevel, equipment, duration, muscleGroups, notes } = req.body;
    const messages = [
      { role: 'system', content: 'You are an expert fitness coach. Always respond with valid JSON only. No markdown, no code blocks.' },
      { role: 'user', content: `Generate a workout plan. Goal: ${goal}, Level: ${fitnessLevel || 'intermediate'}, Equipment: ${(equipment||[]).join(', ')||'bodyweight'}, Duration: ${duration||60} mins, Muscles: ${(muscleGroups||[]).join(', ')||'full body'}, Notes: ${notes||'none'}. Return JSON: {"name":"","description":"","category":"strength","difficulty":"intermediate","estimatedDuration":60,"muscleGroups":[],"exercises":[{"exerciseName":"","sets":[{"setNumber":1,"reps":10,"weight":60,"restTime":90}],"notes":""}],"tips":[]}` }
    ];
    const result = await callAI(messages, 1500);
    const cleaned = result.replace(/\`\`\`json\n?/g,'').replace(/\`\`\`\n?/g,'').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Could not parse AI response');
    const workout = JSON.parse(match[0]);
    workout.aiGenerated = true;
    res.json(workout);
  } catch (err) {
  console.error(
    'GROQ ERROR:',
    err.response?.data || err.message
  );

  res.status(500).json({
    message:
      err.response?.data?.error?.message ||
      err.message ||
      'AI request failed'
  });
}
});

router.post('/analyze-session/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ message: 'Not found' });
    const summary = session.exercises.map(e => `${e.exerciseName}: ${e.sets.filter(s=>s.completed).length} sets`).join(', ');
    const messages = [
      { role: 'system', content: 'You are a fitness coach. Respond with JSON only.' },
      { role: 'user', content: `Analyze: Workout=${session.workoutName}, Duration=${Math.round((session.duration||0)/60)}min, Volume=${session.stats?.totalVolume||0}kg, Exercises=${summary}. Return JSON: {"summary":"","strengths":[],"improvements":[],"nextWorkoutSuggestion":"","recoveryAdvice":"","estimatedCalories":300}` }
    ];
    const result = await callAI(messages, 600);
    const cleaned = result.replace(/\`\`\`json\n?/g,'').replace(/\`\`\`\n?/g,'').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    const analysis = match ? JSON.parse(match[0]) : { summary: result };
    session.aiAnalysis = { ...analysis, generatedAt: new Date() };
    await session.save();
    res.json(analysis);
  }catch (err) {
  console.error(
    'GROQ ERROR:',
    err.response?.data || err.message
  );

  res.status(500).json({
    message:
      err.response?.data?.error?.message ||
      err.message ||
      'AI request failed'
  });
}
});

router.post('/coach', auth, async (req, res) => {
  console.log('COACH ROUTE HIT');

    
  try {
    const { messages } = req.body;
    const user = req.user;
    const system = { role: 'system', content: `You are Liftsy AI Coach. User: ${user.displayName}, ${user.fitnessLevel} level, goals: ${(user.goals||[]).join(', ')||'fitness'}. Be concise under 150 words, motivating, use emojis.` };
    const reply = await callAI([system, ...(messages||[]).slice(-10)], 400);
    res.json({ message: reply });
  } catch (err) {
  console.error(
    'GROQ ERROR:',
    err.response?.data || err.message
  );

  res.status(500).json({
    message:
      err.response?.data?.error?.message ||
      err.message ||
      'AI request failed'
  });
}
});

router.post('/form-tips', auth, async (req, res) => {
  try {
    const { exerciseName } = req.body;
    const messages = [
      { role: 'system', content: 'Respond with a JSON array only. No markdown.' },
      { role: 'user', content: `5 form tips for "${exerciseName}" as JSON array: ["tip1","tip2","tip3","tip4","tip5"]` }
    ];
    const result = await callAI(messages, 300);
    const match = result.replace(/\`\`\`json\n?/g,'').replace(/\`\`\`\n?/g,'').match(/\[[\s\S]*\]/);
    res.json({ tips: match ? JSON.parse(match[0]) : [result] });
  } catch (err) {
  console.error(
    'GROQ ERROR:',
    err.response?.data || err.message
  );

  res.status(500).json({
    message:
      err.response?.data?.error?.message ||
      err.message ||
      'AI request failed'
  });
}
});

router.post('/suggest-progression', auth, async (req, res) => {
  try {
    const { exerciseName, recentSets } = req.body;
    const messages = [
      { role: 'system', content: 'Respond with JSON only.' },
      { role: 'user', content: `Progressive overload for "${exerciseName}", recent: ${JSON.stringify(recentSets)}. JSON: {"suggestion":"","nextWeight":0,"nextReps":0,"nextSets":3,"progressionType":"weight"}` }
    ];
    const result = await callAI(messages, 200);
    const match = result.replace(/\`\`\`json\n?/g,'').replace(/\`\`\`\n?/g,'').match(/\{[\s\S]*\}/);
    res.json(match ? JSON.parse(match[0]) : { suggestion: result });
  } catch (err) {
  console.error(
    'GROQ ERROR:',
    err.response?.data || err.message
  );

  res.status(500).json({
    message:
      err.response?.data?.error?.message ||
      err.message ||
      'AI request failed'
  });
}
});

module.exports = router;
