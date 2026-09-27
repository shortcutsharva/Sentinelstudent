export type SubjectScore = {
  subject: string;
  score: number;
  max: number;
};

export type MockTest = {
  id: string;
  name: string;
  date: string;
  scores: SubjectScore[];
  total: number;
  max: number;
  percentile: number;
  note: string;
};

export const mockTests: MockTest[] = [
  {
    id: 'mock-14',
    name: 'JEE Main Mock 14',
    date: '24 Sep',
    scores: [
      { subject: 'Physics', score: 68, max: 100 },
      { subject: 'Chemistry', score: 82, max: 100 },
      { subject: 'Mathematics', score: 74, max: 100 },
    ],
    total: 224,
    max: 300,
    percentile: 92.4,
    note: 'Chemistry is your strongest subject this cycle; Mathematics improved by 8 marks over Mock 13.',
  },
  {
    id: 'mock-13',
    name: 'JEE Main Mock 13',
    date: '17 Sep',
    scores: [
      { subject: 'Physics', score: 61, max: 100 },
      { subject: 'Chemistry', score: 76, max: 100 },
      { subject: 'Mathematics', score: 66, max: 100 },
    ],
    total: 203,
    max: 300,
    percentile: 88.1,
    note: 'Steady attempt overall; accuracy dropped in Physics section B.',
  },
  {
    id: 'mock-12',
    name: 'JEE Main Mock 12',
    date: '10 Sep',
    scores: [
      { subject: 'Physics', score: 72, max: 100 },
      { subject: 'Chemistry', score: 71, max: 100 },
      { subject: 'Mathematics', score: 58, max: 100 },
    ],
    total: 201,
    max: 300,
    percentile: 87.5,
    note: 'Mathematics was the bottleneck — revisit calculus fundamentals.',
  },
];

export type Deadline = {
  id: string;
  title: string;
  subject: string;
  dueLabel: string;
  dueIn: string;
  status: 'due-soon' | 'upcoming';
  detail: string;
};

export const deadlines: Deadline[] = [
  {
    id: 'd1',
    title: 'Rotational Dynamics DPP 7',
    subject: 'Physics',
    dueLabel: 'Tomorrow · 11:59 PM',
    dueIn: 'Due tomorrow',
    status: 'due-soon',
    detail: 'Twelve problems on rolling motion and torque. Submitted through the class portal.',
  },
  {
    id: 'd2',
    title: 'Weekly Part Test 22 booking',
    subject: 'Tests',
    dueLabel: 'Fri · 6:00 PM',
    dueIn: 'Booking closes Friday',
    status: 'due-soon',
    detail: 'Confirm your centre slot before seats close. The test runs Saturday from 9:00 AM.',
  },
  {
    id: 'd3',
    title: 'Integrals revision sheet',
    subject: 'Mathematics',
    dueLabel: '30 Sep · 9:00 AM',
    dueIn: 'Due in 3 days',
    status: 'upcoming',
    detail: 'Definite integral properties and reduction formulae, first pass.',
  },
  {
    id: 'd4',
    title: 'Lab record · Chemical equilibrium',
    subject: 'Chemistry',
    dueLabel: '2 Oct · 5:00 PM',
    dueIn: 'Due next week',
    status: 'upcoming',
    detail: 'Observation table, graph, and the conclusion paragraph.',
  },
  {
    id: 'd5',
    title: 'Mock 15 revision plan',
    subject: 'Planning',
    dueLabel: '4 Oct · 8:00 PM',
    dueIn: 'Due next week',
    status: 'upcoming',
    detail: 'Three chapters, two practice sets, and one full-length revision day.',
  },
];
