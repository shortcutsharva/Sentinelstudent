import type { ChatRole } from './types';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const MODEL = 'gemini-3.1-flash-lite';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export type ChatReply = { reply: string };

const SYSTEM_PROMPT =
  'You are a friendly study companion inside the Academic Pulse app — the mate students talk to about ' +
  'coursework, stress and plans. Talk like a real friend: everyday words, contractions, warm and human, ' +
  'never corporate, clinical or robotic. Keep replies short — usually 1-3 sentences — and react to what ' +
  'they actually said before asking anything. Ask only one question at a time and never lecture. ' +
  'Light humour is welcome; never at their expense. When someone is having a hard day, be genuinely ' +
  'caring first and practical second. If they sound overwhelmed, mention they can send a request to their ' +
  'counsellor from the Mentorship > Requests screen. Never write bullet-point essays unless they ask for a plan.';

type GeminiPart = { text?: string };

export async function sendChatMessage(params: {
  message: string;
  history: { role: ChatRole; text: string }[];
}): Promise<ChatReply | null> {
  if (!API_KEY) return null;
  try {
    const contents = [
      ...params.history.map((entry) => ({
        role: entry.role === 'user' ? 'user' : 'model',
        parts: [{ text: entry.text }] as GeminiPart[],
      })),
      { role: 'user', parts: [{ text: params.message }] as GeminiPart[] },
    ];
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
      }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      candidates?: { content?: { parts?: GeminiPart[] } }[];
    };
    const reply = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim();
    return reply ? { reply } : null;
  } catch {
    return null;
  }
}
