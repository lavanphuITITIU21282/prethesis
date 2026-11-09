'use client';

import React from 'react';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { practiceArtFor, quizScopeLabel } from '@/modules/assessment/domain/practice-metadata.js';
import { Progress, TermAnnotation } from '@/shared/ui/primitives';
import { useStudy } from '@/modules/learning/presentation/study-provider';
import { GradingPanel } from './grading-panel';

interface RunProps {
  onMove(direction: number): void;
  onAnswer(selected: string): void;
  onEssay(method: 'self' | 'gemini'): void;
}
export function QuizRun({ onMove, onAnswer, onEssay }: RunProps) {
  const { course, bank, state, update, warning } = useStudy();
  const session = state.quiz!;
  const question = bank.find((item) => item.id === session.ids[session.index])!;
  const lesson = course.lessons.find((item) => item.id === question.lesson)!;
  const answer = session.answers[question.id];
  const art = practiceArtFor(course, session.filters);
  const card = useRef<HTMLElement>(null);
  const remaining = session.ids.filter((id) => !session.answers[id]).length;
  const labels: Record<string, string> = {
    recall: 'Thuật ngữ',
    application: 'Tình huống',
    syntax: 'Cú pháp',
    boss: 'Chuyên sâu',
  };
  const term = course.terms.find((item) => item.id === question.term);
  const options = (
    session.orders[question.id] ||
    question.options?.map((option) => option.id) ||
    []
  )
    .map((id) => question.options?.find((option) => option.id === id))
    .filter((option) => option !== undefined);
  useEffect(() => {
    card.current?.focus({ preventScroll: true });
    card.current?.scrollIntoView?.({ block: 'start' });
  }, [session.index, session.id]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        !['ArrowLeft', 'ArrowRight'].includes(event.key) ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.isComposing ||
        event.defaultPrevented
      )
        return;
      const target = event.target as HTMLElement;
      if (
        target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])') ||
        document.querySelector<HTMLDialogElement>('#modal')?.open
      )
        return;
      event.preventDefault();
      if (!event.repeat) onMove(event.key === 'ArrowLeft' ? -1 : 1);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onMove]);
  const readLink = (
    <Link
      className="text-link"
      href={`/learn/${question.lesson}/${session.filters.section !== '' && session.filters.lesson === question.lesson ? session.filters.section : (question.sections?.[0] ?? 0)}`}
    >
      Đọc lại bài →
    </Link>
  );
  return (
    <div className="quiz-shell practice-run">
      <div className="practice-run-masthead">
        <div>
          <span className="practice-overline">MẶC NGUYỆT / KHẢO VIỆN</span>
          <strong>Mỗi câu, một tầng hiểu.</strong>
        </div>
        <img
          src={art?.small || '/assets/backgrounds/practice-background-v2-960.webp'}
          width="960"
          height="480"
          alt=""
          aria-hidden="true"
        />
        <span className="practice-run-seal" aria-hidden="true">
          思
        </span>
      </div>
      <div className="quiz-status">
        <span>
          Câu {session.index + 1} / {session.ids.length} · {labels[question.kind]}
        </span>
        <Link className="text-link" href="/quiz">
          Tạm dừng lượt học
        </Link>
      </div>
      <nav className="quiz-navigation" aria-label="Chuyển câu hỏi">
        <button
          className="btn secondary small"
          aria-keyshortcuts="ArrowLeft"
          disabled={session.index === 0}
          onClick={() => onMove(-1)}
        >
          ← Câu trước
        </button>
        <span>
          <kbd>←</kbd> / <kbd>→</kbd> chuyển câu
          {remaining > 0 && ` · Còn ${remaining} câu chưa trả lời`}
        </span>
        <button
          className="btn secondary small"
          aria-keyshortcuts="ArrowRight"
          onClick={() => onMove(1)}
        >
          {session.index === session.ids.length - 1
            ? remaining
              ? 'Tới câu chưa làm →'
              : 'Xem kết quả →'
            : 'Câu sau →'}
        </button>
      </nav>
      <Progress
        value={Math.round((Object.keys(session.answers).length / session.ids.length) * 100)}
      />
      <p className="quiz-scope-caption">{quizScopeLabel(course, session.filters)}</p>
      <p className="status-note quiz-save-status">
        {warning || '✓ Phiên tự lưu · Có thể tạm dừng hoặc đóng trang rồi tiếp tục.'}
      </p>
      <article
        ref={card}
        id="quiz-question-card"
        className="card quiz-card mt"
        tabIndex={-1}
        aria-labelledby="quiz-prompt"
        data-question-kind={question.kind}
      >
        <div className="practice-paper-meta">
          <span>
            {question.kind === 'boss'
              ? 'LUYỆN TẬP SÂU · LẬP LUẬN & PHẢN BIỆN'
              : 'THỬ NHỚ TRƯỚC KHI XEM LỜI GIẢI'}
          </span>
          <b aria-hidden="true">{String(session.index + 1).padStart(2, '0')}</b>
        </div>
        <span className={`tag ${question.kind === 'boss' ? 'purple' : ''}`}>{lesson.title}</span>
        <h2 id="quiz-prompt">{question.prompt}</h2>
        {question.code && (
          <pre>
            <code>{question.code}</code>
          </pre>
        )}
        {question.kind === 'boss' ? (
          <>
            <label>
              Phần lập luận của bạn
              <textarea
                data-draft={lesson.id}
                maxLength={50000}
                rows={7}
                placeholder="Nêu giả định, tính toán, phản ví dụ và giới hạn của thiết kế…"
                value={state.drafts[lesson.id] || ''}
                onChange={(event) =>
                  update((draft) => {
                    draft.drafts[lesson.id] = event.target.value;
                  })
                }
              />
            </label>
            <p className="status-note">
              Bản nháp tự lưu. Chọn Gemini để nhận điểm và nhận xét, hoặc tự đối chiếu rubric bên
              dưới.
            </p>
            <div id="ai-grading-panel" data-lesson={lesson.id}>
              <GradingPanel key={lesson.id} lesson={lesson} onSave={() => onEssay('gemini')} />
            </div>
            <details open={!!answer}>
              <summary>Xem lời giải phân tích & tự chấm</summary>
              <div>
                {lesson.challenge.rubric.map((rubric, index) => (
                  <div className="rubric" key={index}>
                    <p>
                      <b>
                        Tiêu chí {index + 1} · {rubric.points} điểm.
                      </b>{' '}
                      {rubric.text}
                    </p>
                    <label>
                      Điểm tự đối chiếu
                      <select
                        aria-label={`Điểm tiêu chí ${index + 1}`}
                        value={state.bossScores[lesson.id]?.[index] || 0}
                        onChange={(event) =>
                          update((draft) => {
                            const scores = (draft.bossScores[lesson.id] ??= [0, 0, 0, 0]);
                            scores[index] = Number(event.target.value);
                          })
                        }
                      >
                        {Array.from({ length: rubric.points + 1 }, (_, value) => (
                          <option key={value} value={value}>
                            {value} / {rubric.points}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}
                <p className="status-note">
                  Điểm này là tự chấm, không tính vào tỷ lệ đúng trắc nghiệm.
                </p>
              </div>
            </details>
            <div className="quiz-bottom">
              {readLink}
              <button className="btn" onClick={() => onEssay('self')}>
                Lưu tự chấm · Câu tiếp →
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="answers">
              {options.map((option, index) => (
                <button
                  key={option.id}
                  data-answer={option.id}
                  className={`answer ${answer ? (option.id === question.correct ? 'correct' : option.id === answer.selected ? 'wrong' : '') : ''}`}
                  disabled={!!answer}
                  onClick={() => onAnswer(option.id)}
                >
                  <span className="letter">{String.fromCharCode(65 + index)}</span>
                  <span>{option.text}</span>
                </button>
              ))}
            </div>
            {answer && (
              <div className={`feedback ${answer.correct ? '' : 'wrong'}`} role="status">
                <h3>
                  {answer.correct
                    ? '✓ Đúng rồi. Thử giải thích lại để nhớ lâu hơn.'
                    : 'Cùng xem lại một chút.'}
                </h3>
                <p>{question.explanation}</p>
                {term && <TermAnnotation term={term} />}
                {!answer.correct && (
                  <p className="mt">
                    <b>Bạn chọn:</b>{' '}
                    {question.options?.find((option) => option.id === answer.selected)?.text}
                    <br />
                    <b>Đáp án phù hợp:</b>{' '}
                    {question.options?.find((option) => option.id === question.correct)?.text}
                  </p>
                )}
              </div>
            )}
            <div className="quiz-bottom">
              {readLink}
              {answer ? (
                <button className="btn" onClick={() => onMove(1)}>
                  {session.index === session.ids.length - 1 ? 'Xem kết quả →' : 'Câu tiếp →'}
                </button>
              ) : (
                <span className="muted">Chọn một đáp án để xem giải thích</span>
              )}
            </div>
          </>
        )}
      </article>
    </div>
  );
}
