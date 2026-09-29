export type Difficulty = 'Hard' | 'Medium' | 'Easy';
export type Priority = 'high' | 'medium' | 'low';
export type PreferredTime = 'morning' | 'afternoon' | 'evening' | 'night';
export type SessionStatus = 'pending' | 'completed' | 'skipped';

export interface Subject {
  id: string;
  name: string;
  examDate: string; // YYYY-MM-DD
  difficulty: Difficulty;
  topics: string[];
  color: string;
  targetHours: number;
}

export interface StudyPreferences {
  dailyHoursWeekday: number;
  dailyHoursWeekend: number;
  preferredTime: PreferredTime;
  sessionDurationMinutes: number;
  breakDurationMinutes: number;
  startDate: string;
  daysToPlan: number;
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  subjectId: string;
  subjectName: string;
  topic: string;
  difficulty: Difficulty;
  priority: Priority;
  technique: string;
  startTime: string; // e.g. "09:00"
  durationMinutes: number;
  status: SessionStatus;
  notes?: string;
  completedAt?: string;
}

export interface StudyDay {
  date: string;
  dayOfWeek: string;
  focusTheme: string;
  totalMinutes: number;
  sessions: StudySession[];
}

export interface StudyPlan {
  id: string;
  createdAt: string;
  summary: string;
  highYieldTips: string[];
  days: StudyDay[];
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string;
  totalSessionsCompleted: number;
  totalMinutesStudied: number;
}

export interface OutlineSection {
  section: string;
  goal: string;
  keyElements: string[];
  suggestedWordCount: string;
}

export interface AssignmentHelpResult {
  id: string;
  createdAt: string;
  topic: string;
  title: string;
  academicLevel: string;
  assignmentType: string;
  simpleExplanation: string;
  keyPoints: string[];
  examples: string[];
  structuredOutline: OutlineSection[];
  commonMistakes: string[];
  recommendedNextSteps: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface TopicFlashTips {
  tips: string[];
  memoryTrick: string;
  practiceQuestion: string;
}
