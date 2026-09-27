export type Mood = 1 | 2 | 3 | 4 | 5;

export type CheckIn = {
  mood: Mood;
  influences: string[];
  note?: string;
  timestamp: string;
};

export type ChatRole = 'bot' | 'user';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  kind?: 'summary';
};

export type SessionLog = {
  issue_type: string;
  sub_type: string;
  severity: string;
  frequency: 'once' | 'repeated';
  resolution_status: 'unresolved' | 'in_progress';
  escalation_flag: boolean;
};
