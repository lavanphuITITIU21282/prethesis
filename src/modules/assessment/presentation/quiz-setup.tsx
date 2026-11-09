'use client';

import React from 'react';

import type {
  Course,
  Question,
  QuizFilters,
  QuizSession,
  StudyState,
} from '@/shared/domain/models';
import { filterQuestions } from '@/shared/domain/study-core.js';
import {
  practiceArtFor,
  quizLabels,
  quizScopeLabel,
} from '@/modules/assessment/domain/practice-metadata.js';

interface SetupProps {
  course: Course;
  bank: Question[];
  state: StudyState;
  onFilter(filters: Partial<QuizFilters>): void;
  onStart(): void;
  onResume(id?: string): void;
}
export function QuizSetup({ course, bank, state, onFilter, onStart, onResume }: SetupProps) {
  const filters = state.quizFilters;
  const art = practiceArtFor(course, filters);
  const lesson = course.lessons.find((item) => item.id === filters.lesson);
  const pool = filterQuestions(bank, filters, state.reviews);
  const deep = pool.filter((question) => question.kind === 'boss').length;
  const change = (key: keyof QuizFilters, value: string) => {
    const next = { ...filters, [key]: value };
    if (key === 'module') {
      next.lesson = '';
      next.section = '';
      next.term = '';
    }
    if (key === 'lesson') {
      next.section = '';
      next.term = '';
    }
    if (key === 'section') next.term = '';
    onFilter(next);
  };
  const session = (item: QuizSession, current: boolean) => (
    <div className="quiz-session" key={item.id}>
      <div>
        <strong>{quizScopeLabel(course, item.filters)}</strong>
        <p>
          {Object.keys(item.answers).length}/{item.ids.length} câu đã làm ·{' '}
          {item.index >= item.ids.length ? 'Đã hoàn thành' : `Đang ở câu ${item.index + 1}`}
        </p>
      </div>
      <button
        className="btn secondary small"
        data-action={current ? 'quiz-resume' : 'quiz-open'}
        onClick={() => onResume(current ? undefined : item.id)}
      >
        {item.index >= item.ids.length
          ? 'Xem kết quả'
          : current
            ? 'Tiếp tục phiên'
            : 'Mở lại phiên'}
      </button>
    </div>
  );
  return (
    <div className="practice-setup">
      <section className="practice-hero" aria-labelledby="practice-title">
        <div className="practice-hero-copy">
          <span className="practice-overline">MẶC NGUYỆT / KHẢO VIỆN TRI THỨC</span>
          {art && <span className="practice-lesson-tag">BÀI LUYỆN · {art.lessonTitle}</span>}
          <h1 id="practice-title">
            Luyện trí.
            <br />
            <em>Hiểu đến tận cùng.</em>
          </h1>
          <p>
            Một câu hỏi, một tầng hiểu biết.
            <br />
            Thử nhớ, thử giải thích, rồi đối chiếu để đi sâu hơn.
          </p>
          <div className="practice-hero-facts">
            <span>
              <b>{bank.length}</b> câu hỏi
            </span>
            <span>
              <b>{bank.filter((question) => question.kind === 'boss').length}</b> bài luyện sâu
            </span>
            <span>Không giới hạn thời gian</span>
          </div>
        </div>
        <div className="practice-diptych" aria-hidden="true">
          <img
            src={art?.src || '/assets/backgrounds/practice-background-v2.webp'}
            srcSet={art ? `${art.thumb} 480w, ${art.small} 960w, ${art.src} 1536w` : undefined}
            sizes="(max-width:760px) 95vw, 80vw"
            width="1536"
            height="768"
            alt=""
          />
          <span className="practice-art-seal">
            思<br />學
          </span>
        </div>
      </section>
      <ol className="practice-ritual" aria-label="Nhịp luyện tập">
        {['Chọn điều muốn hiểu', 'Thử bằng trí nhớ', 'Đọc lại, hiểu sâu hơn'].map((text, index) => (
          <li key={text}>
            <span>0{index + 1}</span>
            {text}
          </li>
        ))}
      </ol>
      {state.quiz && (
        <section className="card quiz-resume-card mb">
          {session(state.quiz, true)}
          <p className="status-note">Tự lưu câu đang làm, đáp án và thứ tự câu.</p>
        </section>
      )}
      {state.quizSessions.length > 0 && (
        <details className="card quiz-session-history mb">
          <summary>Các phiên trước · {state.quizSessions.length}</summary>
          {state.quizSessions.map((item) => session(item, false))}
          <p className="status-note">Giữ tối đa 20 phiên trước cùng phiên gần nhất.</p>
        </details>
      )}
      <div className="quiz-mode-grid">
        {[
          ['recall', 'Nhớ thuật ngữ', 'Định nghĩa và nhận diện tên.', 'scroll', '憶'],
          ['application', 'Đặt vào tình huống', 'Chọn khái niệm theo ngữ cảnh.', 'compass', '辨'],
          ['syntax', 'Đọc hiểu câu lệnh', 'Từng token có mục đích gì?', 'brush', '解'],
          [
            'boss',
            'Thử thách chuyên sâu',
            'Tự luận tổng hợp cả bài, rubric 10 điểm.',
            'seal',
            '思',
          ],
        ].map(([kind, title, detail, icon, glyph], index) => (
          <div className="quiz-mode" data-mode={kind} key={kind}>
            <div className="practice-mode-top">
              <span>QUYỂN 0{index + 1}</span>
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <use href={`/assets/study-emblems.svg#${icon}`} />
              </svg>
            </div>
            <span className="practice-mode-glyph" aria-hidden="true">
              {glyph}
            </span>
            <b>
              {bank.filter((question) => question.kind === kind).length}
              <small> câu</small>
            </b>
            <strong>{title}</strong>
            <p>{detail}</p>
          </div>
        ))}
      </div>
      <section className="card quiz-filter-card">
        <div className="section-heading">
          <div className="practice-filter-heading">
            <span className="practice-overline">SOẠN MỘT PHIÊN HỌC CHO RIÊNG BẠN</span>
            <h2>Chọn đúng phần muốn luyện</h2>
          </div>
          <button className="text-link" onClick={() => onFilter({})}>
            Xóa bộ lọc ↺
          </button>
        </div>
        {filters.term && (
          <p className="mb">
            <span className="tag">
              Thuật ngữ: {course.terms.find((term) => term.id === filters.term)?.name}
            </span>{' '}
            <button className="text-link" onClick={() => onFilter({ ...filters, term: '' })}>
              Bỏ giới hạn thuật ngữ
            </button>
          </p>
        )}
        <div className="toolbar quiz-filters">
          <label>
            1. Chương
            <select
              id="quiz-module"
              value={filters.module}
              onChange={(event) => change('module', event.target.value)}
            >
              <option value="">Tất cả chương</option>
              {course.modules.map((module) => (
                <option key={module.id} value={module.id}>
                  Chương {module.number} · {module.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            2. Bài học
            <select
              id="quiz-lesson"
              value={filters.lesson}
              onChange={(event) => change('lesson', event.target.value)}
            >
              <option value="">Tất cả bài</option>
              {course.lessons
                .filter((item) => !filters.module || item.module === filters.module)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
            </select>
          </label>
          <label>
            3. Phần nhỏ trong bài
            <select
              id="quiz-section"
              disabled={!lesson}
              value={filters.section}
              onChange={(event) => change('section', event.target.value)}
            >
              <option value="">{lesson ? 'Toàn bộ bài' : 'Chọn bài học trước'}</option>
              {lesson?.sections.map((section, index) => (
                <option key={section.title} value={index}>
                  Phần {index + 1} · {section.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Loại câu hỏi
            <select
              id="quiz-kind"
              value={filters.kind}
              onChange={(event) => change('kind', event.target.value)}
            >
              <option value="">Tất cả · Trắc nghiệm + Luyện tập sâu</option>
              {Object.entries(quizLabels).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            Ưu tiên
            <select
              id="quiz-priority"
              value={filters.priority}
              onChange={(event) => change('priority', event.target.value)}
            >
              <option value="all">Toàn bộ kiến thức</option>
              <option value="due">Thuật ngữ đến hạn ôn</option>
              <option value="new">Thuật ngữ chưa ôn</option>
            </select>
          </label>
        </div>
        <p className="quiz-scope-caption">
          Phạm vi: <strong>{quizScopeLabel(course, filters)}</strong>
        </p>
        {filters.section !== '' && (
          <p className="status-note">
            Luyện tập sâu tổng hợp cả bài.{' '}
            <button
              className="text-link"
              data-action="quiz-whole-lesson"
              onClick={() => onFilter({ ...filters, section: '', term: '' })}
            >
              Chuyển sang toàn bộ bài để gồm cả luyện tập sâu →
            </button>
          </p>
        )}
        <p id="quiz-pool-info" className="section-caption" role="status" aria-live="polite">
          {pool.length} câu khớp bộ lọc · {pool.length - deep} trắc nghiệm + {deep} luyện tập sâu ·
          mở đủ {pool.length} câu.
        </p>
        <div className="inline-actions">
          <button
            className="btn"
            data-action="quiz-start"
            disabled={!pool.length}
            onClick={onStart}
          >
            Mở toàn bộ {pool.length} câu →
          </button>
        </div>
        <p className="status-note">
          Bộ lọc cũng được lưu. Trắc nghiệm có đáp án và giải thích; tự luận chấm bằng Gemini hoặc
          tự đối chiếu rubric.
        </p>
      </section>
      <div className="callout practice-colophon">
        <strong>BAO PHỦ THUẬT NGỮ</strong>
        {course.terms.length}/{course.terms.length} thuật ngữ có câu hỏi định nghĩa, nhận diện và
        tình huống. Có thể nghỉ rồi tiếp tục bất cứ lúc nào.
      </div>
    </div>
  );
}
