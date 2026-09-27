import type { Feather } from '@expo/vector-icons';

export type NotificationTone = 'blue' | 'green' | 'amber';

export type NotificationCta = {
  label: string;
  href: '/checkup' | '/test-analysis' | '/chat' | '/deadlines' | '/support';
};

export type AppNotification = {
  id: string;
  category: string;
  title: string;
  /** One-line preview shown in the list. */
  message: string;
  /** Paragraphs shown on the detail screen. */
  body: string[];
  time: string;
  icon: keyof typeof Feather.glyphMap;
  tone: NotificationTone;
  group: 'today' | 'earlier';
  cta?: NotificationCta;
};

export const notifications: AppNotification[] = [
  {
    id: 'daily-checkup',
    category: 'DAILY CHECKUP',
    title: 'Daily checkup',
    message: 'How are you doing today? Take a moment to check in.',
    body: [
      'A small pause can make a busy academic day feel easier to understand. Start with how things feel right now.',
      'The check-in includes a required mood selection, your study factors for the day, and an optional note. Your answer stays private and takes about a minute.',
    ],
    time: 'Just now',
    icon: 'heart',
    tone: 'blue',
    group: 'today',
    cta: { label: 'Start daily checkup', href: '/checkup' },
  },
  {
    id: 'mock-test-result',
    category: 'TEST RESULTS',
    title: 'Mock test result ready',
    message: 'JEE Main Mock 14 · Physics 68/100, Chemistry 82/100, Maths 74/100. Total 224/300.',
    body: [
      'Your JEE Main Mock 14 result has been published. Total 224/300, estimated percentile 92.4.',
      'Physics 68/100 · Chemistry 82/100 · Mathematics 74/100.',
      'Chemistry remains your strongest subject, and Mathematics improved by 8 marks over Mock 13. Physics accuracy in section B is the main area left to recover.',
    ],
    time: 'Today · 8:15 AM',
    icon: 'file-text',
    tone: 'green',
    group: 'today',
    cta: { label: 'View test analysis', href: '/test-analysis' },
  },
  {
    id: 'mentor-note',
    category: 'MENTOR',
    title: 'Message from your mentor',
    message: 'Ms. Rao flagged your Chemistry scores and shared a revision plan for Organic reactions.',
    body: [
      'Ms. Rao reviewed your last three mock tests and left a note for you.',
      'She highlighted that Organic Chemistry is carrying your total, and suggested a two-week revision map: reaction mechanisms first, then named reactions, with a short self-test every third day.',
      'You can reply through the mentorship agent to ask questions about the plan.',
    ],
    time: 'Today · 11:40 AM',
    icon: 'user',
    tone: 'blue',
    group: 'today',
    cta: { label: 'Reply with mentorship agent', href: '/chat' },
  },
  {
    id: 'event-reminder',
    category: 'EVENTS',
    title: 'Event reminder',
    message: 'Doubt-clearing session with the Physics faculty starts tomorrow at 4:30 PM in Room 204.',
    body: [
      'The weekly doubt-clearing session with the Physics faculty runs tomorrow from 4:30 PM to 5:30 PM in Room 204.',
      'Bring the specific problems you want worked through — last week the session covered rotational dynamics and work-energy theorem questions from Part Test 21.',
    ],
    time: 'Today · 12:05 PM',
    icon: 'calendar',
    tone: 'amber',
    group: 'today',
    cta: { label: 'See deadlines', href: '/deadlines' },
  },
  {
    id: 'study-break',
    category: 'WELLBEING',
    title: 'A reminder to take a break',
    message: 'A short pause can help you return to your work with a clearer mind.',
    body: [
      'You have been revising for a long stretch today. A short break now usually buys back more focus than the time it costs.',
      'Try five minutes away from the desk — water, a stretch, or a walk to the window — then return to the next single task on your list.',
    ],
    time: 'Yesterday · 9:30 PM',
    icon: 'coffee',
    tone: 'green',
    group: 'earlier',
    cta: { label: 'Start daily checkup', href: '/checkup' },
  },
  {
    id: 'test-schedule',
    category: 'TESTS',
    title: 'New test scheduled',
    message: 'Weekly Part Test 22 is open for booking. Seats close Friday at 6:00 PM.',
    body: [
      'Weekly Part Test 22 is now open for booking at the centre. Seats close Friday at 6:00 PM and the test runs Saturday from 9:00 AM.',
      'The paper covers Rotational Dynamics, Chemical Equilibrium, and Definite Integrals — the same chapters as your current revision cycle.',
    ],
    time: 'Yesterday',
    icon: 'clock',
    tone: 'amber',
    group: 'earlier',
    cta: { label: 'See deadlines', href: '/deadlines' },
  },
  {
    id: 'study-support',
    category: 'SUPPORT',
    title: 'Study support is here',
    message: 'Explore practical ways to plan your work and ask for support when you need it.',
    body: [
      'Academic support collects the practical side of studying: how to split assignments, how to plan a week, and where to go when a topic is not clicking.',
      'You can also start a chat with the academic assistant to talk through a specific problem.',
    ],
    time: 'Mon',
    icon: 'book-open',
    tone: 'blue',
    group: 'earlier',
    cta: { label: 'Explore academic support', href: '/support' },
  },
];

export const todayNotifications = notifications.filter((item) => item.group === 'today');
export const earlierNotifications = notifications.filter((item) => item.group === 'earlier');

export function getNotification(id: string | undefined): AppNotification | undefined {
  return notifications.find((item) => item.id === id);
}
