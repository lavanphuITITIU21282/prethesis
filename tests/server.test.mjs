import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from './helpers/http-server.mjs';
let server, base;
before(async () => {
  server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

test('health identifies Next.js without exposing credentials', async () => {
  const response = await fetch(base + '/api/health');
  const health = await response.json();
  assert.equal(response.status, 200);
  assert.equal(health.ok, true);
  assert.equal(health.version, 2);
  assert.equal(health.framework, 'Next.js');
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
test('hash API computes UTF-8 SHA-256 and rejects malformed or oversized input', async () => {
  const post = (body) => fetch(base + '/api/hash', { method: 'POST', body });
  const response = await post(JSON.stringify({ text: 'Hello world' }));
  assert.equal(
    (await response.json()).hex,
    '64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c',
  );
  assert.equal((await post('not json')).status, 400);
  assert.equal((await post('null')).status, 400);
  assert.equal((await post(JSON.stringify({ text: 'x'.repeat(70000) }))).status, 413);
});
test('PDF ranges and HEAD preserve local document viewing', async () => {
  const response = await fetch(base + '/documents/source-1', { headers: { Range: 'bytes=0-4' } });
  assert.equal(response.status, 206);
  assert.equal(await response.text(), '%PDF-');
  assert.match(response.headers.get('content-range'), /^bytes 0-4\//);
  const head = await fetch(base + '/documents/source-1', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.equal(head.headers.get('content-type'), 'application/pdf');
  for (const range of ['bytes=999999999-', 'bytes=-0', 'bytes=10-2', 'bytes=0-1,4-5']) {
    assert.equal(
      (await fetch(base + '/documents/source-1', { headers: { Range: range } })).status,
      416,
    );
  }
});
test('documents require manifest ids and API methods are constrained', async () => {
  for (const path of [
    '/documents/server.mjs',
    '/documents/..%2f.env.local',
    '/.env.local',
    '/src/server/grading.mjs',
  ]) {
    assert.equal((await fetch(base + path)).status, 404, path);
  }
  assert.equal((await fetch(base + '/api/hash', { method: 'DELETE' })).status, 405);
  assert.equal((await fetch(base + '/api/missing')).status, 404);
});
