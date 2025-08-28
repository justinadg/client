import OpenAI from 'openai';

// Initialize OpenAI with your API key from environment variables
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // This is needed for client-side usage
});

export { openai };