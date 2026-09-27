import { StyleSheet, Text, View } from 'react-native';

import type { ChatMessage } from '@/lib/types';
import { colors, radius, spacing } from '@/theme';

type Props = {
  message: ChatMessage;
};

export function ChatBubble({ message }: Props) {
  const isBot = message.role === 'bot';
  const bubbleStyle = isBot
    ? message.kind === 'summary'
      ? styles.bubbleSummary
      : styles.bubbleBot
    : styles.bubbleUser;

  return (
    <View style={[styles.row, isBot ? styles.rowBot : styles.rowUser]}>
      <View style={[styles.bubble, bubbleStyle]}>
        <Text style={[styles.text, isBot ? styles.textBot : styles.textUser]}>{message.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: spacing.lg,
  },
  rowBot: {
    alignItems: 'flex-start',
  },
  rowUser: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 2,
    borderRadius: radius.lg,
  },
  bubbleBot: {
    backgroundColor: colors.bubbleBot,
    borderBottomLeftRadius: radius.xs,
  },
  bubbleSummary: {
    backgroundColor: colors.accentSoft,
    borderBottomLeftRadius: radius.xs,
  },
  bubbleUser: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: radius.xs,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  textBot: {
    color: colors.text,
  },
  textUser: {
    color: colors.white,
  },
});
