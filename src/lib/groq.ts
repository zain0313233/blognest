import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default groq;

export const FAST_MODEL = 'llama-3.1-8b-instant';
export const SMART_MODEL = 'llama-3.3-70b-versatile';
