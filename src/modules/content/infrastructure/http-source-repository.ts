import type { SourceRepository } from '../domain/source-repository';
export function createHttpSourceRepository(
  fetchImpl: typeof fetch = (...args) => fetch(...args),
): SourceRepository {
  return {
    async findById(id, signal) {
      if (!/^source-\d+$/.test(id)) throw new Error('Mã tài liệu không hợp lệ.');
      const response = await fetchImpl(`/data/${id}.json`, { signal });
      if (!response.ok) throw new Error('Không mở được chữ trích xuất từ PDF.');
      return response.json();
    },
  };
}
