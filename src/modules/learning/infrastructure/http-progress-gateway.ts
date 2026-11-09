import type { AccountProgressGateway } from '../domain/account-progress';
export class ProgressRequestError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export function createHttpProgressGateway(accountId: string): AccountProgressGateway {
  async function request(state?: unknown, revision?: number) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('/api/progress', {
        method: state === undefined ? 'GET' : 'PUT',
        credentials: 'same-origin',
        cache: 'no-store',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'X-Study-Account': accountId },
        body: state === undefined ? undefined : JSON.stringify({ state, revision }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new ProgressRequestError(
          data.code || 'UNAVAILABLE',
          data.error || 'Chưa kết nối được máy chủ.',
        );
      return data.progress;
    } finally {
      clearTimeout(timer);
    }
  }
  return { load: () => request(), save: (state, revision) => request(state, revision) };
}
