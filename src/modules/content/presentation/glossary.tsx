'use client';

import React from 'react';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { normalize } from '@/shared/domain/study-core.js';
import { PageHead, TermLabel } from '@/shared/ui/primitives';
import { useStudy } from '@/modules/learning/presentation/study-provider';
import { useUI } from '@/shared/ui/ui-context';
import { useClock } from '@/shared/ui/use-clock';

export default function Glossary() {
  const now = useClock('minute');
  const { course, state } = useStudy();
  const { openTerm } = useUI();
  const [query, setQuery] = useState('');
  const [module, setModule] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const terms = useMemo(
    () =>
      course.terms.filter(
        (term) =>
          (!module || term.module === module) &&
          normalize(
            `${term.name} ${term.vi} ${term.englishFull || ''} ${term.definition} ${term.scenario}`,
          ).includes(normalize(query)) &&
          (!status ||
            (status === 'new'
              ? !state.reviews[term.id]
              : status === 'seen'
                ? !!state.reviews[term.id]
                : state.reviews[term.id]?.due <= now)),
      ),
    [course, module, query, status, state.reviews, now],
  );
  const start = page * 24;
  return (
    <>
      <PageHead
        title="Mỗi thuật ngữ, một ý rõ ràng."
        subtitle="Giữ tên tiếng Anh, hiểu bằng lời của bạn và đặt vào tình huống."
        action={
          <Link
            className="btn"
            href={`/flash?module=${module}&status=${status}&q=${encodeURIComponent(query)}`}
          >
            Ôn vài thẻ →
          </Link>
        }
      />
      <div className="toolbar">
        <label>
          Tìm thuật ngữ
          <input
            id="term-search"
            type="search"
            placeholder="Tên, nghĩa hoặc tình huống…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
          />
        </label>
        <label>
          Chương
          <select
            id="term-module"
            value={module}
            onChange={(event) => {
              setModule(event.target.value);
              setPage(0);
            }}
          >
            <option value="">Tất cả chương</option>
            {course.modules.map((item) => (
              <option value={item.id} key={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Trạng thái
          <select
            id="term-status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
          >
            <option value="">Tất cả</option>
            <option value="new">Chưa ôn</option>
            <option value="due">Đến hạn ôn</option>
            <option value="seen">Đã từng ôn</option>
          </select>
        </label>
      </div>
      <p className="section-caption" id="term-count">
        {terms.length} thuật ngữ · Trang {page + 1}/{Math.max(1, Math.ceil(terms.length / 24))}
      </p>
      <div className="term-grid">
        {terms.slice(start, start + 24).map((term) => (
          <button key={term.id} className="card term-card" onClick={() => openTerm(term.id)}>
            <span className="term-category">
              {course.modules.find((item) => item.id === term.module)?.title}
            </span>
            <h2>
              <TermLabel term={term} />
            </h2>
            <p>{term.definition}</p>
            <span className="text-link">Mở tình huống & chỗ dễ nhầm →</span>
          </button>
        ))}
      </div>
      {!terms.length && <p className="empty">Chưa có thuật ngữ khớp bộ lọc.</p>}
      <div className="inline-actions mt">
        <button
          className="btn secondary"
          disabled={page === 0}
          onClick={() => setPage((value) => value - 1)}
        >
          ← Trang trước
        </button>
        <button
          className="btn secondary"
          disabled={start + 24 >= terms.length}
          onClick={() => setPage((value) => value + 1)}
        >
          Trang sau →
        </button>
      </div>
    </>
  );
}
