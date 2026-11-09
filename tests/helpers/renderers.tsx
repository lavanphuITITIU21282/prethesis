import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QuizSetup } from '../../src/modules/assessment/presentation/quiz-setup';
import { GradingView } from '../../src/modules/assessment/presentation/grading-panel';
import type {
  Course,
  Grade,
  Lesson,
  Question,
  QuizFilters,
  StudyState,
} from '../../src/shared/domain/models';

// Existing content assertions now exercise the actual React presentation components.
export function quizSetupHTML(
  course: Course,
  bank: Question[],
  state: StudyState,
  filters: QuizFilters,
) {
  return renderToStaticMarkup(
    <QuizSetup
      course={course}
      bank={bank}
      state={{ ...state, quizFilters: filters }}
      onFilter={() => {}}
      onStart={() => {}}
      onResume={() => {}}
    />,
  );
}
export function gradingCard(
  lesson: Lesson,
  props: { grade?: Grade; answer?: string; available?: boolean },
) {
  return renderToStaticMarkup(<GradingView lesson={lesson} {...props} />);
}
