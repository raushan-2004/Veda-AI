// ==================== Socket Event Names ====================
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Assessment Room
  JOIN_ASSESSMENT: 'assessment:join',
  LEAVE_ASSESSMENT: 'assessment:leave',
  ASSESSMENT_STARTED: 'assessment:started',
  ASSESSMENT_ENDED: 'assessment:ended',
  ASSESSMENT_TIME_UPDATE: 'assessment:time-update',

  // Submission
  SUBMIT_ANSWER: 'submission:answer',
  ANSWER_SAVED: 'submission:answer-saved',
  SUBMIT_ASSESSMENT: 'submission:submit',
  SUBMISSION_GRADED: 'submission:graded',

  // Proctoring
  PROCTORING_ALERT: 'proctoring:alert',
  TAB_SWITCH: 'proctoring:tab-switch',
  FULLSCREEN_EXIT: 'proctoring:fullscreen-exit',

  // Real-time stats (teacher dashboard)
  STATS_UPDATE: 'stats:update',
  PARTICIPANT_JOINED: 'stats:participant-joined',
  PARTICIPANT_SUBMITTED: 'stats:participant-submitted',

  // Notifications
  NOTIFICATION: 'notification',
} as const;

export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

// ==================== Socket Payloads ====================
export interface JoinAssessmentPayload {
  assessmentId: string;
  submissionId: string;
  userId: string;
}

export interface AnswerPayload {
  questionId: string;
  answer: string | string[];
  assessmentId: string;
  submissionId: string;
}

export interface TimeUpdatePayload {
  assessmentId: string;
  timeRemaining: number; // Seconds
}

export interface StatsUpdatePayload {
  assessmentId: string;
  totalParticipants: number;
  submittedCount: number;
  averageProgress: number; // 0-100
}

export interface NotificationPayload {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
}

export interface ProctoringAlertPayload {
  type: 'tab-switch' | 'fullscreen-exit' | 'copy-paste' | 'suspicious-activity';
  userId: string;
  assessmentId: string;
  timestamp: string;
  count: number;
}

// ==================== Type-safe Socket Event Map ====================
export interface ServerToClientEvents {
  [SOCKET_EVENTS.ASSESSMENT_STARTED]: (data: { assessmentId: string; startTime: string }) => void;
  [SOCKET_EVENTS.ASSESSMENT_ENDED]: (data: { assessmentId: string }) => void;
  [SOCKET_EVENTS.ASSESSMENT_TIME_UPDATE]: (data: TimeUpdatePayload) => void;
  [SOCKET_EVENTS.ANSWER_SAVED]: (data: { questionId: string; success: boolean }) => void;
  [SOCKET_EVENTS.SUBMISSION_GRADED]: (data: { submissionId: string; score: number; percentage: number }) => void;
  [SOCKET_EVENTS.STATS_UPDATE]: (data: StatsUpdatePayload) => void;
  [SOCKET_EVENTS.PARTICIPANT_JOINED]: (data: { userId: string; count: number }) => void;
  [SOCKET_EVENTS.PARTICIPANT_SUBMITTED]: (data: { userId: string; count: number }) => void;
  [SOCKET_EVENTS.NOTIFICATION]: (data: NotificationPayload) => void;
  [SOCKET_EVENTS.PROCTORING_ALERT]: (data: ProctoringAlertPayload) => void;
}

export interface ClientToServerEvents {
  [SOCKET_EVENTS.JOIN_ASSESSMENT]: (data: JoinAssessmentPayload) => void;
  [SOCKET_EVENTS.LEAVE_ASSESSMENT]: (data: { assessmentId: string }) => void;
  [SOCKET_EVENTS.SUBMIT_ANSWER]: (data: AnswerPayload) => void;
  [SOCKET_EVENTS.SUBMIT_ASSESSMENT]: (data: { submissionId: string; assessmentId: string }) => void;
  [SOCKET_EVENTS.TAB_SWITCH]: (data: { assessmentId: string; timestamp: string }) => void;
  [SOCKET_EVENTS.FULLSCREEN_EXIT]: (data: { assessmentId: string; timestamp: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  userRole: 'student' | 'teacher' | 'admin';
  assessmentId?: string;
}
