import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function createFileCourseRepository(root = process.cwd()) {
  const read = (name) =>
    JSON.parse(readFileSync(resolve(root, 'public', 'data', `${name}.json`), 'utf8'));
  return {
    getCourse: () => read('course'),
    getSources: () => read('sources'),
    getLessonArtwork: () => read('lesson-backgrounds').works,
  };
}
