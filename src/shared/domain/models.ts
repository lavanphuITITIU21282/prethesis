export interface Module {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
}
export interface Term {
  id: string;
  lesson: string;
  module: string;
  name: string;
  vi: string;
  englishFull?: string;
  nameNote?: string;
  definition: string;
  scenario: string;
  pitfall: string;
}
export interface Source {
  id: string;
  file: string;
  pageCount: number;
}
export interface StudyReference {
  source: string;
  page: number;
  image?: { width: number; height: number };
}
export interface Section {
  title: string;
  body: string;
  terms: string[];
  commands: string[];
  minutes: number;
  study: {
    paragraphs: string[];
    example: { title: string; steps: string[] };
    checkpoint: { question: string; answer: string };
    references: StudyReference[];
    figure?: string;
    figureCaption?: string;
  };
}
export interface Rubric {
  text: string;
  points: number;
}
export interface Lesson {
  id: string;
  module: string;
  title: string;
  summary: string;
  minutes: number;
  source: string;
  pages: number[];
  terms: string[];
  sections: Section[];
  flow: string[];
  diagram: string;
  slide: string;
  slidePage: number;
  challenge: {
    id: string;
    title: string;
    prompt: string;
    rubric: Rubric[];
    solution: string | string[];
  };
}
export interface Command {
  id: string;
  lesson: string;
  title: string;
  environment: string;
  code: string;
  situation: string;
  result: string;
  warning: string;
  tokens: { token: string; meaning: string }[];
  sections: number[];
}
export interface Course {
  modules: Module[];
  lessons: Lesson[];
  terms: Term[];
  commands: Command[];
  references: { title: string; url: string; note: string }[];
}
export interface Review {
  level: number;
  seen: number;
  correct: number;
  due: number;
  updated: number;
}
export interface QuizFilters {
  module: string;
  lesson: string;
  section: string;
  term: string;
  kind: string;
  size: string;
  priority: string;
}
export interface Question {
  id: string;
  kind: string;
  lesson: string;
  module: string;
  prompt: string;
  term?: string;
  command?: string;
  sections?: number[];
  code?: string;
  options?: { id: string; text: string }[];
  correct?: string;
  explanation?: string;
  rubric?: Rubric[];
  solution?: string | string[];
}
export interface QuizAnswer {
  selected?: string;
  correct?: boolean;
  score?: number;
  selfRated?: boolean;
  method?: string;
}
export interface QuizSession {
  id: string;
  startedAt: number;
  updatedAt: number;
  filters: QuizFilters;
  ids: string[];
  index: number;
  answers: Record<string, QuizAnswer>;
  orders: Record<string, string[]>;
  recorded: boolean;
  freeNavigation?: boolean;
}
export interface Grade {
  lessonId: string;
  provider: string;
  model: string;
  gradedAt: number;
  answerText: string;
  answerHash: string;
  cached: boolean;
  score: number;
  summary: string;
  criteria: {
    criterionIndex: number;
    score: number;
    maxPoints: number;
    evidence: string;
    feedback: string;
    improvement: string;
  }[];
  strengths: string[];
  gaps: string[];
  nextSteps: string[];
}
export interface Timer {
  running: boolean;
  remaining: number;
  duration: number;
  endsAt?: number;
  completed?: boolean;
}
export interface StudyState {
  version: number;
  read: Record<string, number[]>;
  notes: Record<string, string>;
  reviews: Record<string, Review>;
  drafts: Record<string, string>;
  bossScores: Record<string, number[]>;
  aiGrades: Record<string, Grade>;
  history: { date: number; total: number; correct: number }[];
  activity: Record<string, { sections: number; minutes: number }>;
  settings: { minutes: number; font: number; dark: boolean; focus: boolean; goal: number };
  lastLesson: string;
  quiz: QuizSession | null;
  quizSessions: QuizSession[];
  quizFilters: QuizFilters;
  timer: Timer | null;
}
