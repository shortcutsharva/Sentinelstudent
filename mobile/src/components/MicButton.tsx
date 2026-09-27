import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { VoiceStatus } from '@/lib/useVoiceRecorder';
import { colors, radius } from '@/theme';

type Props = {
  status: VoiceStatus;
  disabled?: boolean;
  size?: number;
  onPress: () => void;
};

export function MicButton({ status, disabled, size = 44, onPress }: Props) {
  const recording = status === 'recording';
  const transcribing = status === 'transcribing';

  return (
    <Pressable
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={
        recording ? 'Stop recording' : transcribing ? 'Transcribing audio' : 'Start voice input'
      }
      disabled={disabled || transcribing}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: recording ? colors.red : colors.accent,
        },
        (disabled || transcribing) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {transcribing ? (
        <ActivityIndicator color={colors.white} />
      ) : recording ? (
        <View style={[styles.stopSquare, { width: size * 0.3, height: size * 0.3 }]} />
      ) : (
        <Feather name="mic" size={size * 0.42} color={colors.white} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopSquare: {
    borderRadius: radius.xs,
    backgroundColor: colors.white,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
