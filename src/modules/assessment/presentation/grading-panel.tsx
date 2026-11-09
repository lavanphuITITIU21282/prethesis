'use client';

import React from 'react';

import { useEffect, useRef, useState } from 'react';
import { gradeMatchesAnswer } from '@/shared/domain/grade.js';
import { studyApiService } from '@/modules/assessment/client';
import type { Grade, Lesson } from '@/shared/domain/models';
import { useStudy } from '@/modules/learning/presentation/study-provider';

interface GradingViewProps {
  lesson: Lesson;
  grade?: Grade;
  answer?: string;
  busy?: boolean;
  error?: string;
  available?: boolean;
  checking?: boolean;
  onGrade?(): void;
  onSave?(): void;
}
export function GradingView({
  lesson,
  grade,
  answer = '',
  busy = false,
  error = '',
  available = false,
  checking = false,
  onGrade,
  onSave,
}: GradingViewProps) {
  const fresh = gradeMatchesAnswer(grade, answer);
  return (
    <section className="ai-grading" aria-labelledby={`ai-title-${lesson.id}`}>
      <div className="ai-grading-heading">
        <div>
          <span className="eyebrow">PHẢN HỒI THEO RUBRIC</span>
          <h3 id={`ai-title-${lesson.id}`}>Chấm bài bằng Gemini</h3>
        </div>
        <span className="tag">AI · 10 điểm</span>
      </div>
      <p className="ai-service-note">
        {checking
          ? 'Đang kiểm tra kết nối máy chủ…'
          : available
            ? 'Gemini chấm theo 4 tiêu chí, tổng 10 điểm.'
            : 'Gemini chưa được cấu hình hoặc máy chủ chưa kết nối được. Bạn vẫn có thể tự chấm bên dưới.'}
      </p>
      <p className="ai-data-note">
        Khi bấm chấm, bài làm, đề và rubric của bài này được gửi tới Google Gemini. Cần Internet
        trên máy chủ. Khóa API chỉ lưu ở máy chủ.
      </p>
      <div className="inline-actions">
        <button
          className="btn"
          data-action="ai-grade"
          disabled={busy || !available}
          onClick={onGrade}
        >
          {busy ? 'Đang chấm…' : grade ? 'Chấm lại bằng Gemini' : 'Chấm bằng Gemini'}
        </button>
        <span className="count-label">
          Tối đa 20.000 ký tự · Phản hồi bằng tiếng Việt, thuật ngữ tiếng Anh
        </span>
      </div>
      {busy && (
        <p className="ai-pending" role="status">
          Gemini đang đọc lập luận và đối chiếu từng tiêu chí. Bản nháp vẫn được giữ.
        </p>
      )}
      {error && (
        <p className="ai-error" role="alert">
          {error}
        </p>
      )}
      {grade && (
        <div className={`ai-grade-result ${fresh ? '' : 'is-stale'}`}>
          <div className="ai-result-top">
            <div>
              <strong className="ai-score">
                {grade.score}
                <small>/10</small>
              </strong>
              <span className="ai-score-label">Điểm Gemini · {grade.model}</span>
            </div>
            <small>{new Date(grade.gradedAt).toLocaleString('vi-VN')}</small>
          </div>
          {!fresh && (
            <p className="ai-stale" role="status">
              Bài làm đã thay đổi sau lần chấm này. Điểm dưới đây thuộc bản trước; hãy chấm lại để
              dùng điểm AI.
            </p>
          )}
          <p className="ai-summary">{grade.summary}</p>
          <div className="ai-criteria">
            {grade.criteria.map((criterion) => (
              <article className="ai-criterion" key={criterion.criterionIndex}>
                <div>
                  <h4>Tiêu chí {criterion.criterionIndex}</h4>
                  <b>
                    {criterion.score}/{criterion.maxPoints}
                  </b>
                </div>
                <p>{criterion.feedback}</p>
                {criterion.evidence && <blockquote>{criterion.evidence}</blockquote>}
                {criterion.improvement && (
                  <p className="ai-improvement">
                    <strong>Cải thiện:</strong> {criterion.improvement}
                  </p>
                )}
              </article>
            ))}
          </div>
          {(
            [
              ['Điểm làm tốt', grade.strengths],
              ['Điểm còn thiếu', grade.gaps],
              ['Bước tiếp theo', grade.nextSteps],
            ] as const
          ).map(
            ([title, items]) =>
              items.length > 0 && (
                <div className="ai-feedback-list" key={title}>
                  <h4>{title}</h4>
                  <ul>
                    {items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              ),
          )}
          <p className="status-note">
            Phản hồi AI hỗ trợ luyện tập, có thể chưa chính xác. Điểm tự chấm được giữ riêng.
          </p>
          {fresh && (
            <button className="btn mt" data-action="boss-ai-next" onClick={onSave}>
              Lưu điểm Gemini · Câu tiếp →
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export function GradingPanel({ lesson, onSave }: { lesson: Lesson; onSave(): void }) {
  const { state, update } = useStudy();
  const [available, setAvailable] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const active = useRef<AbortController | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    studyApiService
      .isGradingAvailable(controller.signal)
      .then(setAvailable)
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setChecking(false);
      });
    return () => {
      controller.abort();
      active.current?.abort();
    };
  }, []);
  async function grade() {
    const answer = (state.drafts[lesson.id] || '').trim();
    if (answer.length < 10 || answer.length > 20000) {
      setError('Hãy viết từ 10 đến 20.000 ký tự trước khi chấm. Bản nháp vẫn được giữ.');
      return;
    }
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    const timeout = setTimeout(() => controller.abort(), 75000);
    setBusy(true);
    setError('');
    try {
      const result = await studyApiService.grade(lesson, answer, controller.signal);
      update((draft) => {
        draft.aiGrades[lesson.id] = result;
      });
    } catch (error) {
      setError(
        error instanceof Error && error.name !== 'AbortError'
          ? error.message
          : 'Chờ Gemini quá lâu. Bản nháp vẫn được giữ.',
      );
    } finally {
      clearTimeout(timeout);
      active.current = null;
      setBusy(false);
    }
  }
  return (
    <GradingView
      lesson={lesson}
      grade={state.aiGrades[lesson.id]}
      answer={state.drafts[lesson.id]}
      available={available}
      checking={checking}
      busy={busy}
      error={error}
      onGrade={grade}
      onSave={onSave}
    />
  );
}
