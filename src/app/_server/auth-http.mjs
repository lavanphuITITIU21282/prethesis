import { AuthError } from '../../modules/identity/application/auth-service.mjs';
export const SESSION_COOKIE = 'tram_hoc_session';
export function readCookie(request, name) {
  return (
    (request.headers.get('cookie') || '')
      .split(';')
      .map((x) => x.trim())
      .find((x) => x.startsWith(name + '='))
      ?.slice(name.length + 1) || ''
  );
}
export const cookieToken = (request) => readCookie(request, SESSION_COOKIE);
export function sessionCookie(value, origin, env) {
  const secure = env.AUTH_COOKIE_SECURE === 'true' || new URL(origin).protocol === 'https:';
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${value ? 604800 : 0}${secure ? '; Secure' : ''}`;
}
export function createAuthHandler(authentication, env = process.env) {
  return async (request, action) => {
    const json = (body, status = 200, headers = {}) =>
      Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
    try {
      const token = cookieToken(request);
      if (request.method === 'GET' && ['session', 'me'].includes(action)) {
        const principal = await authentication.session(token);
        if (!principal && action === 'me') return json({ error: 'Cần đăng nhập.' }, 401);
        return json({
          user: principal ? { id: principal.user_id, name: principal.display_name } : null,
        });
      }
      if (request.method !== 'POST' || !['login', 'register', 'logout'].includes(action))
        return json({ error: 'Phương thức không được hỗ trợ.' }, 405);
      const expected = env.AUTH_ORIGIN || new URL(request.url).origin;
      if (
        request.headers.get('origin') !== expected ||
        request.headers.get('sec-fetch-site') === 'cross-site'
      )
        return json({ error: 'Nguồn yêu cầu không hợp lệ.' }, 403);
      const cookie = (value) => sessionCookie(value, expected, env);
      if (action === 'logout') {
        await authentication.logout(token);
        return json({ ok: true }, 200, { 'Set-Cookie': cookie('') });
      }
      if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || ''))
        return json({ error: 'Cần dữ liệu JSON.' }, 415);
      const reader = request.body?.getReader();
      let size = 0;
      const chunks = [];
      if (reader) {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > 4096) {
              await reader.cancel();
              return json({ error: 'Dữ liệu quá lớn.' }, 413);
            }
            chunks.push(Buffer.from(value));
          }
        } finally {
          reader.releaseLock();
        }
      }
      let input;
      try {
        input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch {
        return json({ error: 'JSON không hợp lệ.' }, 400);
      }
      const next = await authentication[action](input, token);
      return json({ ok: true }, 200, { 'Set-Cookie': cookie(next) });
    } catch (error) {
      if (error instanceof AuthError) {
        const messages = {
          INVALID_INPUT:
            'Kiểm tra tên đăng nhập, tên hiển thị và mật khẩu (15–128 ký tự khi đăng ký).',
          INVALID_CREDENTIALS: 'Tên đăng nhập hoặc mật khẩu không đúng.',
          REGISTRATION_FAILED: 'Chưa tạo được tài khoản. Thử tên khác hoặc đăng nhập.',
          TRY_LATER: 'Quá nhiều lần thử. Vui lòng thử lại sau.',
        };
        return json(
          { error: messages[error.code] },
          error.status,
          error.status === 429 ? { 'Retry-After': '900' } : {},
        );
      }
      return json({ error: 'Chưa kết nối được dịch vụ tài khoản. Vui lòng thử lại.' }, 503);
    }
  };
}
