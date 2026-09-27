import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="broadcast" />
        <Stack.Screen name="notification" />
        <Stack.Screen name="checkup" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="support" />
        <Stack.Screen name="mentorship" />
        <Stack.Screen name="test-analysis" />
        <Stack.Screen name="deadlines" />
        <Stack.Screen name="requests" />
      </Stack>
    </SafeAreaProvider>
  );
}
