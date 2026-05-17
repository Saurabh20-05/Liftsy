const axios = require('axios');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const apiKey = process.env.GROQ_API_KEY;
console.log('Groq Key found:', apiKey ? `${apiKey.slice(0, 8)}...` : 'MISSING - add GROQ_API_KEY to .env');

async function test() {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Say hello in one sentence.' }],
        max_tokens: 50,
      },
      {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 15000,
      }
    );
    const text = response.data?.choices?.[0]?.message?.content;
    console.log('✅ Groq works! Response:', text);
  } catch (err) {
    console.log('❌ Error status:', err.response?.status);
    console.log('❌ Error:', JSON.stringify(err.response?.data || err.message, null, 2));
  }
}
test();
