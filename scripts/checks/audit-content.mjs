import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { buildQuestions } from '../../src/shared/domain/study-core.js';
const course = JSON.parse(readFileSync(new URL('../../public/data/course.json', import.meta.url)));
const bank = buildQuestions(course);
const sections = course.lessons.flatMap((l) => l.sections);
const original = sections.reduce((n, s) => n + s.body.length, 0);
const added = sections.reduce(
  (n, s) =>
    n +
    [
      ...s.study.paragraphs,
      s.study.example.title,
      ...s.study.example.steps,
      s.study.checkpoint.question,
      s.study.checkpoint.answer,
    ].join('').length,
  0,
);
const figures = new Set(
  sections.flatMap((s) => s.study.references.map((r) => `${r.source}/${r.page}`)),
);
const report = [
  'RÀ SOÁT VÀ BỔ SUNG NỘI DUNG HỌC TẬP — 29/10/2026',
  '',
  'PHẠM VI: 5 chương, 25 bài, 75 phần của sáu PDF người dùng cung cấp.',
  'Không tuyên bố bao phủ mọi chủ đề trên Hands-on Security hoặc mọi chi tiết của từng trang PDF.',
  'PDF có cả bìa, lịch học, minh họa và chữ nằm trong hình; trang gốc vẫn mở được để đối chiếu.',
  '',
  `Trước: 75 đoạn tóm tắt, tổng ${original.toLocaleString('en-US')} ký tự nội dung body.`,
  `Bổ sung: ${added.toLocaleString('en-US')} ký tự giải thích/ví dụ/lời giải được biên soạn riêng.`,
  `Hiện có: ${(original + added).toLocaleString('en-US')} ký tự bài đọc, gấp ${((original + added) / original).toFixed(2)} lần phần tóm tắt.`,
  'Phép đo không tính định nghĩa thuật ngữ lặp lại, mã lệnh, nhãn UI và chữ trong hình.',
  `${sections.length} phần có giải thích nhiều đoạn + ví dụ ít nhất 3 bước + câu tự kiểm tra và lời giải.`,
  `${figures.size} ảnh trang PDF riêng, dùng ở ${sections.length} phần; 3 trang ghi chú cũng được gắn trong bài.`,
  `${course.terms.length} thuật ngữ tiếng Anh, ${course.commands.length} ví dụ lệnh/API, ${bank.length} câu trong ngân hàng.`,
  `${sections.length} câu tự kiểm tra có lời giải nằm trực tiếp trong bài, tách với ngân hàng Luyện tập.`,
  '',
  'CHI TIẾT THEO BÀI (trang nguồn bổ sung nằm trong study.references của từng phần)',
  ...course.modules.flatMap((m) => [
    '',
    `CHƯƠNG ${m.number}: ${m.title}`,
    ...course.lessons
      .filter((l) => l.module === m.id)
      .map((l) => {
        const refs = l.sections
          .map(
            (s, i) =>
              `P${i + 1}: ${s.study.references.map((r) => `${r.source}/tr.${r.page}`).join(', ')}`,
          )
          .join('; ');
        return `- ${l.title}: ${l.sections.length} phần mở rộng; ${l.terms.length} thuật ngữ. ${refs}`;
      }),
  ]),
  '',
  'NHỮNG THIẾU SÓT CHÍNH ĐÃ XỬ LÝ',
  '- Nền tảng: chuỗi Asset/Threat/Vulnerability, threat model, kiểm quyền, audit và giới hạn bằng chứng.',
  '- Ứng dụng: vai trò key, encoding, CSPRNG, vòng đời key, envelope encryption, certificate chain và ngữ cảnh ký.',
  '- Đối xứng: tính Caesar/Hill/XOR, điều kiện OTP, AES round/Feistel, công thức mode, padding, lỗi lan truyền và counter.',
  '- Hash: ba bài toán tấn công, birthday định lượng, state/block, byte/API, commitment, password verifier và HMAC.',
  '- Công khai: Euclid từng bước, Euler/CRT, DH/MITM/nhóm, RSA thô, OAEP/PSS, PEM/API và ràng buộc giao thức.',
  '',
  'PHÂN BIỆT NỘI DUNG NGUỒN VÀ PHẦN BỔ SUNG',
  '- Hình trang PDF giữ nguyên nội dung/tác giả trong tài liệu gốc.',
  '- Giải thích tiếng Việt, dữ liệu số minh họa, câu tự kiểm tra và lời giải do website biên soạn.',
  '- Sửa cách nói giản lược trong slide: bậc nhóm DH, chữ ký không phải mã hóa ngược,',
  '  RSA transport khác TLS1.3, kiểu padding, định dạng checksum và mức an toàn không chỉ là số bit.',
  '- Đối chiếu bổ sung: FIPS197, SP800-38A, RFC8017, RFC2104, RFC8446 và Python hashlib;',
  '  URL cụ thể có trong Thư viện và public/data/course.json.references.',
];
// Update only this generated section; preserve the project's technical history.
const reportPath = new URL('../../docs/PROJECT_REPORT.txt', import.meta.url);
const begin = '[[BEGIN CONTENT_AUDIT]]',
  end = '[[END CONTENT_AUDIT]]';
const previous = existsSync(reportPath) ? readFileSync(reportPath, 'utf8') : '';
const section = begin + '\n' + report.join('\n') + '\n' + end;
const starts = previous.split(begin).length - 1,
  ends = previous.split(end).length - 1;
if (
  starts !== ends ||
  starts > 1 ||
  (starts === 1 && previous.indexOf(end) < previous.indexOf(begin))
) {
  throw Error('Invalid CONTENT_AUDIT markers in PROJECT_REPORT.txt; report left unchanged');
}
const updated =
  starts === 1
    ? previous.slice(0, previous.indexOf(begin)) +
      section +
      previous.slice(previous.indexOf(end) + end.length)
    : previous.trimEnd() + '\n\n' + section + '\n';
writeFileSync(reportPath, updated);
console.log(
  JSON.stringify({
    summaryChars: original,
    addedChars: added,
    ratio: Number(((original + added) / original).toFixed(2)),
    guides: sections.length,
    sourceImages: figures.size,
    terms: course.terms.length,
    commands: course.commands.length,
    questions: bank.length,
  }),
);
