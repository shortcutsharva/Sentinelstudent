import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

import { transcribeAudio } from './sarvam';

const MAX_DURATION_SEC = 30;

export type VoiceStatus = 'idle' | 'recording' | 'transcribing';

export function useVoiceRecorder(onTranscript: (text: string) => void) {
  const finishRef = useRef<() => void>(() => {});
  const recorder = useAudioRecorder(
    {
      ...RecordingPresets.HIGH_QUALITY,
      sampleRate: 16000,
      numberOfChannels: 1,
      bitRate: 32000,
    },
    (status) => {
      if (status.isFinished) finishRef.current();
    },
  );
  const recorderState = useAudioRecorderState(recorder, 250);
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const statusRef = useRef<VoiceStatus>('idle');
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const start = useCallback(async () => {
    if (statusRef.current !== 'idle') return;
    setError(null);
    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setError('Microphone access is needed for voice input.');
      return;
    }
    try {
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record({ forDuration: MAX_DURATION_SEC });
      statusRef.current = 'recording';
      setStatus('recording');
    } catch {
      setError('Could not start recording. Try again.');
    }
  }, [recorder]);

  const finish = useCallback(() => {
    if (statusRef.current !== 'recording') return;
    statusRef.current = 'transcribing';
    setStatus('transcribing');
    void (async () => {
      try {
        try {
          await recorder.stop();
        } catch {}
        const uri = recorder.uri;
        if (!uri) {
          setError('Recording failed. Try again.');
          statusRef.current = 'idle';
          setStatus('idle');
          return;
        }
        const text = await transcribeAudio(uri);
        onTranscriptRef.current(text);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Transcription failed. Try again.');
      } finally {
        statusRef.current = 'idle';
        setStatus('idle');
      }
    })();
  }, [recorder]);

  useEffect(() => {
    finishRef.current = finish;
  }, [finish]);

  const stop = useCallback(() => {
    if (statusRef.current === 'recording') {
      finish();
    }
  }, [finish]);

  return {
    status,
    error,
    clearError: () => setError(null),
    durationSec: status === 'recording' ? Math.round(recorderState.durationMillis / 1000) : 0,
    start,
    stop,
  };
}
