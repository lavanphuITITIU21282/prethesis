'use client';

import React from 'react';

import Link from 'next/link';
import { useEffect } from 'react';
import { recordQuizResult } from '@/modules/assessment/domain/quiz-operations';
import { PageHead } from '@/shared/ui/primitives';
import { useStudy } from '@/modules/learning/presentation/study-provider';

export function QuizResult({ onBack }: { onBack(): void }) {
  const { course, bank, state, update } = useStudy();
  const session = state.quiz!;
  useEffect(() => {
    if (!session.recorded) update((draft) => recordQuizResult(draft, bank));
  }, [session.recorded, bank, update]);
  const questions = session.ids
    .map((id) => bank.find((question) => question.id === id)!)
    .filter(Boolean);
  const mcq = questions.filter((question) => question.kind !== 'boss');
  const bosses = questions.filter((question) => question.kind === 'boss');
  const correct = mcq.filter((question) => session.answers[question.id]?.correct).length;
  return (
    <>
      <PageHead
        title="Đã hoàn thành một lượt."
        subtitle="Điều còn vướng sẽ là điểm bắt đầu cho lần ôn tiếp theo."
      />
      <div className="card quiz-shell practice-result">
        <span className="eyebrow">KẾT QUẢ TRẮC NGHIỆM</span>
        <div className="score">
          {correct}
          <span className="muted"> / {mcq.length}</span>
        </div>
        <p className="muted">
          {mcq.length
            ? `${Math.round((correct / mcq.length) * 100)}% câu trả lời đúng trong lượt này.`
            : 'Lượt này chỉ có tự luận.'}
        </p>
        <div className="inline-actions mt">
          <button className="btn secondary" onClick={onBack}>
            ← Xem lại câu cuối
          </button>
          <Link className="btn" href="/quiz">
            Luyện lượt mới
          </Link>
          <Link className="btn secondary" href="/flash">
            Ôn thẻ đến hạn
          </Link>
          <Link className="btn secondary" href="/progress">
            Xem tiến độ
          </Link>
        </div>
        <hr />
        <h2>Các ý cần xem lại</h2>
        {mcq
          .filter((question) => !session.answers[question.id]?.correct)
          .map((question) => (
            <div className="result-item" key={question.id}>
              <strong>{question.prompt}</strong>
              <p>{question.explanation}</p>
              <Link
                className="text-link"
                href={`/learn/${question.lesson}/${question.sections?.[0] ?? 0}`}
              >
                Đọc lại bài →
              </Link>
            </div>
          ))}
        {mcq.every((question) => session.answers[question.id]?.correct) && (
          <p className="status-note">Không có câu trắc nghiệm trả lời sai trong lượt này.</p>
        )}
        {bosses.map((question) => (
          <div className="result-item" key={question.id}>
            <strong>
              {course.lessons.find((lesson) => lesson.id === question.lesson)?.title} ·{' '}
              {session.answers[question.id]?.selfRated === false ? 'Gemini' : 'Tự chấm'}{' '}
              {session.answers[question.id]?.score}/10
            </strong>
            <p>{question.prompt}</p>
          </div>
        ))}
      </div>
    </>
  );
}
