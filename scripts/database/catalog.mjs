import { createHash } from 'node:crypto';
import { buildQuestions } from '../../src/shared/domain/study-core.js';
import { transaction } from './migrations.mjs';

export const COURSE_ID = 'tram-hoc-security';

async function insertRows(client, table, columns, rows) {
  // Identifiers are internal constants, never request parameters; values always use placeholders.
  if (![...table.split('.'), ...columns].every((name) => /^[a-z_]+$/.test(name)))
    throw new Error('INVALID_CATALOG_IDENTIFIER');
  for (let offset = 0; offset < rows.length; offset += 100) {
    const chunk = rows.slice(offset, offset + 100);
    const placeholders = chunk.map(
      (row, index) =>
        '(' + row.map((_, col) => '$' + (index * columns.length + col + 1)).join(',') + ')',
    );
    await client.query(
      `INSERT INTO ${table} (${columns.join(',')}) VALUES ${placeholders.join(',')}`,
      chunk.flat(),
    );
  }
}

export async function seedCatalog(client, course, version = 1) {
  if (!Number.isSafeInteger(version) || version < 1) throw new Error('INVALID_CONTENT_VERSION');
  const bank = buildQuestions(course);
  const checksum = createHash('sha256').update(JSON.stringify({ course, bank })).digest('hex');
  return transaction(client, async () => {
    await client.query('SELECT pg_advisory_xact_lock(106798, 1)');
    const existing = await client.query(
      'SELECT checksum FROM content.releases WHERE course_id=$1 AND version=$2',
      [COURSE_ID, version],
    );
    if (existing.rowCount) {
      if (existing.rows[0].checksum !== checksum) throw new Error('CONTENT_RELEASE_IS_IMMUTABLE');
      return { created: false, version, lessons: course.lessons.length, questions: bank.length };
    }
    await client.query(
      'INSERT INTO content.courses(id,title) VALUES ($1,$2) ON CONFLICT (id) DO NOTHING',
      [COURSE_ID, course.title],
    );
    await client.query(
      'INSERT INTO content.releases(course_id,version,checksum) VALUES ($1,$2,$3)',
      [COURSE_ID, version, checksum],
    );
    const scope = [COURSE_ID, version];
    await insertRows(
      client,
      'content.chapters',
      ['course_id', 'content_version', 'id', 'payload'],
      course.modules.map((item) => [...scope, item.id, JSON.stringify(item)]),
    );
    await insertRows(
      client,
      'content.lessons',
      ['course_id', 'content_version', 'id', 'chapter_id', 'payload'],
      course.lessons.map((item) => [...scope, item.id, item.module, JSON.stringify(item)]),
    );
    await insertRows(
      client,
      'content.sections',
      ['course_id', 'content_version', 'lesson_id', 'position', 'payload'],
      course.lessons.flatMap((lesson) =>
        lesson.sections.map((item, index) => [...scope, lesson.id, index, JSON.stringify(item)]),
      ),
    );
    await insertRows(
      client,
      'content.concepts',
      ['course_id', 'content_version', 'id', 'lesson_id', 'payload'],
      course.terms.map((item) => [...scope, item.id, item.lesson, JSON.stringify(item)]),
    );
    await insertRows(
      client,
      'content.commands',
      ['course_id', 'content_version', 'id', 'lesson_id', 'payload'],
      course.commands.map((item) => [...scope, item.id, item.lesson, JSON.stringify(item)]),
    );
    await insertRows(
      client,
      'content.questions',
      ['course_id', 'content_version', 'id', 'lesson_id', 'kind', 'payload'],
      bank.map((item) => [...scope, item.id, item.lesson, item.kind, JSON.stringify(item)]),
    );
    return { created: true, version, lessons: course.lessons.length, questions: bank.length };
  });
}
