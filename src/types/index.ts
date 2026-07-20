export interface TypingWord {
  id: string;
  word: string;
  meaning: string;
  category: 'fruit' | 'animal' | 'school' | 'nature' | 'sports' | 'verb' | 'general' | 'sentence';
}

export interface QuestionDetail {
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  responseTimeMs: number;
}

export interface SaveSessionPayload {
  userId: number;
  subject: 'typing' | 'math' | 'english';
  mode: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  wpm: number;
  durationSeconds: number;
  details: QuestionDetail[];
}

export interface SessionRecord {
  id: number;
  userId: number;
  subject: string;
  mode: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  wpm: number;
  durationSeconds: number;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalSessions: number;
  totalDurationSeconds: number;
  avgWpm: number;
  avgAccuracy: number;
  recentSessions: SessionRecord[];
}
