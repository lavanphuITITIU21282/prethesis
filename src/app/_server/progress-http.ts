import type { AuthenticatedPrincipal } from '@/modules/identity';
import type { createUserProgressService } from '@/modules/learning/application/user-progress-service';
import { ProgressConflictError } from '@/modules/learning/infrastructure/postgres-progress-repository';

export function createProgressHandler(
  service: ReturnType<typeof createUserProgressService>,
  getPrincipal: (request: Request) => Promise<AuthenticatedPrincipal | null>,
  env: { AUTH_ORIGIN?: string } = { AUTH_ORIGIN: process.env.AUTH_ORIGIN },
) {
  return async (request: Request) => {
    const json = (body: unknown, status = 200) =>
      Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
    try {
      const principal = await getPrincipal(request);
      if (!principal)
        return json({ code: 'UNAUTHENTICATED', error: 'Phiên đăng nhập đã kết thúc.' }, 401);
      // This header is a stale-tab guard, never the authority used to choose an owner.
      if (request.headers.get('x-study-account') !== principal.userId)
        return json(
          {
            code: 'ACCOUNT_CHANGED',
            error: 'Tài khoản đã thay đổi. Tải lại trang trước khi tiếp tục.',
          },
          409,
        );
      if (request.method === 'GET') return json({ progress: await service.find(principal) });
      if (request.method !== 'PUT') return json({ error: 'Phương thức không được hỗ trợ.' }, 405);
      const origin = env.AUTH_ORIGIN || new URL(request.url).origin;
      if (
        request.headers.get('origin') !== origin ||
        request.headers.get('sec-fetch-site') === 'cross-site'
      )
        return json({ error: 'Nguồn yêu cầu không hợp lệ.' }, 403);
      if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || ''))
        return json({ error: 'Cần dữ liệu JSON.' }, 415);
      const reader = request.body?.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      if (reader) {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > 8 * 1024 * 1024) {
              await reader.cancel();
              return json({ error: 'Bản lưu vượt giới hạn 8 MiB.' }, 413);
            }
            chunks.push(value);
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
      if (
        !input ||
        !Number.isSafeInteger(input.revision) ||
        input.revision < 0 ||
        !input.state ||
        input.state.version !== 1 ||
        ![
          'notes',
          'read',
          'reviews',
          'drafts',
          'bossScores',
          'aiGrades',
          'activity',
          'settings',
          'quizFilters',
        ].every(
          (key) =>
            input.state[key] &&
            typeof input.state[key] === 'object' &&
            !Array.isArray(input.state[key]),
        ) ||
        !Array.isArray(input.state.history) ||
        !Array.isArray(input.state.quizSessions)
      )
        return json({ error: 'Bản lưu hoặc revision không hợp lệ.' }, 400);
      let result;
      try {
        result = await service.save(principal, input.state, input.revision);
      } catch (error) {
        if (error instanceof ProgressConflictError)
          return json(
            { code: 'PROGRESS_CONFLICT', error: 'Tiến độ đã thay đổi trên thiết bị khác.' },
            409,
          );
        throw error;
      }
      return json({ progress: result });
    } catch (error) {
      if ((error as { code?: string })?.code === '23514')
        return json(
          {
            code: 'INVALID_STATE',
            error:
              'Bản lưu không đáp ứng giới hạn dữ liệu. Hãy xuất JSON để giữ bản nháp và giảm dữ liệu trước khi thử lại.',
          },
          422,
        );
      return json(
        {
          code: 'UNAVAILABLE',
          error: 'Chưa lưu được lên máy chủ. Bản nháp trên thiết bị vẫn được giữ.',
        },
        503,
      );
    }
  };
}
