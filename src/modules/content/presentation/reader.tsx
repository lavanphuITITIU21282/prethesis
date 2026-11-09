'use client';

import React from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { studyGuideHTML } from '@/modules/content/presentation/renderers/study-guide.js';
import { dateKey } from '@/shared/domain/date';
import { useStudy } from '@/modules/learning/presentation/study-provider';
import { useUI } from '@/shared/ui/ui-context';
import { Icon, PageHead, TermLabel } from '@/shared/ui/primitives';

export default function Reader({ lessonId, part = '0' }: { lessonId?: string; part?: string }) {
  const { course, sources, state, update, warning, accountId } = useStudy();
  const { openTerm, openSource } = useUI();
  const router = useRouter();
  const lesson = course.lessons.find((item) => item.id === lessonId);
  const index = Number(part);
  const section =
    lesson && Number.isInteger(index) && index >= 0 ? lesson.sections[index] : undefined;
  const chapter = course.modules.find((item) => item.id === lesson?.module);
  const html = useMemo(
    () =>
      lesson && section
        ? studyGuideHTML(section, lesson, course, sources).replaceAll('href="#/', 'href="/')
        : '',
    [course, sources, lesson, section],
  );

  useEffect(() => {
    if (lesson && state.lastLesson !== lesson.id)
      update((draft) => {
        draft.lastLesson = lesson.id;
      });
  }, [lesson, state.lastLesson, update]);
  if (!lesson || !section || !chapter)
    return (
      <PageHead
        title="Chưa tìm thấy phần học."
        subtitle="Chọn một bài trong lộ trình để tiếp tục."
      />
    );

  function completePart() {
    if (!lesson) return;
    update((draft) => {
      const read = (draft.read[lesson.id] ??= []);
      if (!read.includes(index)) {
        read.push(index);
        (draft.activity[dateKey()] ??= { sections: 0, minutes: 0 }).sections++;
      }
    });
    if (index < lesson.sections.length - 1) router.push(`/learn/${lesson.id}/${index + 1}`);
  }
  const terms = section.terms
    .map((id) => course.terms.find((term) => term.id === id))
    .filter((term) => term !== undefined);
  return (
    <>
      <button
        className="btn secondary focus-exit"
        onClick={() =>
          update((draft) => {
            draft.settings.focus = false;
          })
        }
      >
        ↙ Thoát tập trung
      </button>
      <div className="focus-banner">
        <Link className="text-link" href={`/path/${chapter.id}`}>
          ← Chương {chapter.number} · {chapter.title}
        </Link>
        <button
          className="btn secondary small"
          onClick={() =>
            update((draft) => {
              draft.settings.focus = !draft.settings.focus;
            })
          }
        >
          <Icon name="leaf" /> {state.settings.focus ? 'Thoát tập trung' : 'Tập trung'}
        </button>
      </div>
      <div className="reader-layout">
        <article className="reader">
          <header className="reader-title-panel">
            <span className="eyebrow">SỔ TAY AN TOÀN THÔNG TIN · CHƯƠNG {chapter.number}</span>
            <h1>{lesson.title}</h1>
            <p className="reader-intro">{lesson.summary}</p>
            <div className="reader-passport">
              <span>
                Phần {index + 1} / {lesson.sections.length}
              </span>
              <span>~{section.minutes} phút đọc & tự kiểm tra</span>
              <span>{terms.length} thuật ngữ</span>
            </div>
          </header>
          <nav className="step-track" aria-label="Các phần trong bài">
            {lesson.sections.map((item, number) => (
              <button
                key={item.title}
                className={
                  number === index
                    ? 'current'
                    : state.read[lesson.id]?.includes(number)
                      ? 'done'
                      : ''
                }
                onClick={() => router.push(`/learn/${lesson.id}/${number}`)}
                aria-current={number === index ? 'step' : undefined}
                aria-label={`Phần ${number + 1}: ${item.title}`}
              >
                <span className="reader-step-index">
                  {state.read[lesson.id]?.includes(number) ? '✓' : number + 1}
                </span>
                <span className="reader-step-title">{item.title}</span>
              </button>
            ))}
          </nav>
          <div className="step-label">
            <span>
              Phần {index + 1} / {lesson.sections.length}
            </span>
            <span>Khoảng {section.minutes} phút đọc và tự kiểm tra</span>
          </div>
          <section className="reader-body">
            <h2>
              <span className="section-kicker">
                PHẦN {index + 1} / {lesson.sections.length}
              </span>
              {section.title}
            </h2>
            <p>{section.body}</p>
            {index === 0 && (
              <figure className="reader-figure">
                <picture>
                  <source
                    media="(max-width: 760px)"
                    srcSet={lesson.diagram.replace('.svg', '-mobile.svg')}
                  />
                  <img
                    src={lesson.diagram}
                    alt={`Sơ đồ: ${lesson.flow.join(' → ')}`}
                    loading="lazy"
                  />
                </picture>
                <figcaption>Sơ đồ ghi nhớ · {lesson.flow.join(' → ')}</figcaption>
              </figure>
            )}
            {/* Authored prose uses the existing escaped renderer; React owns all application state and events. */}
            <div
              onClick={(event) => {
                const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
                if (target?.dataset.action === 'term') openTerm(target.dataset.id || '');
                if (target?.dataset.action === 'source')
                  openSource(target.dataset.id || '', Number(target.dataset.page));
              }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </section>
          <div className="callout">
            <strong>DỪNG 10 GIÂY ĐỂ NHỚ LẠI</strong>Không nhìn phần trên: giải thích “
            {terms[0]?.name}” bằng lời của bạn và nêu một trường hợp dễ hiểu nhầm.
          </div>
          <div className="inline-actions mt">
            <Link className="text-link" href={`/quiz?lesson=${lesson.id}&section=${index}`}>
              Luyện riêng phần {index + 1} →
            </Link>
          </div>
          <div className="reader-actions">
            <Link
              className="btn secondary"
              href={index ? `/learn/${lesson.id}/${index - 1}` : `/path/${chapter.id}`}
            >
              {index ? '← Phần trước' : '← Chương học'}
            </Link>
            <button className="btn" onClick={completePart}>
              {state.read[lesson.id]?.includes(index) ? 'Đã ghi nhận' : 'Đã hiểu'}
              {index < lesson.sections.length - 1 ? ' · Phần tiếp →' : ' · Hoàn thành bài'}
            </button>
          </div>
          {(state.read[lesson.id] || []).length === lesson.sections.length && (
            <div className="section-complete">
              ✓ Bạn đã đọc đủ các phần. Tiếp theo, thử nhớ lại và kiểm tra qua câu hỏi.
              <div className="inline-actions mt">
                <Link className="btn" href={`/quiz?lesson=${lesson.id}`}>
                  Luyện bài này
                </Link>
                <Link className="btn secondary" href={`/quiz?lesson=${lesson.id}&kind=boss`}>
                  Tự luận chuyên sâu
                </Link>
              </div>
            </div>
          )}
          <details>
            <summary>Đối chiếu hình và trang tài liệu gốc</summary>
            <div>
              <a
                href={`/documents/${lesson.source}#page=${lesson.slidePage}`}
                target="_blank"
                rel="noopener"
              >
                <img
                  src={lesson.slide}
                  loading="lazy"
                  alt={`Slide gốc trang ${lesson.slidePage}: ${lesson.title}`}
                />
              </a>
              <p>
                Các trang tham chiếu: {lesson.pages.join(', ')}. Bài tiếng Việt có bổ sung giải
                thích; đối chiếu slide khi cần.
              </p>
              <button
                className="btn secondary small"
                onClick={() => openSource(lesson.source, lesson.slidePage)}
              >
                Đọc chữ theo trang
              </button>
            </div>
          </details>
        </article>
        <aside className="reader-side stack">
          <section className="card">
            <h2>Trong bài này</h2>
            <div className="reader-toc">
              {lesson.sections.map((item, number) => (
                <button
                  key={item.title}
                  className={`outline-link ${number === index ? 'current' : ''}`}
                  onClick={() => router.push(`/learn/${lesson.id}/${number}`)}
                >
                  <span>{number + 1}.</span>
                  {item.title}
                </button>
              ))}
            </div>
            <Link className="text-link mt" href={`/quiz?lesson=${lesson.id}&section=${index}`}>
              Luyện riêng phần {index + 1} →
            </Link>
            <Link className="text-link mt" href={`/quiz?lesson=${lesson.id}`}>
              Luyện toàn bộ bài →
            </Link>
          </section>
          <section className="card">
            <h2>Thuật ngữ trong phần này</h2>
            <div className="term-pills">
              {terms.map((term) => (
                <button className="term-pill" key={term.id} onClick={() => openTerm(term.id)}>
                  <TermLabel term={term} />
                </button>
              ))}
            </div>
          </section>
          <section className="card">
            <h2>Ghi chú của mình</h2>
            <label className="wide">
              <span className="eyebrow">MỘT VÍ DỤ HOẶC MỘT ĐIỀU CÒN VƯỚNG</span>
              <textarea
                className="note"
                rows={7}
                maxLength={50000}
                value={state.notes[lesson.id] || ''}
                onChange={(event) =>
                  update((draft) => {
                    draft.notes[lesson.id] = event.target.value;
                  })
                }
              />
            </label>
            <small className="save-label">
              {warning ||
                (accountId
                  ? 'Tự lưu nháp trên thiết bị và đồng bộ lên tài khoản.'
                  : 'Tự lưu trên trình duyệt này.')}
            </small>
          </section>
        </aside>
      </div>
    </>
  );
}
