'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { iconPaths } from '@/shared/ui/icons';
import type { Lesson, Module, Term } from '@/shared/domain/models';
import { useStudy } from '../../modules/learning/presentation/study-provider';
import { useUI } from './ui-context';

export function Icon({ name }: { name: string }) {
  return (
    <svg className="svg-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={iconPaths[name] || iconPaths.book} />
    </svg>
  );
}
export function Progress({ value }: { value: number }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Tiến độ"
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
export function TermLabel({ term }: { term: Term }) {
  return (
    <span className="term-label">
      <span lang="en">{term.name}</span>
      <small lang="vi">{term.vi}</small>
    </span>
  );
}
export function TermAnnotation({ term }: { term: Term }) {
  return (
    <dl className="term-annotation">
      <div>
        <dt>Nghĩa tiếng Việt</dt>
        <dd lang="vi">{term.vi}</dd>
      </div>
      {term.englishFull && (
        <div>
          <dt>Tiếng Anh đầy đủ</dt>
          <dd lang="en">{term.englishFull}</dd>
        </div>
      )}
      {term.nameNote && (
        <div>
          <dt>Ghi chú tên gọi</dt>
          <dd lang="vi">{term.nameNote}</dd>
        </div>
      )}
    </dl>
  );
}
export function LessonImage({
  id,
  className = '',
  thumb = false,
}: {
  id: string;
  className?: string;
  thumb?: boolean;
}) {
  const { lessonArt } = useUI();
  const art = lessonArt[id];
  if (!art) return null;
  const base = `/assets/lesson-backgrounds/${art.assetStem}`;
  return (
    <img
      className={className}
      src={`${base}${thumb ? '-480' : ''}.webp`}
      srcSet={
        thumb ? undefined : `${base}-480.webp 480w, ${base}-960.webp 960w, ${base}.webp 1536w`
      }
      sizes="(max-width:760px) 90vw, 55vw"
      width={thumb ? 480 : 1536}
      height={thumb ? 240 : 768}
      loading="lazy"
      decoding="async"
      alt=""
      aria-hidden="true"
      title={`${art.name} — ${art.story}`}
    />
  );
}
const moduleCovers: Record<string, string> = {
  foundation: 'cia',
  applied: 'keys',
  symmetric: 'otp',
  hash: 'hash-algorithms',
  public: 'dh',
};
const worlds: Record<string, string> = {
  path: 'emerald',
  glossary: 'rose',
  flash: 'teal',
  quiz: 'cinnabar',
  commands: 'amber',
  labs: 'violet',
  library: 'slate',
  progress: 'blue',
};
export function PageHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  const page = usePathname().split('/')[1] || 'home';
  const emblems: Record<string, string> = {
    path: 'compass',
    glossary: 'scroll',
    flash: 'scroll',
    quiz: 'seal',
    commands: 'brush',
    labs: 'abacus',
    library: 'books',
    progress: 'lantern',
  };
  return (
    <div className="page-head interior-heading">
      <img
        className="page-scene"
        src={`/assets/ink-worlds/${worlds[page] || 'emerald'}.webp`}
        width="1536"
        height="768"
        alt=""
        aria-hidden="true"
      />
      {emblems[page] && (
        <svg className="page-emblem" viewBox="0 0 120 120" aria-hidden="true">
          <use href={`/assets/study-emblems.svg#${emblems[page]}`} />
        </svg>
      )}
      <div className="page-heading-copy">
        <span className="page-catalog">TRẠM HỌC / THƯ PHÒNG TRI THỨC</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
export function ModuleCard({ module }: { module: Module }) {
  const { course, state } = useStudy();
  const lessons = course.lessons.filter((lesson) => lesson.module === module.id);
  const done = lessons.filter((lesson) => isRead(lesson, state.read)).length;
  const terms = course.terms.filter((term) => term.module === module.id).length;
  return (
    <Link href={`/path/${module.id}`} className="chapter-card" data-chapter={module.id}>
      <span className="chapter-art-frame">
        <LessonImage id={moduleCovers[module.id]} className="chapter-art" />
      </span>
      <span className="chapter-brush" aria-hidden="true">
        {
          (
            {
              foundation: '本',
              applied: '用',
              symmetric: '密',
              hash: '印',
              public: '鑰',
            } as Record<string, string>
          )[module.id]
        }
      </span>
      <div className={`module-icon ${module.color}`}>
        <Icon name={module.icon} />
      </div>
      <div className="chapter-copy">
        <div className="eyebrow">CHƯƠNG {module.number}</div>
        <h3>{module.title}</h3>
        <p>
          {lessons.length} bài học <span>·</span> {terms} thuật ngữ
        </p>
      </div>
      <div className="chapter-tail">
        <span>
          {done}/{lessons.length} hoàn thành
        </span>
        <Progress value={Math.round((done / lessons.length) * 100)} />
      </div>
      <span className="arrow" aria-hidden="true">
        ↗
      </span>
    </Link>
  );
}
export const isRead = (lesson: Lesson, read: Record<string, number[]>) =>
  (read[lesson.id] || []).length === lesson.sections.length;
