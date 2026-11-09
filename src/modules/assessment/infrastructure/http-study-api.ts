import type { GradingGateway } from '../domain/grading-gateway';
export function createHttpStudyApi(
  fetchImpl: typeof fetch = (...args) => fetch(...args),
): GradingGateway {
  async function request(path: string, body?: object, signal?: AbortSignal) {
    const response = await fetchImpl(`/api/${path}`, {
      ...(body
        ? {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
        : {}),
      signal,
    });
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Máy chủ trả dữ liệu không hợp lệ. Bài làm vẫn được giữ.');
    }
    if (!response.ok) throw new Error(data.error || 'Không kết nối được máy chủ.');
    return data;
  }
  return {
    gradingStatus: (signal) => request('grading/status', undefined, signal),
    grade: (lessonId, answer, signal) => request('grade', { lessonId, answer }, signal),
  };
}
