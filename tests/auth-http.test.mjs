import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthHandler } from '../src/app/_server/auth-http.mjs';

test('authentication HTTP rejects cross-origin, malformed and oversized bodies before touching credentials', async () => {
  let calls = 0;
  const handler = createAuthHandler(
    {
      login: async () => {
        calls++;
        return 'a'.repeat(64);
      },
      session: async () => null,
    },
    { AUTH_ORIGIN: 'https://study.example' },
  );
  const req = (body, origin = 'https://study.example') =>
    new Request('http://internal/api/auth/login', {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body,
    });
  assert.equal((await handler(req('{}', 'https://bad.example'), 'login')).status, 403);
  assert.equal((await handler(req('x'.repeat(4097)), 'login')).status, 413);
  assert.equal((await handler(req('not-json'), 'login')).status, 400);
  assert.equal(calls, 0);
  const response = await handler(req('{}'), 'login');
  assert.match(response.headers.get('set-cookie'), /; Secure/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { ok: true });
});
