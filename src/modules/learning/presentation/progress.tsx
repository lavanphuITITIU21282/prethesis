'use client';

import React from 'react';

import Link from 'next/link';
import { useRef } from 'react';
import { validateBackup } from '@/shared/domain/study-core.js';
import { gradeMatchesAnswer } from '@/shared/domain/grade.js';
import { dateKey } from '@/shared/domain/date';
import { Icon, isRead, ModuleCard, PageHead } from '@/shared/ui/primitives';
import { useStudy } from '@/modules/learning/presentation/study-provider';
import { useUI } from '@/shared/ui/ui-context';

export default function StudyProgress() {
  const { course, state, replace, notify } = useStudy();
  const { showModal, closeModal } = useUI();
  const fileInput = useRef<HTMLInputElement>(null);
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + index);
    return {
      key: dateKey(date),
      label: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
      value: state.activity[dateKey(date)]?.sections || 0,
    };
  });
  const maximum = Math.max(1, ...week.map((day) => day.value));
  const notes = course.lessons.filter((lesson) => state.notes[lesson.id]);
  function exportBackup() {
    const blob = new Blob([JSON.stringify({ ...state, timer: null }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `tram-hoc-${dateKey()}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    notify('Đã tạo bản sao tiến độ.');
  }
  async function importBackup(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      notify('Chọn bản sao JSON dưới 5 MiB.');
      return;
    }
    try {
      const candidate = validateBackup(JSON.parse(await file.text()), course);
      showModal({
        title: 'Nhập bản sao tiến độ?',
        body: (
          <>
            <p>
              Bản sao có <b>{Object.keys(candidate.read).length} bài có tiến độ</b>,{' '}
              <b>{Object.keys(candidate.reviews).length} thẻ đã ôn</b>,{' '}
              <b>{Object.keys(candidate.notes).length} ghi chú</b> và{' '}
              <b>{candidate.quizSessions.length + (candidate.quiz ? 1 : 0)} phiên luyện tập</b>.
            </p>
            <p className="status-note">
              Bản tiến độ đang dùng sẽ được thay bằng bản sao. Nếu đang đăng nhập, thay đổi sẽ đồng
              bộ lên tài khoản. Bạn có thể hủy để xuất dữ liệu hiện tại trước.
            </p>
            <div className="inline-actions mt">
              <button
                className="btn"
                onClick={() => {
                  replace(candidate);
                  closeModal();
                  notify('Đã nhập bản sao tiến độ.');
                }}
              >
                Thay bằng bản sao này
              </button>
              <button className="btn secondary" onClick={closeModal}>
                Hủy
              </button>
            </div>
          </>
        ),
      });
    } catch (error) {
      notify(
        `Không nhập được: ${error instanceof Error ? error.message : 'Bản sao không hợp lệ.'}`,
      );
    }
  }
  return (
    <>
      <PageHead
        title="Nhìn lại những bước đã đi."
        subtitle="Tiến độ thuộc về bạn. Khi đăng nhập, bản lưu được đồng bộ theo tài khoản; chế độ khách lưu trên trình duyệt."
      />
      <div className="stats mb">
        {[
          [
            `${course.lessons.filter((lesson) => isRead(lesson, state.read)).length}/${course.lessons.length}`,
            'Bài đã đọc đủ phần',
            'book',
          ],
          [
            `${Object.keys(state.reviews).length}/${course.terms.length}`,
            'Thuật ngữ từng ôn',
            'cards',
          ],
          [
            `${Object.values(state.activity).reduce((total, activity) => total + activity.minutes, 0)} phút`,
            'Phiên tập trung đã hoàn tất',
            'clock',
          ],
        ].map(([value, label, icon]) => (
          <div className="stat" key={label}>
            <div className="stat-icon">
              <Icon name={icon} />
            </div>
            <div>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="lab-grid">
        <section className="card">
          <h2>7 ngày vừa qua</h2>
          <div className="activity-bars">
            {week.map((day) => (
              <div className="activity-day" key={day.key}>
                <strong>{day.value}</strong>
                <i style={{ height: (day.value / maximum) * 80 }} />
                <span>{day.label}</span>
              </div>
            ))}
          </div>
          <p className="status-note">
            Số phần bạn đã đánh dấu đọc. Những ngày nghỉ không làm mất tiến độ.
          </p>
        </section>
        <section className="card">
          <h2>Mang tiến độ theo bạn</h2>
          <p className="status-note">
            Bản sao JSON gồm phiên luyện tập, phần đã đọc, lịch ôn, ghi chú, nháp tự luận và cài
            đặt. Chế độ khách có kho riêng theo địa chỉ/trình duyệt; khi đăng nhập, bản lưu đồng bộ
            theo tài khoản.
          </p>
          <div className="data-tools">
            <button className="btn" onClick={exportBackup}>
              ↓ Xuất bản sao
            </button>
            <button className="btn secondary" onClick={() => fileInput.current?.click()}>
              ↑ Nhập bản sao
            </button>
            <input
              ref={fileInput}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importBackup(file);
                event.target.value = '';
              }}
            />
          </div>
          <p className="status-note">
            Nhập sẽ thay thế dữ liệu sau khi bạn xem nội dung bản sao và xác nhận.
          </p>
        </section>
        <section className="card full-span">
          <h2>Tiến độ từng chương</h2>
          <div className="mt">
            {course.modules.map((module) => (
              <ModuleCard module={module} key={module.id} />
            ))}
          </div>
        </section>
        <section className="card">
          <h2>Các lượt luyện gần đây</h2>
          {state.history
            .slice(-10)
            .reverse()
            .map((entry, index) => (
              <div className="mini-list" key={index}>
                <span>{new Date(entry.date).toLocaleDateString('vi-VN')}</span>
                <b>
                  {entry.correct}/{entry.total} đúng
                </b>
              </div>
            ))}
          {!state.history.length && (
            <p className="status-note">Hoàn thành một lượt trắc nghiệm để thấy kết quả ở đây.</p>
          )}
          <hr />
          <h3>Điểm tự luận Gemini</h3>
          {Object.entries(state.aiGrades).map(([id, grade]) => (
            <div className="mini-list" key={id}>
              <div>
                <Link href={`/quiz?lesson=${id}&kind=boss`}>
                  {course.lessons.find((lesson) => lesson.id === id)?.title}
                </Link>
                <span className="ai-progress-label">
                  {gradeMatchesAnswer(grade, state.drafts[id])
                    ? 'Bản hiện tại'
                    : 'Bài làm đã thay đổi · điểm bản trước'}
                </span>
              </div>
              <b>{grade.score}/10</b>
            </div>
          ))}
          {!Object.keys(state.aiGrades).length && (
            <p className="status-note">Chưa có bài được Gemini chấm.</p>
          )}
          <hr />
          <h3>Điểm tự luận tự chấm</h3>
          {Object.entries(state.bossScores).map(([id, scores]) => (
            <div className="mini-list" key={id}>
              <Link href={`/quiz?lesson=${id}&kind=boss`}>
                {course.lessons.find((lesson) => lesson.id === id)?.title}
              </Link>
              <b>{scores.reduce((sum, score) => sum + score, 0)}/10</b>
            </div>
          ))}
          {!Object.keys(state.bossScores).length && <p className="status-note">Chưa có tự chấm.</p>}
        </section>
        <section className="card">
          <h2>Ghi chú của bạn</h2>
          {notes.map((lesson) => (
            <div className="result-item" key={lesson.id}>
              <Link className="text-link" href={`/learn/${lesson.id}/0`}>
                {lesson.title} →
              </Link>
              <p className="study-notes">
                {state.notes[lesson.id].slice(0, 400)}
                {state.notes[lesson.id].length > 400 ? '…' : ''}
              </p>
            </div>
          ))}
          {!notes.length && (
            <p className="status-note">Ghi chú ngay trong bài học; nội dung sẽ được gom ở đây.</p>
          )}
        </section>
      </div>
    </>
  );
}
