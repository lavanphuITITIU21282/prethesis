'use client';

import React from 'react';

import { useEffect, useRef, useState } from 'react';
import { sourceService, type SearchHit } from '@/modules/content/client';
import { PageHead } from '@/shared/ui/primitives';
import { useStudy } from '@/modules/learning/presentation/study-provider';
import { useUI } from '@/shared/ui/ui-context';

export default function Library() {
  const { course, sources } = useStudy();
  const { openSource } = useUI();
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  async function search() {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    const needle = query.trim();
    if (!needle) {
      setHits(null);
      setBusy(false);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const found = await sourceService.search(sources, needle, controller.signal);
      if (controller.signal.aborted) return;
      setHits(found);
    } catch (error) {
      if (!controller.signal.aborted)
        setError(error instanceof Error ? error.message : 'Chưa tìm được tài liệu.');
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  return (
    <>
      <PageHead
        title="Tài liệu ở ngay đây."
        subtitle="6 PDF cục bộ · 203 trang · Đọc và tìm trong nội dung khi không có Internet."
      />
      <form
        className="toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          void search();
        }}
      >
        <label>
          Tìm trong toàn bộ PDF
          <input
            id="source-search"
            type="search"
            placeholder="Ví dụ: padding, authentication, tr…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <button className="btn" disabled={busy}>
          {busy ? 'Đang tìm…' : 'Tìm trong 203 trang'}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      {hits && (
        <section className="card mb">
          <h2>{hits.length} trang có kết quả</h2>
          {hits.slice(0, 50).map((hit) => (
            <button
              className="source-hit wide"
              key={`${hit.id}-${hit.page}`}
              onClick={() => openSource(hit.id, hit.page)}
            >
              <strong>
                {hit.file} · Trang {hit.page}
              </strong>
              <span>{hit.text}…</span>
            </button>
          ))}
          {!hits.length && (
            <p className="status-note">
              Không tìm thấy chữ phù hợp. Thử từ khóa tiếng Anh hoặc xem hình trong PDF.
            </p>
          )}
        </section>
      )}
      {sources.map((source) => (
        <article className="card source-card" key={source.id}>
          <div className="source-badge">
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <use href="/assets/study-emblems.svg#books" />
            </svg>
            <span>PDF</span>
          </div>
          <div>
            <h3>{source.file}</h3>
            <p>{source.pageCount} trang · Tài liệu gốc giữ trong thư mục dự án</p>
          </div>
          <div className="source-actions">
            <button className="btn secondary small" onClick={() => openSource(source.id, 1)}>
              Đọc theo trang
            </button>
            <a
              className="btn subtle small"
              href={`/documents/${source.id}`}
              target="_blank"
              rel="noopener"
            >
              Mở PDF ↗
            </a>
          </div>
        </article>
      ))}
      <section className="card mt">
        <h2>Nguồn đối chiếu và đọc thêm</h2>
        <p className="status-note">
          Bài tiếng Việt và câu hỏi dựa trên PDF được cung cấp. Các liên kết bên dưới cần Internet.
        </p>
        {course.references.map((reference) => (
          <div className="result-item" key={reference.url}>
            <a className="text-link" href={reference.url} target="_blank" rel="noopener">
              {reference.title} ↗
            </a>
            <p>{reference.note}</p>
          </div>
        ))}
      </section>
    </>
  );
}
