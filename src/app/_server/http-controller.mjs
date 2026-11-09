import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';
import { createGrader, GradingError } from '../../modules/assessment/server.mjs';
import { course, sources } from '../../modules/content/server.mjs';
import { createFileDocumentRepository } from '../../modules/content/infrastructure/file-document-repository.mjs';

const documentRepository = createFileDocumentRepository(sources);

const json = (body, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const failure = (message, status, code) =>
  json({ error: message, ...(code ? { code } : {}) }, status);

async function readJSON(request) {
  // Enforce the limit while streaming; Content-Length is not a trusted size limit.
  const reader = request.body?.getReader();
  const chunks = [];
  let size = 0;
  if (reader) {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 65536) {
          await reader.cancel();
          throw new GradingError('BODY_TOO_LARGE', 'Dữ liệu vượt giới hạn 64 KiB.', 413);
        }
        chunks.push(Buffer.from(value));
      }
    } finally {
      reader.releaseLock();
    }
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new GradingError('INVALID_JSON', 'JSON không hợp lệ.', 400);
  }
}

export function createApi({
  grader = createGrader({
    course,
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL,
  }),
} = {}) {
  return async function handleApi(request) {
    const path = new URL(request.url).pathname;
    if (path === '/api/health' && request.method === 'GET') {
      return json({ ok: true, app: 'Trạm học', version: 2, framework: 'Next.js' });
    }
    if (path === '/api/grading/status' && request.method === 'GET') return json(grader.status());
    if (!['/api/grade', '/api/hash'].includes(path)) return failure('Không tìm thấy API.', 404);
    if (request.method !== 'POST') return failure('Phương thức không được hỗ trợ.', 405);
    try {
      if (path === '/api/grade') {
        const origin = request.headers.get('origin');
        if (
          request.headers.get('sec-fetch-site') === 'cross-site' ||
          (origin && origin !== new URL(request.url).origin)
        ) {
          return failure('Chỉ gửi chấm bài từ chính website Trạm học.', 403, 'ORIGIN_DENIED');
        }
        if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) {
          return failure('Cần dữ liệu JSON.', 415, 'INVALID_CONTENT_TYPE');
        }
      }
      const input = await readJSON(request);
      if (path === '/api/hash') {
        if (!input || typeof input.text !== 'string') return failure('Cần chuỗi văn bản.', 400);
        return json({ hex: createHash('sha256').update(input.text, 'utf8').digest('hex') });
      }
      if (!input || typeof input.lessonId !== 'string' || typeof input.answer !== 'string') {
        return failure('Cần mã bài và phần trả lời.', 400, 'INVALID_INPUT');
      }
      // Personal LAN requests share a conservative bucket; do not trust spoofable forwarding headers.
      return json(
        await grader.grade({ lessonId: input.lessonId, answer: input.answer, client: 'personal' }),
      );
    } catch (error) {
      return error instanceof GradingError
        ? failure(error.message, error.status, error.code)
        : failure('Chưa xử lý được yêu cầu. Bài làm của bạn vẫn được giữ.', 500, 'REQUEST_FAILED');
    }
  };
}

let api;
export const handleApi = (request) => (api ??= createApi())(request);

export async function serveDocument(request, id) {
  // Resolve filenames exclusively through the source manifest to prevent path traversal.
  const document = await documentRepository.findById(id);
  if (!document) return failure('Không có tài liệu này.', 404);
  if (!['GET', 'HEAD'].includes(request.method))
    return failure('Phương thức không được hỗ trợ.', 405);
  const info = { size: document.size };
  let start = 0;
  let end = info.size - 1;
  let status = 200;
  const headers = {
    'Content-Type': 'application/pdf',
    'Cache-Control': 'no-cache',
    'Accept-Ranges': 'bytes',
  };
  const range = request.headers.get('range');
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    const invalid = () =>
      new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${info.size}` } });
    if (!match || (!match[1] && !match[2])) return invalid();
    if (!match[1]) start = Math.max(0, info.size - Number(match[2]));
    else {
      start = Number(match[1]);
      if (match[2]) end = Math.min(Number(match[2]), end);
    }
    if (
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start > end ||
      start >= info.size
    )
      return invalid();
    status = 206;
    headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
  }
  headers['Content-Length'] = String(end - start + 1);
  if (request.method === 'HEAD') return new Response(null, { status, headers });
  const stream = document.openRange(start, end);
  request.signal?.addEventListener('abort', () => stream.destroy(), { once: true });
  return new Response(Readable.toWeb(stream), { status, headers });
}
