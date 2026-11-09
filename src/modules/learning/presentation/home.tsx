'use client';

import React from 'react';

import Link from 'next/link';
import { dateKey } from '@/shared/domain/date';
import { useStudy } from '@/modules/learning/presentation/study-provider';
import { useUI } from '@/shared/ui/ui-context';
import { Icon, isRead, LessonImage, ModuleCard } from '@/shared/ui/primitives';
import { SettingsDialog } from '@/shared/ui/dialogs';
import { useClock } from '@/shared/ui/use-clock';

export default function Home() {
  const now = useClock('minute');
  const { course, bank, state } = useStudy();
  const { showModal } = useUI();
  const last = course.lessons.find((lesson) => lesson.id === state.lastLesson) || course.lessons[0];
  const part = Math.max(
    0,
    last.sections.findIndex((_, index) => !state.read[last.id]?.includes(index)),
  );
  const today = state.activity[dateKey()] || { sections: 0, minutes: 0 };
  const seen = Object.keys(state.reviews).length;
  const due = course.terms.filter((term) => state.reviews[term.id]?.due <= now).length;
  return (
    <>
      <div className="exhibition-meta">
        <span>
          <b>TRẠM HỌC</b> / THƯ PHÒNG TRI THỨC
        </span>
        <time>
          {new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }).format(new Date())}
        </time>
      </div>
      <section className="dynasty-hero" aria-labelledby="dynasty-home-title">
        <img
          className="dynasty-hero-art"
          src="/assets/ink-palace-v2.webp"
          width="1774"
          height="887"
          fetchPriority="high"
          alt="Tranh cổ trang: núi mực xanh, trăng vàng và đình đỏ bên hồ"
        />
        <div className="dynasty-hero-frame" aria-hidden="true" />
        <div className="dynasty-hero-copy">
          <span className="dynasty-eyebrow">
            <i /> AN TOÀN THÔNG TIN · 05 CHƯƠNG
          </span>
          <h1 id="dynasty-home-title">
            Tĩnh tâm.
            <br />
            <em>Hiểu sâu.</em>
          </h1>
          <p>
            Mỗi lần một ý. Mỗi ngày một bước.
            <br />
            Giữ sự tò mò, để tri thức dần sáng rõ.
          </p>
          <div className="dynasty-hero-actions">
            <Link className="btn dynasty-primary" href={`/learn/${last.id}/${part}`}>
              {state.read[last.id]?.length ? 'Tiếp tục học' : 'Bước vào thư phòng'}{' '}
              <Icon name="arrow" />
            </Link>
            <Link className="btn dynasty-ghost" href="/path">
              Khám phá lộ trình ↗
            </Link>
          </div>
          <div className="dynasty-current">
            <span>ĐANG MỞ</span>
            <strong>{last.title}</strong>
          </div>
        </div>
        <div className="dynasty-art-caption" aria-hidden="true">
          <span className="dynasty-red-seal">學</span>
          <span>
            MẶC NGUYỆT
            <br />
            THƯ PHÒNG
          </span>
        </div>
        <div className="dynasty-hero-index">
          <span>
            <b>{course.lessons.length}</b> bài học
          </span>
          <span>
            <b>{course.terms.length}</b> thuật ngữ
          </span>
          <span>
            <b>{bank.length}</b> câu luyện tập
          </span>
          <span className="dynasty-edition">TRI THỨC VÔ TẬN · TỪNG BƯỚC NHỎ</span>
        </div>
      </section>
      <section className="learning-pulse" aria-label="Những bước đã đi">
        {[
          [
            'BÀI ĐÃ ĐỌC',
            course.lessons.filter((lesson) => isRead(lesson, state.read)).length,
            `/ ${course.lessons.length}`,
            'book',
          ],
          ['THUẬT NGỮ ĐÃ ÔN', seen, `/ ${course.terms.length}`, 'cards'],
          ['TẬP TRUNG HÔM NAY', today.minutes, 'phút', 'clock'],
        ].map(([label, value, unit, icon], index) => (
          <div key={label}>
            <span className="pulse-index">0{index + 1}</span>
            <div>
              <small>{label}</small>
              <strong>
                {value}
                <em> {unit}</em>
              </strong>
            </div>
            <Icon name={String(icon)} />
          </div>
        ))}
      </section>
      <img
        className="seasonal-divider"
        src="/assets/moon-divider.svg"
        width="1000"
        height="72"
        alt=""
        aria-hidden="true"
      />
      <div className="exhibition-grid">
        <section className="exhibition-curriculum">
          <div className="dynasty-section-head">
            <div>
              <span className="dynasty-kicker">LỘ TRÌNH HỌC</span>
              <h2>Nội dung học tập</h2>
            </div>
            <Link className="text-link" href="/path">
              Xem toàn bộ ↗
            </Link>
          </div>
          <div className="dynasty-chapter-list">
            {course.modules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
          <div className="curriculum-colophon">
            <span>203 trang tài liệu gốc</span>
            <span>75 phần học có ví dụ & lời giải</span>
            <span>Học và ôn trong mạng nội bộ</span>
          </div>
        </section>
        <aside className="home-aside">
          <section className="today-card card">
            <div className="today-card-head">
              <span className="dynasty-kicker">MỘT MỤC TIÊU NHỎ</span>
              <span className="tiny-red-seal" aria-hidden="true">
                日
              </span>
            </div>
            <h2>
              Đủ một chút,
              <br />
              cũng là tiến lên.
            </h2>
            <div
              className="goal-ring"
              style={
                {
                  '--goal': Math.min(100, (today.sections / state.settings.goal) * 100),
                } as React.CSSProperties
              }
            >
              <strong>
                {Math.min(today.sections, state.settings.goal)}
                <small> / {state.settings.goal}</small>
              </strong>
              <small>phần học hôm nay</small>
            </div>
            <p>
              {today.sections >= state.settings.goal
                ? 'Bạn đã đạt mục tiêu hôm nay. Có thể nghỉ một nhịp.'
                : 'Một phần học, một điều hiểu rõ. Bạn luôn có thể dừng và quay lại.'}
            </p>
            <button
              className="text-link"
              onClick={() =>
                showModal({ title: 'Chọn nhịp học của bạn', body: <SettingsDialog /> })
              }
            >
              Tùy chỉnh nhịp học ↗
            </button>
          </section>
          <section className="recall-card card">
            <span className="dynasty-kicker">GẶP LẠI ĐỂ NHỚ LÂU</span>
            <strong>{due || course.terms.length - seen}</strong>
            <h2>{due ? 'thuật ngữ đến hạn ôn' : 'thuật ngữ chờ khám phá'}</h2>
            <p>
              Thử nhớ trước khi mở lời giải.
              <br />
              Không cần hoàn hảo ngay lần đầu.
            </p>
            <Link className="btn secondary full" href="/flash">
              Ôn vài thẻ →
            </Link>
          </section>
          <section className="margin-note">
            <span aria-hidden="true">「</span>
            <p>
              Chậm một chút cũng được.
              <br />
              Hiểu được mới là điều quan trọng.
            </p>
            <small>NHỊP HỌC CỦA RIÊNG BẠN</small>
          </section>
        </aside>
      </div>
      <div className="lesson-image-grid" aria-hidden="true">
        {['aaa', 'risk', 'services', 'hybrid', 'caesar', 'ctr', 'hash-apps', 'protocols'].map(
          (id) => (
            <LessonImage key={id} id={id} />
          ),
        )}
      </div>
    </>
  );
}
