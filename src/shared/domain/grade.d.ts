import type { Grade, Lesson } from './models';
export function restoreAIGrade(value: unknown, lesson: Lesson): Grade | null;
export function gradeMatchesAnswer(grade: Grade | undefined, answer: string | undefined): boolean;
export function validateGradeResult(
  value: unknown,
  lesson: Lesson,
): Omit<
  Grade,
  'lessonId' | 'provider' | 'model' | 'gradedAt' | 'answerText' | 'answerHash' | 'cached'
>;
