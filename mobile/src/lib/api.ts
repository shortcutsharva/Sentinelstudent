import { create } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { CheckIn, SessionLog } from './types';

const expoHost = Constants.expoConfig?.hostUri?.replace(/:\d+$/, '');
const defaultApiUrl =
  Platform.OS === 'web' || !expoHost ? 'http://localhost:3000' : `http://${expoHost}:3000`;

export const api = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl,
});

export async function submitCheckIn(checkIn: CheckIn): Promise<{ suggestChat: boolean } | null> {
  try {
    const { data } = await api.post<{ suggestChat?: boolean }>('/checkins', checkIn);
    return { suggestChat: data?.suggestChat ?? false };
  } catch {
    return null;
  }
}

export async function submitSessionLog(sessionId: string, log: SessionLog): Promise<boolean> {
  try {
    await api.post('/chat/sessions', { sessionId, ...log });
    return true;
  } catch {
    return false;
  }
}

export async function requestSupport(params: { sessionId: string; reason: string }): Promise<boolean> {
  try {
    await api.post('/support/requests', params);
    return true;
  } catch {
    return false;
  }
}

export type SentRequest = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  status: 'new' | 'reviewing' | 'closed';
};

export async function sendRequest(payload: { type: string; message: string }): Promise<SentRequest | null> {
  try {
    const { data } = await api.post<SentRequest>('/support/requests', payload);
    return data ?? null;
  } catch {
    return null;
  }
}
