import type { HashGateway } from '../domain/hash-gateway';

export function createHashService(gateway: HashGateway) {
  return {
    async compareHashes(values: string[], signal?: AbortSignal) {
      const hashes = await Promise.all(
        values.map(async (text) => (await gateway.hash(text, signal)).hex),
      );
      if (hashes.some((hash) => !/^[a-f0-9]{64}$/.test(hash)))
        throw new Error('Máy chủ trả digest không hợp lệ.');
      return hashes;
    },
  };
}
