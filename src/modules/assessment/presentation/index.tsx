'use client';

import React from 'react';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import {
  activateQuizSession,
  createQuizSession,
  defaultQuizFilters,
  filterQuestions,
  normalizeQuizFilters,
} from '@/shared/domain/study-core.js';
import {
  answerQuestion,
  moveQuestion,
  saveEssayScore,
} from '@/modules/assessment/domain/quiz-operations';
import { practiceArtFor } from '@/modules/assessment/domain/practice-metadata.js';
import type { QuizFilters } from '@/shared/domain/models';
import { useStudy } from '@/modules/learning/presentation/study-provider';
import { QuizSetup } from './quiz-setup';
import { QuizRun } from './quiz-run';
import { QuizResult } from './quiz-result';

export default function Quiz({
  running,
  query,
}: {
  running: boolean;
  query: Record<string, string>;
}) {
  const { course, bank, state, update, notify } = useStudy();
  const router = useRouter();
  useEffect(() => {
    if (running || !Object.keys(defaultQuizFilters()).some((key) => key in query)) return;
    const filters = normalizeQuizFilters(query, course);
    update((draft) => {
      draft.quizFilters = filters;
    });
  }, [course, query, running, update]);
  const art = practiceArtFor(
    course,
    running && state.quiz ? state.quiz.filters : state.quizFilters,
  );
  useEffect(() => {
    document.body.dataset.practiceLesson = art?.id || '';
    return () => {
      document.body.dataset.practiceLesson = '';
    };
  }, [art?.id]);
  const move = useCallback(
    (direction: number) => {
      let foundMissing = false;
      update((draft) => {
        foundMissing = moveQuestion(draft, direction).foundMissing;
      });
      if (foundMissing)
        notify('Đã tới câu chưa trả lời. Hoàn thành các câu còn lại để xem kết quả.');
    },
    [update, notify],
  );

  function changeFilters(value: Partial<QuizFilters>) {
    const filters = normalizeQuizFilters(value, course);
    update((draft) => {
      draft.quizFilters = filters;
    });
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== ''));
    router.replace(`/quiz?${params}`, { scroll: false });
  }
  if (!running || !state.quiz)
    return (
      <QuizSetup
        course={course}
        bank={bank}
        state={state}
        onFilter={changeFilters}
        onStart={() => {
          const session = createQuizSession(
            filterQuestions(bank, state.quizFilters, state.reviews),
            state.quizFilters,
          );
          if (!session) return;
          update((draft) => activateQuizSession(draft, session));
          router.push('/quiz/run');
        }}
        onResume={(id) => {
          if (id) {
            const saved = state.quizSessions.find((session) => session.id === id);
            if (saved) update((draft) => activateQuizSession(draft, saved));
          }
          router.push('/quiz/run');
        }}
      />
    );
  if (state.quiz.index >= state.quiz.ids.length) return <QuizResult onBack={() => move(-1)} />;
  const question = bank.find((item) => item.id === state.quiz!.ids[state.quiz!.index]);
  if (!question)
    return <p role="alert">Câu hỏi này chưa có trong bộ nội dung. Hãy mở lại bộ lọc luyện tập.</p>;
  return (
    <QuizRun
      onMove={move}
      onAnswer={(selected) => update((draft) => answerQuestion(draft, question, selected))}
      onEssay={(method) => {
        let saved = false;
        update((draft) => {
          saved = saveEssayScore(draft, question, method);
          if (saved) moveQuestion(draft, 1);
        });
        if (!saved) notify('Bài làm đã thay đổi. Hãy chấm lại trước khi lưu điểm Gemini.');
      }}
    />
  );
}
