import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createGoogleAuthHandler, googleConfig } from '../src/app/_server/google-auth-http.mjs';

const env = {
  AUTH_ORIGIN: 'https://study.example',
  GOOGLE_OAUTH_CLIENT_ID: 'test-client',
  GOOGLE_OAUTH_CLIENT_SECRET: 'test-secret',
};

test('Google OAuth is opt-in and requires a canonical HTTPS or loopback origin', () => {
  assert.equal(googleConfig({}), null);
  assert.equal(googleConfig({ ...env, AUTH_ORIGIN: 'http://192.168.1.20:4173' }), null);
  assert.equal(
    googleConfig({ ...env, AUTH_ORIGIN: 'http://localhost:4173' }).callbackUrl,
    'http://localhost:4173/api/auth/google/callback',
  );
});

test('Google callback binds state, PKCE, nonce and the initiating local session', async () => {
  let nonce;
  let challenge;
  let exchanges = 0;
  let issued = 0;
  let allowed = true;
  const handler = createGoogleAuthHandler(
    {
      async allowGoogle() {
        return allowed;
      },
      async google(profile, previous) {
        assert.deepEqual(profile, { subject: 'google-subject', name: 'Bạn học Google' });
        assert.equal(previous, 'previous');
        issued++;
        return 'local-session';
      },
    },
    async (config, code, verifier) => {
      exchanges++;
      assert.equal(config.callbackUrl, env.AUTH_ORIGIN + '/api/auth/google/callback');
      assert.equal(createHash('sha256').update(verifier).digest('base64url'), challenge);
      return {
        sub: 'google-subject',
        name: 'Bạn học Google',
        nonce: code === 'good' ? nonce : 'wrong',
      };
    },
    env,
  );
  const start = (origin) =>
    handler(
      new Request(env.AUTH_ORIGIN + '/api/auth/google/start', {
        method: 'POST',
        headers: { Origin: origin, Cookie: 'tram_hoc_session=previous' },
      }),
      'start',
    );
  assert.equal((await start('https://other.example')).status, 403);
  const response = await start(env.AUTH_ORIGIN);
  assert.equal(response.status, 200);
  const [flowCookie] = response.headers.getSetCookie();
  assert.match(flowCookie, /HttpOnly; SameSite=Lax; Max-Age=600; Secure/);
  const flow = flowCookie.split(';')[0];
  const authorization = new URL((await response.json()).authorizationUrl);
  assert.equal(authorization.origin, 'https://accounts.google.com');
  assert.equal(authorization.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(authorization.searchParams.get('scope'), 'openid profile');
  const state = authorization.searchParams.get('state');
  nonce = authorization.searchParams.get('nonce');
  challenge = authorization.searchParams.get('code_challenge');
  const callback = (query, cookie = flow + '; tram_hoc_session=previous') =>
    handler(
      new Request(env.AUTH_ORIGIN + '/api/auth/google/callback?' + query, {
        headers: { Cookie: cookie },
      }),
      'callback',
    );
  for (const result of [
    await callback('state=forged&code=good'),
    await callback('state=' + state + '&code=good', flow + '; tram_hoc_session=changed'),
    await callback('state=' + state + '&code=good', 'tram_hoc_google_flow=forged.abc'),
  ]) {
    assert.equal(result.headers.get('location'), env.AUTH_ORIGIN + '/account?google=expired');
  }
  assert.equal(exchanges, 0);
  const cancelled = await callback('state=' + state + '&error=access_denied');
  assert.equal(cancelled.headers.get('location'), env.AUTH_ORIGIN + '/account?google=cancelled');
  const invalid = await callback('state=' + state + '&code=wrong-nonce');
  assert.equal(invalid.headers.get('location'), env.AUTH_ORIGIN + '/account?google=failed');
  assert.equal(issued, 0);
  allowed = false;
  const limited = await callback('state=' + state + '&code=good');
  assert.equal(limited.headers.get('location'), env.AUTH_ORIGIN + '/account?google=busy');
  assert.equal(exchanges, 1);
  allowed = true;
  const success = await callback('state=' + state + '&code=good');
  assert.equal(success.status, 303);
  assert.equal(success.headers.get('location'), env.AUTH_ORIGIN + '/account');
  assert.equal(issued, 1);
  const [cleared, session] = success.headers.getSetCookie();
  assert.match(cleared, /tram_hoc_google_flow=;.*Max-Age=0/);
  assert.match(
    session,
    /tram_hoc_session=local-session;.*HttpOnly; SameSite=Lax; Max-Age=604800; Secure/,
  );
});
