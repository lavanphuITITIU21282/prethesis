'use client';

import React from 'react';

import Link from 'next/link';
import { useState } from 'react';
import { nextReview, normalize, shuffled } from '@/shared/domain/study-core.js';
import { PageHead, Progress, TermAnnotation } from '@/shared/ui/primitives';
import { useStudy } from '@/modules/learning/presentation/study-provider';

export default function Flashcards({ query }: { query: Record<string, string> }) {
  const { course, state, update, notify } = useStudy();
  const [ids, setIds] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  function start() {
    const all = course.terms.filter(
      (term) =>
        (!query.module || term.module === query.module) &&
        normalize(
          `${term.name} ${term.vi} ${term.englishFull || ''} ${term.definition} ${term.scenario}`,
        ).includes(normalize(query.q || '')) &&
        (!query.status ||
          (query.status === 'new'
            ? !state.reviews[term.id]
            : query.status === 'seen'
              ? !!state.reviews[term.id]
              : state.reviews[term.id]?.due <= Date.now())),
    );
    if (!all.length) {
      notify('Không có thẻ khớp bộ lọc. Hãy đổi phạm vi.');
      return;
    }
    const due = all.filter((term) => state.reviews[term.id]?.due <= Date.now());
    const unseen = all.filter((term) => !state.reviews[term.id]);
    setIds(
      (due.length ? due : unseen.length ? unseen : shuffled(all))
        .slice(0, 10)
        .map((term) => term.id),
    );
    setIndex(0);
    setFlipped(false);
  }
  const term = course.terms.find((item) => item.id === ids[index]);
  return (
    <>
      <PageHead
        title={ids.length && !term ? 'Đã xong một lượt ôn.' : 'Gặp lại một khái niệm.'}
        subtitle="Tối đa 10 thẻ mỗi lượt. Thử nói nghĩa và một ví dụ trước khi lật thẻ."
      />
      <div className="card flashcard">
        {!term ? (
          <>
            <div className="score">{ids.length ? '✓' : '學'}</div>
            <h2>
              {ids.length ? `${ids.length} thẻ đã được lên lịch ôn` : 'Sẵn sàng gặp lại kiến thức?'}
            </h2>
            <p className="muted mt">Ưu tiên thẻ đến hạn, sau đó đến thẻ mới.</p>
            <div className="inline-actions mt">
              <button className="btn" onClick={start}>
                {ids.length ? 'Ôn thêm một lượt' : 'Bắt đầu ôn thẻ'}
              </button>
              <Link className="btn secondary" href="/glossary">
                Về thuật ngữ
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="flash-count">
              {index + 1} / {ids.length} thẻ
            </div>
            <Progress value={Math.round((index / ids.length) * 100)} />
            <div className="flash-face">
              <span className="tag">
                {course.modules.find((item) => item.id === term.module)?.title}
              </span>
              <h2 lang="en">{term.name}</h2>
              {flipped ? (
                <>
                  <TermAnnotation term={term} />
                  <p>{term.definition}</p>
                  <div className="callout">
                    {term.scenario}
                    <br />
                    <b>Dễ nhầm:</b> {term.pitfall}
                  </div>
                </>
              ) : (
                <p className="muted">Bạn sẽ giải thích thuật ngữ này thế nào?</p>
              )}
            </div>
            {flipped ? (
              <div className="rating-row">
                {['Còn vướng · 10 phút', 'Nhớ một phần', 'Đã nhớ'].map((label, quality) => (
                  <button
                    className={`btn ${quality < 2 ? 'secondary' : ''}`}
                    key={quality}
                    onClick={() => {
                      update((draft) => {
                        draft.reviews[term.id] = nextReview(draft.reviews[term.id], quality);
                      });
                      setIndex((value) => value + 1);
                      setFlipped(false);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <button className="btn" onClick={() => setFlipped(true)}>
                Lật thẻ để đối chiếu
              </button>
            )}
            <div className="mt">
              <Link className="text-link" href={`/learn/${term.lesson}/0`}>
                Mở bài gốc →
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
