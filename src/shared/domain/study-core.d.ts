import type { Course, Question, QuizFilters, QuizSession, Review, StudyState } from './models';
export const STORAGE_KEY: string;
export const DAY: number;
export function normalize(value: unknown): string;
export function escapeHTML(value: unknown): string;
export function shuffled<T>(values: T[], random?: () => number): T[];
export function buildQuestions(course: Course): Question[];
export function freshState(): StudyState;
export function validateBackup(input: unknown, course: Course): StudyState;
export function defaultQuizFilters(): QuizFilters;
export function normalizeQuizFilters(value: Partial<QuizFilters>, course: Course): QuizFilters;
export function filterQuestions(
  bank: Question[],
  filters: QuizFilters,
  reviews?: Record<string, Review>,
  now?: number,
): Question[];
export function createQuizSession(
  questions: Question[],
  filters: QuizFilters,
  random?: () => number,
  now?: number,
): QuizSession | null;
export function activateQuizSession(state: StudyState, session: QuizSession | null): void;
export function restoreQuiz(value: unknown, bank: Question[], course?: Course): QuizSession | null;
export function nextReview(previous: Review | undefined, quality: number, now?: number): Review;
export function modPow(base: number | bigint, exp: number | bigint, mod: number | bigint): bigint;
export function gcd(a: number, b: number): number;
export function inverse(a: number, m: number): number | null;
export function isPrime(n: number): boolean;
export function caesar(text: string, key: number): string;
