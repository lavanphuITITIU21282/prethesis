'use client';

import React from 'react';
import Link from 'next/link';
import { PageHead } from '@/shared/ui/primitives';
import { useStudy } from '@/modules/learning/presentation/study-provider';
import { useUI } from '@/shared/ui/ui-context';

export default function Commands({ commandId }: { commandId?: string }) {
  const { course, notify } = useStudy();
  const { showModal } = useUI();
  const command = course.commands.find((item) => item.id === commandId) || course.commands[0];

  async function copyExample() {
    try {
      await navigator.clipboard.writeText(command.code);
      notify('Đã sao chép ví dụ.');
    } catch {
      // Plain HTTP on LAN may not expose the Clipboard API; keep a manual copy path.
      showModal({
        title: 'Sao chép ví dụ',
        body: (
          <>
            <p>Chọn đoạn dưới rồi sao chép.</p>
            <textarea
              rows={6}
              readOnly
              defaultValue={command.code}
              onFocus={(event) => event.target.select()}
            />
          </>
        ),
      });
    }
  }

  return (
    <>
      <PageHead
        title="Đọc một lệnh, hiểu từng phần."
        subtitle="Mỗi ví dụ có ngữ cảnh, kết quả mong đợi và giới hạn sử dụng."
      />
      <div className="code-layout">
        <nav className="command-nav" aria-label="Ví dụ cú pháp">
          {course.commands.map((item) => (
            <Link
              className={`command-link ${item.id === command.id ? 'active' : ''}`}
              key={item.id}
              href={`/commands/${item.id}`}
            >
              {item.title}
            </Link>
          ))}
        </nav>
        <article className="card">
          <div className="section-heading">
            <h2>{command.title}</h2>
            <span className="tag">{command.environment}</span>
          </div>
          <p className="section-caption">{command.situation}</p>
          <div className="command-window">
            <div className="command-window-bar" aria-hidden="true">
              <span />
              <span />
              <span />
              <small>{command.environment}</small>
            </div>
            <pre>
              <code>{command.code}</code>
            </pre>
          </div>
          <div className="inline-actions mt">
            <button className="btn secondary small" onClick={copyExample}>
              Sao chép ví dụ
            </button>
            <Link className="btn subtle small" href={`/quiz?lesson=${command.lesson}&kind=syntax`}>
              Câu hỏi cú pháp bài này
            </Link>
          </div>
          <table className="token-table">
            <thead>
              <tr>
                <th>Thành phần</th>
                <th>Trong trường hợp này, dùng để làm gì?</th>
              </tr>
            </thead>
            <tbody>
              {command.tokens.map((token, index) => (
                <tr key={index}>
                  <td>
                    <code>{token.token}</code>
                  </td>
                  <td>{token.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="callout">
            <strong>KẾT QUẢ MONG ĐỢI</strong>
            {command.result}
          </div>
          <div className="callout">
            <strong>GIỚI HẠN CẦN HIỂU</strong>
            {command.warning}
          </div>
          <p className="status-note">
            Website hiển thị và giải thích mã; các ví dụ này không được chạy trên máy chủ.
          </p>
          <Link className="text-link" href={`/learn/${command.lesson}/0`}>
            Đọc lý thuyết liên quan →
          </Link>
        </article>
      </div>
    </>
  );
}
