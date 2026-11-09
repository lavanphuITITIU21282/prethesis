'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useStudy } from '../../modules/learning/presentation/study-provider';
import { UIContext, type Artwork, type ModalContent } from './ui-context';
import { Icon, isRead, Progress } from './primitives';
import { SearchDialog, SettingsDialog, SourceDialog, TermDialog } from './dialogs';
import { FocusTimer } from '../../modules/learning/presentation/focus-timer';
import { AccountSyncPanel } from '../../modules/learning/presentation/account-sync-panel';

const navigation = [
  ['home', '/', 'Tổng quan', 'home'],
  ['path', '/path', 'Lộ trình học', 'book'],
  ['quiz', '/quiz', 'Luyện tập', 'quiz'],
  ['glossary', '/glossary', 'Thẻ thuật ngữ', 'cards'],
  ['commands', '/commands', 'Giải mã cú pháp', 'terminal'],
  ['labs', '/labs', 'Phòng mô phỏng', 'flask'],
  ['progress', '/progress', 'Tiến độ & ghi chú', 'chart'],
  ['account', '/account', 'Tài khoản', 'home'],
];
export function StudyShell({
  lessonArt,
  children,
}: {
  lessonArt: Record<string, Artwork>;
  children: ReactNode;
}) {
  const { course, sources, state, ready, warning, toast, blocked } = useStudy();
  const pathname = usePathname();
  const router = useRouter();
  const page = pathname.split('/')[1] || 'home';
  const activePage = page === 'learn' ? 'path' : page;
  const lesson = course.lessons.find((item) => item.id === pathname.split('/')[2]);
  const activeModule = page === 'learn' ? lesson?.module : pathname.split('/')[2];
  const done = course.lessons.filter((item) => isRead(item, state.read)).length;
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<ModalContent | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeModal = useCallback(() => setModal(null), []);
  const openSearch = useCallback(
    () => setModal({ title: 'Bạn đang muốn hiểu điều gì?', body: <SearchDialog /> }),
    [],
  );
  const openSettings = () => setModal({ title: 'Chọn nhịp học của bạn', body: <SettingsDialog /> });
  const openTerm = useCallback(
    (id: string) => {
      const term = course.terms.find((item) => item.id === id);
      if (term)
        setModal({ title: term.name, body: <TermDialog id={id} />, className: 'term-modal' });
    },
    [course],
  );
  const openSource = useCallback(
    (id: string, number: number) => {
      const source = sources.find((item) => item.id === id);
      if (source && Number.isInteger(number) && number > 0 && number <= source.pageCount)
        setModal({
          title: `Tài liệu gốc · trang ${number}`,
          body: <SourceDialog key={`${id}-${number}`} id={id} page={number} />,
        });
    },
    [sources],
  );

  useEffect(() => {
    // Convert saved hash URLs once so old bookmarks still open their original lesson.
    if (window.location.hash.startsWith('#/')) router.replace(window.location.hash.slice(1));
  }, [router]);
  useEffect(() => {
    // Route changes must close transient overlays and restore focus together.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
    setModal(null);
    document.body.dataset.page = page;
    document.body.dataset.lesson = page === 'learn' ? lesson?.id || '' : '';
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname, page, lesson?.id]);
  useEffect(() => {
    document.documentElement.style.setProperty('--font', `${state.settings.font}%`);
    document.body.classList.toggle('dark', state.settings.dark);
    document.body.classList.toggle('focus-mode', state.settings.focus && page === 'learn');
  }, [state.settings, page]);
  useEffect(() => {
    if (modal && !dialog.current?.open) dialog.current?.showModal();
    else if (!modal && dialog.current?.open) dialog.current.close();
  }, [modal]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.key === '/' &&
        !modal &&
        !target.closest('input,textarea,select,[contenteditable="true"]')
      ) {
        event.preventDefault();
        openSearch();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [modal, openSearch]);

  const label =
    page === 'learn'
      ? 'Bài học'
      : page === 'library'
        ? 'Thư viện tài liệu'
        : page === 'flash'
          ? 'Ôn thẻ'
          : navigation.find((item) => item[0] === page)?.[2] || 'Trang học';
  return (
    <UIContext.Provider
      value={{ lessonArt, showModal: setModal, closeModal, openTerm, openSource }}
    >
      <a
        className="skip"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Đến nội dung chính
      </a>
      <aside
        id="sidebar"
        className={`sidebar ${menuOpen ? 'open' : ''}`}
        aria-label="Điều hướng chính"
      >
        <Link className="brand" href="/">
          <span className="brand-seal" aria-hidden="true">
            學
          </span>
          <div>
            <strong>
              Trạm học<span className="text-green">.</span>
            </strong>
            <small>THƯ PHÒNG TRI THỨC</small>
          </div>
        </Link>
        <nav>
          <div className="nav-group">
            <span className="nav-label">KHÔNG GIAN CỦA BẠN</span>
            {navigation.map(([id, href, title, icon]) => (
              <Link
                key={id}
                className={`nav-link ${activePage === id ? 'active' : ''}`}
                href={href}
                aria-current={activePage === id ? 'page' : undefined}
              >
                <Icon name={icon} />
                <span>{title}</span>
                {id === 'glossary' && <span className="count">{course.terms.length}</span>}
              </Link>
            ))}
          </div>
          <div className="nav-group">
            <span className="nav-label">CHƯƠNG HỌC</span>
            {course.modules.map((module) => (
              <Link
                key={module.id}
                className={`nav-module ${activeModule === module.id ? 'active' : ''}`}
                href={`/path/${module.id}`}
              >
                <b>{module.number}</b>
                <span>{module.title}</span>
              </Link>
            ))}
          </div>
          <Link className={`nav-link ${page === 'library' ? 'active' : ''}`} href="/library">
            <Icon name="folder" />
            <span>Thư viện tài liệu</span>
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-progress">
            <span>Hành trình của bạn</span>
            <b>
              {done}/{course.lessons.length}
            </b>
          </div>
          <Progress value={Math.round((done / course.lessons.length) * 100)} />
          <p className="sidebar-note">
            <Icon name="leaf" /> Mỗi bước nhỏ đều được ghi nhận.
          </p>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            id="menu-toggle"
            aria-label="Mở điều hướng"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            ☰
          </button>
          <div className="breadcrumb">
            <span>Không gian học tập</span>
            <span>/</span>
            <strong>{label}</strong>
          </div>
          <div className="top-actions">
            <span className="connection">
              <i /> Mạng cục bộ
            </span>
            <button
              className="search-trigger"
              aria-label="Tìm kiếm toàn bộ nội dung"
              onClick={openSearch}
            >
              <span>⌕</span> Tìm nhanh <kbd>/</kbd>
            </button>
            <button className="icon-button" aria-label="Cài đặt trải nghiệm" onClick={openSettings}>
              ⚙
            </button>
          </div>
        </header>
        {warning && (
          <div className="storage-warning recovery-warning" role="alert">
            {warning}
          </div>
        )}
        <main id="main" tabIndex={-1}>
          <AccountSyncPanel />
          {ready ? (
            blocked && page !== 'account' ? (
              <p role="alert">
                Tạm dừng thao tác học để giữ dữ liệu. Mở <Link href="/account">Tài khoản</Link> hoặc
                thử tải lại trang.
              </p>
            ) : (
              children
            )
          ) : (
            <div className="study-loading" role="status">
              Đang mở không gian học…
            </div>
          )}
        </main>
        <footer>
          TRẠM HỌC <span>Chậm một chút cũng được. Hiểu được mới là điều quan trọng.</span>
          <Link href="/library">Nguồn tài liệu</Link>
        </footer>
      </div>
      {ready && !blocked && <FocusTimer />}
      <dialog
        id="modal"
        ref={dialog}
        aria-labelledby="modal-title"
        onCancel={closeModal}
        onClose={closeModal}
      >
        {modal && (
          <div id="modal-content" className={modal.className}>
            <div className="modal-head">
              <h2 id="modal-title">{modal.title}</h2>
              <button className="icon-button" aria-label="Đóng hộp thoại" onClick={closeModal}>
                ×
              </button>
            </div>
            {modal.body}
          </div>
        )}
      </dialog>
      <div id="toast" role="status" aria-live="polite" className={toast ? 'visible' : ''}>
        {toast}
      </div>
    </UIContext.Provider>
  );
}
