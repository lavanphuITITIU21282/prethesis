import type { Course } from '../domain/models';

type RouteCatalog = Pick<Course, 'lessons' | 'modules' | 'commands'>;

export function isStudyPath(segments: string[], catalog: RouteCatalog): boolean {
  const [page, id, part] = segments;
  if (!page) return true;
  if (['home', 'glossary', 'flash', 'library', 'labs', 'progress', 'account'].includes(page)) {
    return segments.length === 1;
  }
  if (page === 'path') {
    return segments.length <= 2 && (!id || catalog.modules.some((item) => item.id === id));
  }
  if (page === 'commands') {
    return segments.length <= 2 && (!id || catalog.commands.some((item) => item.id === id));
  }
  if (page === 'quiz') return segments.length <= 2 && (!id || id === 'run');
  if (page === 'learn') {
    const lesson = catalog.lessons.find((item) => item.id === id);
    return (
      !!lesson &&
      segments.length <= 3 &&
      (!part || (/^\d+$/.test(part) && Number(part) < lesson.sections.length))
    );
  }
  return false;
}
