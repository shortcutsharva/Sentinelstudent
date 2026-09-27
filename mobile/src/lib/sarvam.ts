import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';
import { Platform } from 'react-native';

const API_KEY = process.env.EXPO_PUBLIC_SARVAM_API_KEY;
const ENDPOINT = 'https://api.sarvam.ai/speech-to-text';

export async function transcribeAudio(uri: string): Promise<string> {
  if (!API_KEY) throw new Error('Speech service is not configured.');

  const form = new FormData();
  let sendRequest: typeof fetch;
  if (Platform.OS === 'web') {
    const audioResponse = await fetch(uri);
    const blob = await audioResponse.blob();
    form.append('file', blob, 'audio.webm');
    sendRequest = fetch;
  } else {
    form.append('file', new File(uri));
    sendRequest = expoFetch;
  }
  form.append('model', 'saaras:v3');
  form.append('mode', 'transcribe');
  form.append('language_code', 'unknown');

  let response: Response;
  try {
    response = await sendRequest(ENDPOINT, {
      method: 'POST',
      headers: { 'api-subscription-key': API_KEY },
      body: form,
    });
  } catch (error) {
    const reason = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    throw new Error(`Speech request failed: ${reason}`);
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: { message?: string }; message?: string }
      | null;
    if (response.status === 401 || response.status === 403) {
      throw new Error(body?.error?.message ?? body?.message ?? 'Speech service key is invalid.');
    }
    if (response.status === 429) throw new Error('Too many requests. Try again in a moment.');
    if (response.status === 422) {
      throw new Error(body?.error?.message ?? body?.message ?? 'Audio format or duration is not supported.');
    }
    throw new Error(body?.error?.message ?? body?.message ?? `Transcription failed (${response.status}).`);
  }

  const data = (await response.json()) as { transcript?: string };
  const transcript = data.transcript?.trim();
  if (!transcript) throw new Error('Nothing was heard. Try again.');
  return transcript;
}
