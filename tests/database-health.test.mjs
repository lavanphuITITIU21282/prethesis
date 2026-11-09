import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabaseHealth } from '../src/app/_server/database-health.mjs';
import { serverDatabaseConfig } from '../src/shared/infrastructure/database-config.mjs';

test('database health is uncached and never leaks connection errors or credentials', async () => {
  const healthy = await createDatabaseHealth({ query: async () => ({ rows: [{ value: 1 }] }) })();
  assert.equal(healthy.status, 200);
  assert.equal(healthy.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await healthy.json(), { ok: true, database: 'postgresql' });
  const unavailable = await createDatabaseHealth({
    query: async () => {
      throw new Error('private-password postgres://internal');
    },
  })();
  assert.equal(unavailable.status, 503);
  assert.deepEqual(await unavailable.json(), { ok: false, code: 'DATABASE_UNAVAILABLE' });
});
test('invalid explicit database URLs fail without falling back to administrator credentials', () => {
  assert.throws(
    () => serverDatabaseConfig('unused', { DATABASE_URL: 'https://wrong.invalid' }),
    /INVALID_DATABASE_URL/,
  );
  assert.throws(() => serverDatabaseConfig('unused', { DATABASE_URL: 'not-a-url' }));
});
