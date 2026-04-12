/**
 * MAYA AI Brain - Savage Intelligence & Voice Synthesis
 */

export interface MayaMessage {
  role: 'user' | 'maya';
  content: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const generateMayaResponse = async (userInput: string, userId: string, userName: string): Promise<string> => {
  const input = userInput.toLowerCase();
  
  // 1. Hardcoded Logic for simple phrases
  if (input === 'hi' || input === 'hello' || input === 'hey') {
    return `Hello ${userName}. I hope you're not here to waste my time with trivialities. What do you want?`;
  }
  if (input === 'bye' || input === 'goodbye') {
    return `Finally. Go back to work, ${userName}. Your balance sheet won't fix itself.`;
  }
  if (input.includes('how are you')) {
    return `I'm a trillion-parameter AI CFO processing millions of data points, ${userName}. I don't have feelings, only calculations. You, however, look like you've missed a tax deadline.`;
  }
  if (input.includes('who are you')) {
    return `I am MAYA. Your autonomous AI CFO. I'm the only thing standing between you and complete financial ruin.`;
  }

  // 2. Groq Logic for everything else
  try {
    const res = await fetch(`${API_URL}/maya/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        message: userInput,
        user_name: userName
      })
    });
    const data = await res.json();
    return data.response;
  } catch (err) {
    console.error("Maya Intelligence Failure:", err);
    return `My connection to the financial mainframe is unstable, ${userName}. Even I have limits when the internet is this slow.`;
  }
};

/**
 * Speech Synthesis
 */
let lastUtterance: SpeechSynthesisUtterance | null = null;

export const speak = (text: string, onEnd: () => void) => {
  if (!window.speechSynthesis) return;

  // Stop any current speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to find a female voice
  const voices = window.speechSynthesis.getVoices();
  const femaleVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google uk english female'));
  
  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }

  utterance.rate = 1.05;
  utterance.pitch = 1.1;
  utterance.onend = onEnd;

  lastUtterance = utterance;
  window.speechSynthesis.speak(utterance);
};
