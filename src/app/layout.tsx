import React from 'react';
import type { Metadata, Viewport } from 'next';
import { StudyProvider } from '@/modules/learning/presentation/study-provider';
import { StudyShell } from '@/shared/ui/study-shell';
import { course, sources, lessonArt } from '@/modules/content/server.mjs';
import type { Course, Source } from '@/shared/domain/models';
import '@/styles/globals.css';
import { cookies } from 'next/headers';
import { authentication } from '@/app/_server/auth.mjs';
import { SESSION_COOKIE } from '@/app/_server/auth-http.mjs';

export const metadata: Metadata = {
  title: 'Trạm học · Một việc nhỏ, hiểu sâu hơn',
  description:
    'Học an toàn thông tin theo nhịp của bạn. Bài học, mô phỏng và ôn tập trong mạng nội bộ.',
  icons: { icon: '/assets/favicon.svg' },
};
export const viewport: Viewport = { themeColor: '#102d27' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  let accountId: string | undefined;
  let sessionUnavailable = false;
  if (token) {
    try {
      accountId = (await authentication.session(token))?.user_id;
    } catch {
      sessionUnavailable = true;
    }
  }
  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <body>
        <StudyProvider
          key={accountId || (sessionUnavailable ? 'unavailable' : 'guest')}
          accountId={accountId}
          sessionUnavailable={sessionUnavailable}
          course={course as Course}
          sources={sources as Source[]}
        >
          <StudyShell lessonArt={lessonArt}>{children}</StudyShell>
        </StudyProvider>
      </body>
    </html>
  );
}
