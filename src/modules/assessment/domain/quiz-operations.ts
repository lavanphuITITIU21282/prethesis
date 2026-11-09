import { nextReview } from '../../../shared/domain/study-core.js';
import { gradeMatchesAnswer } from '../../../shared/domain/grade.js';
import type { Question, StudyState } from '../../../shared/domain/models';

export function answerQuestion(state: StudyState, question: Question, selected: string): boolean {
  const session = state.quiz;
  if (
    !session ||
    session.answers[question.id] ||
    !question.options?.some((option) => option.id === selected)
  )
    return false;
  const correct = selected === question.correct;
  session.answers[question.id] = { selected, correct };
  session.updatedAt = Date.now();
  // Reviewing an already answered question must never advance its review schedule twice.
  if (question.term)
    state.reviews[question.term] = nextReview(state.reviews[question.term], correct ? 2 : 0);
  return true;
}

export function moveQuestion(
  state: StudyState,
  direction: number,
): { moved: boolean; foundMissing: boolean } {
  const session = state.quiz;
  if (
    !session ||
    (direction < 0 && session.index === 0) ||
    (direction > 0 && session.index >= session.ids.length)
  )
    return { moved: false, foundMissing: false };
  let next = Math.max(0, session.index + direction);
  let foundMissing = false;
  if (direction > 0 && next >= session.ids.length) {
    const missing = session.ids.findIndex((id) => !session.answers[id]);
    if (missing >= 0) {
      next = missing;
      foundMissing = true;
    }
  }
  const moved = next !== session.index;
  if (moved) {
    session.index = next;
    session.freeNavigation = true;
    session.updatedAt = Date.now();
  }
  return { moved, foundMissing };
}

export function saveEssayScore(
  state: StudyState,
  question: Question,
  method: 'self' | 'gemini',
): boolean {
  if (!state.quiz || question.kind !== 'boss') return false;
  if (method === 'gemini') {
    const grade = state.aiGrades[question.lesson];
    if (!gradeMatchesAnswer(grade, state.drafts[question.lesson])) return false;
    state.quiz.answers[question.id] = { score: grade.score, selfRated: false, method: 'gemini' };
  } else {
    const scores = (state.bossScores[question.lesson] ??= [0, 0, 0, 0]);
    state.quiz.answers[question.id] = {
      score: scores.reduce((sum, score) => sum + score, 0),
      selfRated: true,
    };
  }
  return true;
}

export function recordQuizResult(state: StudyState, bank: Question[]): void {
  const session = state.quiz;
  if (
    !session ||
    session.recorded ||
    session.index < session.ids.length ||
    session.ids.some((id) => !session.answers[id])
  )
    return;
  const questions = bank.filter(
    (question) => session.ids.includes(question.id) && question.kind !== 'boss',
  );
  if (questions.length)
    state.history.push({
      date: Date.now(),
      total: questions.length,
      correct: questions.filter((question) => session.answers[question.id].correct).length,
    });
  state.history = state.history.slice(-100);
  session.recorded = true;
}
