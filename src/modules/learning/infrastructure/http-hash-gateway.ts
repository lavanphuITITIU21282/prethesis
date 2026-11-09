import type { HashGateway } from '../domain/hash-gateway';

export function createHttpHashGateway(
  fetchImpl: typeof fetch = (...args) => fetch(...args),
): HashGateway {
  return {
    async hash(text, signal) {
      const response = await fetchImpl('/api/hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal,
      });
      if (!response.ok) throw new Error('Máy chủ chưa tính được hash.');
      return response.json();
    },
  };
}
