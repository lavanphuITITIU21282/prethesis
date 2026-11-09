import type { Course, QuizFilters } from '../../../shared/domain/models';
export const quizLabels: Record<string, string>;
export interface PracticeArtwork {
  id: string;
  name: string;
  category: string;
  assetStem: string;
  lessonTitle: string;
  src: string;
  small: string;
  thumb: string;
}
export function practiceArtFor(
  course: Course,
  filters?: Partial<QuizFilters> | null,
): PracticeArtwork | null;
export function quizScopeLabel(course: Course, filters: QuizFilters): string;
