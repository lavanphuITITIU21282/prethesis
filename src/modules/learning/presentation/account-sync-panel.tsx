'use client';
import React, { useEffect, useState } from 'react';
import { useStudy } from './study-provider';
import { useUI } from '@/shared/ui/ui-context';
import type { StudyState } from '@/shared/domain/models';

function describe(state: StudyState) {
  return `${Object.keys(state.notes).length} ghi chú · ${Object.keys(state.read).length} bài có tiến độ · ${state.quizSessions.length + (state.quiz ? 1 : 0)} phiên luyện tập`;
}
function Preview({ title, state }: { title: string; state: StudyState }) {
  return (
    <div className="sync-preview">
      <h3>{title}</h3>
      <p>{describe(state)}.</p>
      <ul>
        {Object.entries(state.notes)
          .slice(0, 3)
          .map(([id, note]) => (
            <li key={id}>
              {note.slice(0, 140)}
              {note.length > 140 ? '…' : ''}
            </li>
          ))}
      </ul>
    </div>
  );
}
export function AccountSyncPanel() {
  const { accountSync, syncStatus, state, notify } = useStudy();
  const { showModal, closeModal } = useUI();
  const [pending, setPending] = useState(false);
  useEffect(() => {
    // Preview bodies capture account data, so dismiss them when the session changes.
    if (syncStatus?.status === 'session') closeModal();
  }, [syncStatus?.status, closeModal]);
  if (!accountSync || !syncStatus) return null;
  const labels = {
    loading: 'Đang tải tiến độ tài khoản…',
    saved: 'Đã đồng bộ với tài khoản',
    pending: 'Có thay đổi chờ đồng bộ',
    saving: 'Đang lưu lên tài khoản…',
    offline: 'Chưa đồng bộ được với máy chủ',
    conflict: 'Cần chọn bản tiến độ',
    session: 'Cần xác minh lại tài khoản',
    blocked: 'Tạm chặn ghi để giữ dữ liệu',
  };
  function exportDraft() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ ...state, timer: null }, null, 2)], { type: 'application/json' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tram-hoc-ban-nhap.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  function importGuest() {
    try {
      const guest = accountSync!.previewGuest();
      if (!guest) {
        notify('Chưa có dữ liệu học khách trên địa chỉ này.');
        return;
      }
      showModal({
        title: 'Nhập dữ liệu học khách vào tài khoản?',
        className: 'sync-modal',
        body: (
          <>
            <Preview title="Bản học khách" state={guest} />
            <Preview title="Bản tài khoản đang dùng" state={state} />
            <p>
              Thao tác này thay toàn bộ tiến độ tài khoản bằng bản khách và đồng bộ lên máy chủ. Kho
              khách vẫn giữ nguyên. Hãy xuất nháp hiện tại nếu bạn muốn giữ một bản riêng.
            </p>
            <button
              className="btn"
              onClick={() => {
                try {
                  accountSync!.replace(guest);
                  closeModal();
                  notify('Đã nhập vào bản nháp tài khoản; chờ đồng bộ.');
                } catch {
                  notify('Chưa sao lưu được bản hiện tại. Xuất JSON trước khi thử lại.');
                }
              }}
            >
              Xác nhận thay bằng bản khách
            </button>
            <button className="btn secondary" onClick={closeModal}>
              Hủy
            </button>
          </>
        ),
      });
    } catch {
      notify('Không đọc được kho khách. Bản gốc chưa bị thay đổi.');
    }
  }
  async function resolve() {
    setPending(true);
    try {
      const server = await accountSync!.previewServer();
      showModal({
        title: 'Chọn bản tiến độ cần dùng',
        className: 'sync-modal',
        body: (
          <>
            <Preview title="Bản nháp thiết bị" state={state} />
            {server ? (
              <Preview title="Bản máy chủ" state={server.state} />
            ) : (
              <p>Máy chủ chưa có tiến độ.</p>
            )}
            {server?.updatedAt && (
              <p>Lưu trên máy chủ: {new Date(server.updatedAt).toLocaleString('vi-VN')}.</p>
            )}
            <p>
              Không trộn tự động hai bản. Dùng bản máy chủ sẽ thay nháp thiết bị; giữ nháp thiết bị
              sẽ thay bản máy chủ. Các bản trước khi thay được giữ riêng để khôi phục; bạn cũng có
              thể hủy và xuất JSON trước.
            </p>
            <div className="inline-actions mt">
              <button
                className="btn"
                onClick={() => {
                  closeModal();
                  void accountSync!.resolve(false, server?.revision || 0);
                }}
              >
                Dùng bản máy chủ
              </button>
              <button
                className="btn secondary"
                onClick={() => {
                  closeModal();
                  void accountSync!.resolve(true, server?.revision || 0);
                }}
              >
                Giữ nháp thiết bị và lưu lên tài khoản
              </button>
              <button className="btn secondary" onClick={closeModal}>
                Hủy
              </button>
            </div>
          </>
        ),
      });
    } catch {
      notify('Chưa đọc được bản máy chủ. Bản nháp chưa bị thay đổi.');
    } finally {
      setPending(false);
    }
  }
  function recoveries() {
    try {
      const entries = accountSync!.recoveries();
      showModal({
        title: 'Bản khôi phục trên thiết bị',
        className: 'sync-modal',
        body: (
          <>
            <p>
              Các bản này chỉ thuộc tài khoản hiện tại trên trình duyệt này. Xuất bản cần giữ trước
              khi dọn dữ liệu trình duyệt.
            </p>
            {!entries.length && <p>Chưa có bản khôi phục.</p>}
            {entries.map((entry, index) => (
              <section className="sync-preview" key={entry.key}>
                <h3>
                  Bản {index + 1} ·{' '}
                  {entry.createdAt
                    ? new Date(entry.createdAt).toLocaleString('vi-VN')
                    : 'Từ lần dùng trước'}
                </h3>
                <p>
                  {entry.state
                    ? describe(entry.state)
                    : 'Bản gốc chưa đọc được; có thể xuất để khôi phục thủ công.'}
                </p>
                <div className="inline-actions">
                  <button
                    className="btn secondary"
                    onClick={() => {
                      const value = entry.state
                        ? JSON.stringify({ ...entry.state, timer: null }, null, 2)
                        : entry.raw;
                      const url = URL.createObjectURL(
                        new Blob([value], { type: 'application/json' }),
                      );
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `tram-hoc-khoi-phuc-${index + 1}.json`;
                      link.click();
                      setTimeout(() => URL.revokeObjectURL(url), 2000);
                    }}
                  >
                    Xuất bản {index + 1}
                  </button>
                  {entry.state && !syncStatus!.blocked && (
                    <button
                      className="btn"
                      onClick={() =>
                        showModal({
                          title: 'Dùng bản khôi phục này?',
                          className: 'sync-modal',
                          body: (
                            <>
                              <Preview title="Bản đã chọn" state={entry.state!} />
                              <p>
                                Bản hiện tại được giữ riêng trước khi thay. Thay đổi sẽ được đồng bộ
                                lên tài khoản; xung đột sẽ cần xác nhận thêm.
                              </p>
                              <button
                                className="btn"
                                onClick={() => {
                                  try {
                                    accountSync!.replace(entry.state!);
                                    closeModal();
                                  } catch {
                                    notify('Chưa giữ được bản hiện tại. Hãy xuất JSON trước.');
                                  }
                                }}
                              >
                                Xác nhận dùng bản này
                              </button>
                              <button className="btn secondary" onClick={closeModal}>
                                Hủy
                              </button>
                            </>
                          ),
                        })
                      }
                    >
                      Chọn khôi phục bản {index + 1}
                    </button>
                  )}
                </div>
              </section>
            ))}
            <button className="btn secondary" onClick={closeModal}>
              Đóng
            </button>
          </>
        ),
      });
    } catch {
      notify('Chưa đọc được bản khôi phục trên thiết bị.');
    }
  }
  return (
    <section
      className="account-sync-panel"
      data-status={syncStatus.status}
      aria-label="Đồng bộ tiến độ tài khoản"
    >
      <p role="status">{labels[syncStatus.status]}</p>
      <div className="inline-actions">
        {syncStatus.status === 'conflict' && (
          <button className="btn" onClick={() => void resolve()} disabled={pending}>
            Xem và chọn bản cần dùng
          </button>
        )}
        {!syncStatus.blocked && (
          <button
            className="btn secondary"
            disabled={pending || syncStatus.status === 'saving' || syncStatus.status === 'loading'}
            onClick={() => void accountSync.retry()}
          >
            Đồng bộ lại
          </button>
        )}
        {!syncStatus.blocked && syncStatus.status !== 'conflict' && (
          <button
            className="btn secondary"
            disabled={syncStatus.status === 'saving' || syncStatus.status === 'loading'}
            onClick={importGuest}
          >
            Nhập từ kho học khách
          </button>
        )}
        <button
          className="btn secondary"
          onClick={exportDraft}
          disabled={syncStatus.status === 'session'}
        >
          Xuất nháp thiết bị
        </button>
        <button
          className="btn secondary"
          onClick={recoveries}
          disabled={syncStatus.status === 'session'}
        >
          Bản khôi phục
        </button>
        {syncStatus.blocked && (
          <button className="btn" onClick={() => window.location.reload()}>
            Tải lại và xác minh phiên
          </button>
        )}
      </div>
    </section>
  );
}
