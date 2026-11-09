import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookieToken, readCookie, sessionCookie } from './auth-http.mjs';

const FLOW_COOKIE = 'tram_hoc_google_flow';
const CALLBACK_PATH = '/api/auth/google/callback';
const FLOW_SECONDS = 600;
const randomValue = () => randomBytes(32).toString('base64url');
const sha256 = (value) => createHash('sha256').update(value).digest('base64url');

export function googleConfig(env = process.env) {
  const clientId = env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const origin = env.GOOGLE_OAUTH_ORIGIN || env.AUTH_ORIGIN;
  if (!clientId || !clientSecret || !origin) return null;
  try {
    const url = new URL(origin);
    const loopback =
      url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (url.origin !== origin || (url.protocol !== 'https:' && !loopback)) return null;
    return { clientId, clientSecret, origin: url.origin, callbackUrl: url.origin + CALLBACK_PATH };
  } catch {
    return null;
  }
}

function signature(payload, secret) {
  return createHmac('sha256', secret)
    .update('tram-hoc:google-flow:' + payload)
    .digest();
}

function readFlow(request, secret) {
  const parts = readCookie(request, FLOW_COOKIE).split('.');
  if (parts.length !== 2) return null;
  const [payload, mac] = parts;
  const expected = signature(payload, secret);
  const supplied = Buffer.from(mac, 'base64url');
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  const flow = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  return flow.expiresAt > Date.now() && flow.previous === sha256(cookieToken(request))
    ? flow
    : null;
}

export function createGoogleAuthHandler(authentication, exchangeCode, env = process.env) {
  return async (request, step) => {
    const headers = new Headers({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });
    const config = googleConfig(env);
    const fail = (error, status) => Response.json({ error }, { status, headers });
    if (!config) return fail('Đăng nhập Google chưa được cấu hình.', 503);
    const flowCookie = (value) =>
      `${FLOW_COOKIE}=${value}; Path=${CALLBACK_PATH}; HttpOnly; SameSite=Lax; Max-Age=${value ? FLOW_SECONDS : 0}${config.origin.startsWith('https:') ? '; Secure' : ''}`;

    if (step === 'start' && request.method === 'POST') {
      if (
        request.headers.get('origin') !== config.origin ||
        request.headers.get('sec-fetch-site') === 'cross-site'
      )
        return fail('Hãy mở Trạm học bằng địa chỉ đã cấu hình cho Google.', 403);
      const flow = {
        state: randomValue(),
        nonce: randomValue(),
        verifier: randomValue(),
        expiresAt: Date.now() + FLOW_SECONDS * 1000,
        previous: sha256(cookieToken(request)),
      };
      const payload = Buffer.from(JSON.stringify(flow)).toString('base64url');
      headers.set(
        'Set-Cookie',
        flowCookie(payload + '.' + signature(payload, config.clientSecret).toString('base64url')),
      );
      const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      url.search = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.callbackUrl,
        response_type: 'code',
        scope: 'openid profile',
        state: flow.state,
        nonce: flow.nonce,
        code_challenge: sha256(flow.verifier),
        code_challenge_method: 'S256',
        prompt: 'select_account',
      }).toString();
      return Response.json({ authorizationUrl: url.href }, { headers });
    }

    if (step !== 'callback' || request.method !== 'GET')
      return fail('Phương thức không được hỗ trợ.', 405);

    const redirect = (status) => {
      headers.set('Location', config.origin + '/account' + (status ? '?google=' + status : ''));
      return new Response(null, { status: 303, headers });
    };
    headers.set('Set-Cookie', flowCookie(''));
    try {
      const query = new URL(request.url).searchParams;
      const flow = readFlow(request, config.clientSecret);
      if (!flow || query.get('state') !== flow.state) return redirect('expired');
      if (query.get('error') === 'access_denied') return redirect('cancelled');
      const code = query.get('code');
      if (!code || query.has('error')) return redirect('failed');
      if (!(await authentication.allowGoogle())) return redirect('busy');
      const profile = await exchangeCode(config, code, flow.verifier);
      if (
        profile?.nonce !== flow.nonce ||
        typeof profile.sub !== 'string' ||
        !profile.sub ||
        profile.sub.length > 255
      )
        return redirect('failed');
      // The verified provider subject identifies the account. Display names never link accounts.
      const name = typeof profile.name === 'string' ? profile.name.trim().slice(0, 100) : '';
      const token = await authentication.google(
        { subject: profile.sub, name: name || 'Bạn học' },
        cookieToken(request),
      );
      headers.append('Set-Cookie', sessionCookie(token, config.origin, env));
      return redirect('');
    } catch {
      return redirect('failed');
    }
  };
}
