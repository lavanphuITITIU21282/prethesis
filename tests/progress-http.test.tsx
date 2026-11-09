import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgressHandler } from '../src/app/_server/progress-http';
import { createUserProgressService } from '../src/modules/learning/application/user-progress-service';
import { ProgressConflictError } from '../src/modules/learning/infrastructure/postgres-progress-repository';
import { freshState } from '../src/shared/domain/study-core.js';
import { readFileSync } from 'node:fs';
import type { Course } from '../src/shared/domain/models';
const course: Course = JSON.parse(readFileSync('public/data/course.json', 'utf8'));
const id = '11111111-1111-4111-8111-111111111111';
const request = (body: unknown, account = id, origin = 'http://localhost') =>
  new Request('http://localhost/api/progress', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Study-Account': account, Origin: origin },
    body: JSON.stringify(body),
  });
test('progress API takes ownership only from session and rejects stale tabs, CSRF and malformed state', async () => {
  const owners: string[] = [];
  const service = createUserProgressService(
    {
      findForUser: async () => null,
      saveForUser: async (userId, state, revision) => {
        owners.push(userId);
        return { userId, state, revision: revision + 1, updatedAt: new Date().toISOString() };
      },
    },
    course,
  );
  const handler = createProgressHandler(service, async () => ({ userId: id }));
  assert.equal(
    (
      await createProgressHandler(
        service,
        async () => null,
      )(request({ state: freshState(), revision: 0 }))
    ).status,
    401,
  );
  assert.equal((await handler(request({ state: freshState(), revision: 0 }, 'other'))).status, 409);
  assert.equal(
    (await handler(request({ state: freshState(), revision: 0 }, id, 'https://other.invalid')))
      .status,
    403,
  );
  assert.equal(
    (await handler(request({ state: { version: 1, notes: {} }, revision: 0 }))).status,
    400,
  );
  assert.equal((await handler(request({ state: freshState(), revision: -1 }))).status, 400);
  assert.equal(owners.length, 0);
  const saved = await handler(
    request({ state: freshState(), revision: 0, userId: 'someone-else' }),
  );
  assert.equal(saved.status, 200);
  assert.equal(saved.headers.get('cache-control'), 'no-store');
  assert.deepEqual(owners, [id]);
});
test('progress conflicts are explicit and connection failures expose no SQL or credentials', async () => {
  const service = createUserProgressService(
    {
      findForUser: async () => {
        throw new Error('private database details');
      },
      saveForUser: async () => {
        throw new ProgressConflictError();
      },
    },
    course,
  );
  const handler = createProgressHandler(service, async () => ({ userId: id }));
  const conflict = await handler(request({ state: freshState(), revision: 2 }));
  assert.equal(conflict.status, 409);
  assert.equal((await conflict.json()).code, 'PROGRESS_CONFLICT');
  const get = await handler(
    new Request('http://localhost/api/progress', { headers: { 'X-Study-Account': id } }),
  );
  assert.equal(get.status, 503);
  assert.ok(!(await get.text()).includes('private database details'));
});
test('progress streaming size limit is enforced before a repository write', async () => {
  let writes = 0;
  const service = createUserProgressService(
    {
      findForUser: async () => null,
      saveForUser: async () => {
        writes++;
        throw new Error('must not write');
      },
    },
    course,
  );
  const response = await createProgressHandler(service, async () => ({ userId: id }))(
    request({ state: freshState(), revision: 0, padding: 'x'.repeat(8 * 1024 * 1024) }),
  );
  assert.equal(response.status, 413);
  assert.equal(writes, 0);
});
