'use client';

import React from 'react';

import dynamic from 'next/dynamic';
import Link from 'next/link';

// Route-level chunks avoid downloading every learning tool on the first visit.
const Home = dynamic(() => import('@/modules/learning/presentation/home'));
const LearningPath = dynamic(() => import('@/modules/content/presentation/learning-path'));
const Reader = dynamic(() => import('@/modules/content/presentation/reader'));
const Glossary = dynamic(() => import('@/modules/content/presentation/glossary'));
const Flashcards = dynamic(() => import('@/modules/personalization/presentation/flashcards'));
const Quiz = dynamic(() => import('@/modules/assessment/presentation/index'));
const Commands = dynamic(() => import('@/modules/content/presentation/commands'));
const Library = dynamic(() => import('@/modules/content/presentation/library'));
const Labs = dynamic(() => import('@/modules/learning/presentation/labs'));
const Progress = dynamic(() => import('@/modules/learning/presentation/progress'));

export function StudyView({
  segments,
  query,
}: {
  segments: string[];
  query: Record<string, string>;
}) {
  switch (segments[0] || 'home') {
    case 'home':
      return <Home />;
    case 'path':
      return <LearningPath moduleId={segments[1]} />;
    case 'learn':
      return <Reader lessonId={segments[1]} part={segments[2]} />;
    case 'glossary':
      return <Glossary />;
    case 'flash':
      return <Flashcards query={query} />;
    case 'quiz':
      return <Quiz running={segments[1] === 'run'} query={query} />;
    case 'commands':
      return <Commands commandId={segments[1]} />;
    case 'library':
      return <Library />;
    case 'labs':
      return <Labs />;
    case 'progress':
      return <Progress />;
    default:
      return (
        <section className="card">
          <h1>Chưa tìm thấy trang này.</h1>
          <p>Chọn một bài trong lộ trình để tiếp tục.</p>
          <Link className="btn mt" href="/path">
            Mở lộ trình
          </Link>
        </section>
      );
  }
}
