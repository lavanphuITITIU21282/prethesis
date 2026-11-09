'use client';

import React from 'react';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { normalize } from '@/shared/domain/study-core.js';
import { useStudy } from '../../modules/learning/presentation/study-provider';
import { useUI } from './ui-context';
import { TermAnnotation } from './primitives';
import { sourceService } from '@/modules/content/client';

export function TermDialog({ id }: { id: string }) {
  const { course } = useStudy();
  const { closeModal } = useUI();
  const term = course.terms.find((item) => item.id === id);
  if (!term) return <p>Chưa tìm thấy thuật ngữ.</p>;
  return (
    <>
      <TermAnnotation term={term} />
      <p className="definition">{term.definition}</p>
      <div className="callout">
        <strong>GẶP TRONG TRƯỜNG HỢP NÀO?</strong>
        {term.scenario}
      </div>
      <div className="callout">
        <strong>CHỖ DỄ NHẦM</strong>
        {term.pitfall}
      </div>
      <div className="inline-actions mt">
        <Link className="btn" onClick={closeModal} href={`/learn/${term.lesson}/0`}>
          Đọc bài liên quan
        </Link>
        <Link className="btn secondary" onClick={closeModal} href={`/quiz?term=${term.id}`}>
          3 câu hỏi về từ này
        </Link>
      </div>
    </>
  );
}

export function SettingsDialog() {
  const { state, update } = useStudy();
  const set = (key: 'minutes' | 'font' | 'goal', value: number) =>
    update((draft) => {
      draft.settings[key] = value;
      if (key === 'minutes') draft.timer = null;
    });
  return (
    <>
      <p className="section-caption">Một ý mỗi bước, chữ rõ và mục tiêu nhỏ.</p>
      {(
        [
          ['minutes', 'Thời lượng tập trung', [5, 10, 25], ' phút'],
          ['font', 'Cỡ chữ', [90, 100, 110, 120, 130], '%'],
          ['goal', 'Mục tiêu phần đọc mỗi ngày', [1, 2, 3], ' phần'],
        ] as const
      ).map(([key, title, values, unit]) => (
        <section className="modal-section" key={key}>
          <h3>{title}</h3>
          <div className="option-row">
            {values.map((value) => (
              <button
                className={`btn ${state.settings[key] === value ? '' : 'secondary'}`}
                key={value}
                onClick={() => set(key, value)}
              >
                {value}
                {unit}
              </button>
            ))}
          </div>
        </section>
      ))}
      <section className="modal-section">
        <h3>Không gian</h3>
        <div className="option-row">
          <button
            className="btn secondary"
            onClick={() =>
              update((draft) => {
                draft.settings.dark = !draft.settings.dark;
              })
            }
          >
            {state.settings.dark ? '☀ Chuyển sáng' : '☾ Chuyển tối'}
          </button>
          <button
            className="btn secondary"
            onClick={() =>
              update((draft) => {
                draft.settings.focus = !draft.settings.focus;
              })
            }
          >
            {state.settings.focus ? 'Tắt' : 'Bật'} tập trung trong bài
          </button>
        </div>
      </section>
      <div className="callout">
        <strong>LƯU RIÊNG TRÊN THIẾT BỊ</strong>Ghi chú và lịch ôn lưu ở trình duyệt theo địa chỉ
        truy cập. Xuất bản sao trước khi đổi máy.
      </div>
    </>
  );
}

