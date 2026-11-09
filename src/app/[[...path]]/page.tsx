import React from 'react';
import { StudyView } from '@/shared/ui/study-view';
import { notFound } from 'next/navigation';
import { course } from '@/modules/content/server.mjs';
import { isStudyPath } from '@/shared/routing/study-routes';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { path = [] } = await params;
  if (!isStudyPath(path, course)) notFound();
  const query = Object.fromEntries(
    Object.entries(await searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value || '',
    ]),
  );
  return <StudyView segments={path} query={query} />;
}
