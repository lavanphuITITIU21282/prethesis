import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isStudyPath } from '../src/shared/routing/study-routes';
import type { Course } from '../src/shared/domain/models';
const course: Course = JSON.parse(readFileSync('public/data/course.json', 'utf8'));

test('route validation accepts existing study routes and rejects private or invalid paths', () => {
  for (const path of [
    '',
    'home',
    'path',
    'path/hash',
    'learn/cia',
    'learn/cia/2',
    'quiz',
    'quiz/run',
    'commands/python-hash',
    'glossary',
    'flash',
    'library',
    'labs',
    'progress',
  ]) {
    assert.equal(isStudyPath(path.split('/').filter(Boolean), course), true, path);
  }
  for (const path of [
    '.env.local',
    'server.mjs',
    'src/server/grading.mjs',
    'learn/unknown/0',
    'learn/cia/3',
    'learn/cia/-1',
    'learn/cia/NaN',
    'path/unknown',
    'commands/unknown',
    'progress/extra',
    'quiz/extra',
  ]) {
    assert.equal(isStudyPath(path.split('/'), course), false, path);
  }
});