export function SearchDialog() {
  const { course } = useStudy();
  const { closeModal, openTerm } = useUI();
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const text = normalize(query.trim());
    if (!text) return [];
    return [
      ...course.lessons
        .filter((item) =>
          normalize(
            `${item.title} ${item.summary} ${item.sections.map((section) => section.body).join(' ')}`,
          ).includes(text),
        )
        .map((item) => ({
          id: item.id,
          title: item.title,
          detail: item.summary,
          type: 'Bài học',
          href: `/learn/${item.id}/0`,
        })),
      ...course.terms
        .filter((item) =>
          normalize(
            `${item.name} ${item.vi} ${item.englishFull || ''} ${item.definition}`,
          ).includes(text),
        )
        .map((item) => ({
          id: item.id,
          title: item.name,
          detail: item.vi,
          type: 'Thuật ngữ',
          href: '',
        })),
      ...course.commands
        .filter((item) =>
          normalize(
            `${item.title} ${item.code} ${item.tokens.map((token) => token.meaning).join(' ')}`,
          ).includes(text),
        )
        .map((item) => ({
          id: item.id,
          title: item.title,
          detail: item.environment,
          type: 'Cú pháp',
          href: `/commands/${item.id}`,
        })),
    ];
  }, [course, query]);
  return (
    <>
      <input
        autoFocus
        id="global-search"
        className="search-input"
        type="search"
        placeholder="Bài học, thuật ngữ, lệnh…"
        aria-label="Tìm kiếm nội dung"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="search-results">
        {query.trim() ? (
          <>
            <p className="status-note">{results.length} kết quả · Hiển thị tối đa 30</p>
            {results.slice(0, 30).map((item) =>
              item.href ? (
                <Link
                  key={`${item.type}-${item.id}`}
                  className="search-result"
                  href={item.href}
                  onClick={closeModal}
                >
                  <small>{item.type}</small>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </Link>
              ) : (
                <button key={item.id} className="search-result" onClick={() => openTerm(item.id)}>
                  <small>{item.type}</small>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </button>
              ),
            )}
            {!results.length && (
              <p className="empty">
                Chưa tìm thấy. Thử từ ngắn hơn hoặc tìm chữ trong thư viện PDF.
              </p>
            )}
          </>
        ) : (
          <p className="status-note">
            Thử “nonce”, “RSA”, “tính toàn vẹn”… Tìm không dấu cũng được.
          </p>
        )}
      </div>
    </>
  );
}

interface SourceData {
  id: string;
  file: string;
  pages: { number: number; text: string }[];
}
export function SourceDialog({ id, page }: { id: string; page: number }) {
  const [data, setData] = useState<SourceData | null>(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(page);
  const [pageInput, setPageInput] = useState(String(page));
  const maximum = data?.pages.length || page;
  const navigate = (value: number) => {
    const next = Math.max(1, Math.min(maximum, Number.isFinite(value) ? Math.floor(value) : 1));
    setCurrentPage(next);
    setPageInput(String(next));
  };
  useEffect(() => {
    const controller = new AbortController();
    sourceService
      .getPageDocument(id, controller.signal)
      .then(setData)
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      });
    return () => controller.abort();
  }, [id]);
  return (
    <>
      {data && (
        <form
          className="source-nav"
          onSubmit={(event) => {
            event.preventDefault();
            navigate(Number(pageInput));
          }}
        >
          <button
            type="button"
            className="btn secondary small"
            disabled={currentPage === 1}
            onClick={() => navigate(currentPage - 1)}
          >
            ← Trước
          </button>
          <label>
            Trang{' '}
            <input
              id="source-page"
              type="number"
              min={1}
              max={maximum}
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value)}
            />{' '}
            / {maximum}
          </label>
          <button className="btn secondary small">Đến trang</button>
          <button
            type="button"
            className="btn secondary small"
            disabled={currentPage === maximum}
            onClick={() => navigate(currentPage + 1)}
          >
            Sau →
          </button>
        </form>
      )}
      {error ? (
        <p role="alert">{error}</p>
      ) : (
        <pre className="source-text">
          {data
            ? data.pages.find((item) => item.number === currentPage)?.text ||
              'Trang này chưa có chữ trích xuất; hãy đối chiếu PDF.'
            : 'Đang mở trang tài liệu…'}
        </pre>
      )}
      <a
        className="btn secondary mt"
        href={`/documents/${id}#page=${currentPage}`}
        target="_blank"
        rel="noopener"
      >
        Mở PDF tại trang này ↗
      </a>
    </>
  );
}
