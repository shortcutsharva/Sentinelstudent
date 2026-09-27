import type { ChatMessage, SessionLog } from './types';

export type FlowStep =
  | 'issue'
  | 'cause'
  | 'severity'
  | 'suggestion'
  | 'summary'
  | 'plan'
  | 'escalation'
  | 'postEscalation'
  | 'closing'
  | 'done';

export type FlowState = {
  step: FlowStep;
  issue?: string;
  cause?: string;
  severity?: string;
  planAccepted: boolean;
  escalated: boolean;
  supportRequested: boolean;
  repeated: boolean;
};

export const SKIP = 'Skip';

let messageCounter = 0;

function nextId(): string {
  messageCounter += 1;
  return `msg-${messageCounter}`;
}

export function botMessage(text: string, kind?: ChatMessage['kind']): ChatMessage {
  return { id: nextId(), role: 'bot', text, kind };
}

export function userMessage(text: string): ChatMessage {
  return { id: nextId(), role: 'user', text };
}

export function createFlow(repeated: boolean): FlowState {
  return { step: 'issue', planAccepted: false, escalated: false, supportRequested: false, repeated };
}

export function initialMessage(): ChatMessage {
  return botMessage(
    "Hey — I'm here if you want to talk through anything, studies or otherwise. What's on your mind?",
  );
}

const CAUSE_QUESTIONS: Record<string, string> = {
  'Too many assignments': 'Is this due to multiple deadlines or difficulty completing tasks?',
  'Can’t focus': 'Is this due to distractions or the length of your study sessions?',
  'Falling behind': 'Is this due to missed deadlines or the pace of your courses?',
  'Need help planning': 'Is this due to multiple deadlines or difficulty completing tasks?',
  'Other issue': 'In a few words, what would you call this issue?',
};

const DEFAULT_CAUSE = CAUSE_QUESTIONS['Too many assignments'];

const SUGGESTIONS: Record<string, string> = {
  'Too many assignments': 'Try breaking tasks into 30-minute blocks.',
  'Can’t focus': 'Try 25-minute focus blocks with short breaks.',
  'Falling behind': 'Try listing the three most urgent items for tomorrow.',
  'Need help planning': 'Try mapping your week into fixed study blocks.',
  'Other issue': 'Try breaking tasks into 30-minute blocks.',
};

const DEFAULT_SUGGESTION = SUGGESTIONS['Too many assignments'];

const PLAN_TEXT =
  'Here’s a short plan:\n• Break today’s tasks into 30-minute blocks\n• Start with the nearest deadline\n• Leave a 10-minute buffer between blocks';

function summaryMessage(state: FlowState): ChatMessage {
  return botMessage(
    `Let’s organize this quickly.\n\n• Issue: ${state.issue ?? 'Not specified'}\n• Cause: ${state.cause ?? 'Not specified'}\n• Severity: ${state.severity ?? 'Not specified'}\n\nWould you like help creating a short plan?`,
    'summary',
  );
}

function needsEscalation(state: FlowState): boolean {
  return state.severity === 'Overwhelming' || state.repeated;
}

export function advance(state: FlowState, answer: string): { state: FlowState; messages: ChatMessage[] } {
  const value = answer.trim() || 'Not specified';

  switch (state.step) {
    case 'issue': {
      const issue = value === SKIP ? 'Not specified' : value;
      const cause = CAUSE_QUESTIONS[issue] ?? DEFAULT_CAUSE;
      return {
        state: { ...state, issue, step: 'cause' },
        messages: [botMessage(cause)],
      };
    }
    case 'cause': {
      const cause = value === SKIP ? 'Not specified' : value;
      return {
        state: { ...state, cause, step: 'severity' },
        messages: [botMessage('How manageable does this feel?')],
      };
    }
    case 'severity': {
      const severity = value === SKIP ? 'Not specified' : value;
      const suggestion = SUGGESTIONS[state.issue ?? ''] ?? DEFAULT_SUGGESTION;
      return {
        state: { ...state, severity, step: 'suggestion' },
        messages: [botMessage(`Here’s a quick suggestion:\n${suggestion}`)],
      };
    }
    case 'suggestion': {
      return {
        state: { ...state, step: 'summary' },
        messages: [summaryMessage(state)],
      };
    }
    case 'summary': {
      const planAccepted = value === 'Yes';
      const next: FlowState = { ...state, planAccepted, step: planAccepted ? 'plan' : 'closing' };
      if (needsEscalation(state)) {
        return {
          state: { ...state, planAccepted, escalated: true, step: 'escalation' },
          messages: [
            botMessage(
              'It seems this has been consistently difficult over the past few days.\n\nWould additional academic support help?',
            ),
          ],
        };
      }
      return {
        state: next,
        messages: [
          planAccepted
            ? botMessage(PLAN_TEXT)
            : botMessage('No problem. You can restart this chat whenever you want to build a plan.'),
        ],
      };
    }
    case 'escalation': {
      if (value === 'Yes, request support') {
        return {
          state: { ...state, supportRequested: true, step: 'postEscalation' },
          messages: [
            botMessage(
              'Got it. A staff member may reach out to assist you.\n\nMeanwhile, would you like help organizing your current tasks?',
            ),
          ],
        };
      }
      return {
        state: { ...state, step: state.planAccepted ? 'plan' : 'closing' },
        messages: [
          state.planAccepted
            ? botMessage(PLAN_TEXT)
            : botMessage('Understood. You can restart this chat whenever you want to build a plan.'),
        ],
      };
    }
    case 'postEscalation': {
      const planAccepted = value === 'Yes' || state.planAccepted;
      return {
        state: { ...state, planAccepted, step: planAccepted ? 'plan' : 'closing' },
        messages: [
          planAccepted
            ? botMessage(PLAN_TEXT)
            : botMessage('All right. You can restart this chat whenever you want to build a plan.'),
        ],
      };
    }
    case 'plan':
    case 'closing': {
      return {
        state: { ...state, step: 'done' },
        messages: [botMessage('You’re set for now. Start a new chat anytime you need to re-plan.')],
      };
    }
    case 'done': {
      return { state, messages: [] };
    }
  }
}

const ISSUE_TYPES: Record<string, string> = {
  'Too many assignments': 'coursework_overload',
  'Can’t focus': 'focus_difficulty',
  'Falling behind': 'falling_behind',
  'Need help planning': 'planning_support',
  'Other issue': 'other',
};

const SUB_TYPES: Record<string, string> = {
  'Multiple deadlines': 'deadlines',
  'Tasks taking longer': 'task_duration',
  'Both': 'both',
  'Too many distractions': 'distractions',
  'Sessions feel too long': 'session_length',
  'Missed deadlines': 'missed_deadlines',
  'Pace feels too fast': 'course_pace',
};

const SEVERITIES: Record<string, string> = {
  Manageable: 'low',
  Difficult: 'medium',
  Overwhelming: 'high',
};

export function buildSessionLog(state: FlowState): SessionLog {
  return {
    issue_type: ISSUE_TYPES[state.issue ?? ''] ?? 'other',
    sub_type: SUB_TYPES[state.cause ?? ''] ?? (state.cause ? 'other' : 'not_assessed'),
    severity: SEVERITIES[state.severity ?? ''] ?? 'not_assessed',
    frequency: state.escalated ? 'repeated' : 'once',
    resolution_status: state.planAccepted ? 'in_progress' : 'unresolved',
    escalation_flag: state.supportRequested,
  };
}
