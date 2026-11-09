'use client';

import React from 'react';

import Link from 'next/link';
import { useStudy } from '@/modules/learning/presentation/study-provider';
import { isRead, LessonImage, ModuleCard, PageHead } from '@/shared/ui/primitives';

export default function LearningPath({ moduleId }: { moduleId?: string }) {
  const { course, state } = useStudy();
  const chapter = course.modules.find((item) => item.id === moduleId);
  if (moduleId && !chapter)
    return (
      <PageHead
        title="Chưa tìm thấy chương này."
        subtitle="Chọn một chương trong thanh điều hướng."
      />
    );
  return (
    <>
      <PageHead
        title={chapter?.title || 'Một lộ trình, từng bước nhỏ.'}
        subtitle={
          chapter?.subtitle ||
          'Chọn chương bạn muốn hiểu. Mỗi bài được chia thành ba phần có ví dụ và tự kiểm tra.'
        }
      />
      {!chapter ? (
        <div className="stack">
          {course.modules.map((item) => (
            <ModuleCard key={item.id} module={item} />
          ))}
        </div>
      ) : (
        <div className="lesson-list">
          {course.lessons
            .filter((lesson) => lesson.module === chapter.id)
            .map((lesson, index) => {
              const read = state.read[lesson.id] || [];
              return (
                <Link className="lesson-row" key={lesson.id} href={`/learn/${lesson.id}/0`}>
                  <span className="lesson-num">
                    {isRead(lesson, state.read) ? '✓' : String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.summary}</p>
                    <div className="lesson-meta">
                      <span>{lesson.sections.length} phần ngắn</span>
                      <span>~{lesson.minutes} phút đọc kỹ</span>
                      <span>{lesson.terms.length} thuật ngữ</span>
                      <span>
                        {read.length}/{lesson.sections.length} đã đọc
                      </span>
                    </div>
                  </div>
                  <span className="lesson-art-thumb">
                    <LessonImage id={lesson.id} thumb />
                  </span>
                  <span className="arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              );
            })}
        </div>
      )}
    </>
  );
}
