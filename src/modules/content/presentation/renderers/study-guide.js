import { escapeHTML as e } from '../../../../shared/domain/study-core.js';
import { termAnnotationHTML, termLabelHTML } from './term-label.js';
const emblem = (name) =>
  `<svg class="study-emblem" viewBox="0 0 120 120" aria-hidden="true"><use href="/assets/study-emblems.svg#${name}"/></svg>`;
const heading = (number, kicker, title, icon) =>
  `<div class="study-block-heading"><span class="study-block-number" aria-hidden="true">${number}</span><div><span class="eyebrow">${kicker}</span><h3>${title}</h3></div>${emblem(icon)}</div>`;
export function studyGuideHTML(section, lesson, course, sources) {
  const study = section.study;
  if (!study) return '';
  const terms = (section.terms || [])
    .map((id) => course.terms.find((t) => t.id === id))
    .filter(Boolean);
  const commands = (section.commands || [])
    .map((id) => course.commands.find((c) => c.id === id))
    .filter(Boolean);
  const references = (study.references || []).flatMap((ref) => {
    const source = sources.find((s) => s.id === ref.source);
    return source && Number.isInteger(ref.page) && ref.page >= 1 && ref.page <= source.pageCount
      ? [{ ...ref, source }]
      : [];
  });
  const index = lesson.sections.findIndex((item) => item.title === section.title);
  const earlierPages = new Set(
    lesson.sections
      .slice(0, Math.max(0, index))
      .flatMap((item) => (item.study?.references || []).map((ref) => `${ref.source}:${ref.page}`)),
  );
  const stages = [
    ['compass', 'Hiểu cơ chế'],
    ['brush', 'Theo ví dụ'],
    ['scroll', 'Nhớ thuật ngữ'],
    ...(commands.length ? [['brush', 'Đọc code']] : []),
    ['seal', 'Tự kiểm tra'],
    ['books', 'Đối chiếu nguồn'],
  ];
  return `<div class="study-guide">
 <div class="study-overview"><span class="study-overview-label">TRONG PHẦN NÀY</span><p>Đi theo từng bước; mở thuật ngữ và lời giải khi bạn cần.</p></div>
 <ol class="study-journey" aria-label="Các bước trong phần học">${stages.map(([icon, title], i) => `<li>${emblem(icon)}<span><small>${String(i + 1).padStart(2, '0')}</small>${title}</span></li>`).join('')}</ol>
 <div class="study-keywords" aria-label="Các thuật ngữ chính trong phần này"><span>THUẬT NGỮ TRỌNG TÂM</span><div>${terms.map((t) => `<button class="study-keyword" data-action="term" data-id="${e(t.id)}" title="${e([t.name, t.englishFull, t.vi].filter(Boolean).join(' · '))}">${termLabelHTML(t)}</button>`).join('')}</div></div>
 <section class="study-explanation" aria-label="Giải thích chi tiết">${heading('01', 'GIẢI THÍCH CHI TIẾT', 'Hiểu kỹ cơ chế và giới hạn', 'compass')}<div class="study-explanation-copy">${study.paragraphs.map((p) => `<p>${e(p)}</p>`).join('')}</div><div class="study-section-flourish" aria-hidden="true"><span>✦</span></div></section>
 <section class="study-example">${heading('02', 'VÍ DỤ CÓ LỜI GIẢI', e(study.example.title), 'brush')}<ol>${study.example.steps.map((step, i) => `<li><span class="study-step-number" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><p>${e(step)}</p></li>`).join('')}</ol></section>
 <section class="study-concepts">${heading('03', 'THUẬT NGỮ · ANH–VIỆT', `Thuật ngữ trong phần này <span class="count">${terms.length}</span>`, 'scroll')}<p class="status-note">Tên tiếng Anh được giữ nguyên. Mỗi thẻ có nghĩa tiếng Việt; từ viết tắt có tên tiếng Anh đầy đủ. Mở thẻ để xem giải thích và ví dụ.</p><div class="study-term-grid">${terms.map((t, i) => `<details class="study-term"><summary><span class="study-term-index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>${termLabelHTML(t)}<span class="study-term-chevron" aria-hidden="true">＋</span></summary><div class="study-term-body">${termAnnotationHTML(t)}<p>${e(t.definition)}</p><div class="study-term-context"><span>NGỮ CẢNH</span><p>${e(t.scenario)}</p></div><div class="study-term-pitfall"><span>DỄ NHẦM</span><p>${e(t.pitfall)}</p></div><button class="text-link" data-action="term" data-id="${e(t.id)}">Mở thẻ và câu hỏi thuật ngữ →</button></div></details>`).join('')}</div></section>
 ${commands.length ? `<section class="study-commands">${heading('04', 'HIỂU TỪNG THÀNH PHẦN', 'Đọc cú pháp ngay trong bài', 'brush')}${commands.map((c) => `<div class="study-command"><h4>${e(c.title)}</h4><p>${e(c.situation)}</p><div class="study-code-window"><div class="study-code-bar"><span class="study-code-lights" aria-hidden="true"><i></i><i></i><i></i></span><span>${e(c.environment)}</span><small>VÍ DỤ CODE</small></div><pre><code>${e(c.code)}</code></pre></div><details class="study-token-details"><summary>Từng thành phần trong trường hợp này dùng để làm gì?</summary><dl>${c.tokens.map((t) => `<dt><code>${e(t.token)}</code></dt><dd>${e(t.meaning)}</dd>`).join('')}</dl></details><div class="study-command-result"><b>Kết quả</b><p>${e(c.result)}</p></div><p class="status-note"><b>Giới hạn:</b> ${e(c.warning)}</p><a class="text-link" href="#/commands/${e(c.id)}">Mở trang giải mã lệnh →</a></div>`).join('')}</section>` : ''}
 <section class="study-checkpoint">${heading(commands.length ? '05' : '04', 'TỰ KIỂM TRA · LẬP LUẬN TRƯỚC KHI XEM', 'Dừng lại, thử giải thích.', 'seal')}<div class="study-question-paper"><span class="study-question-label">CÂU HỎI SUY LUẬN</span><h4>${e(study.checkpoint.question)}</h4></div><details class="study-solution"><summary>Xem lời giải và lập luận</summary><div><span class="eyebrow">MỘT CÁCH LẬP LUẬN</span><p>${e(study.checkpoint.answer)}</p></div></details></section>
 <section class="study-sources">${heading(commands.length ? '06' : '05', 'TRỞ VỀ TÀI LIỆU GỐC', 'Hình và trang nguồn để đối chiếu', 'books')}<p class="status-note">Hình từ PDF trong thư mục. Phần giải thích tiếng Việt có bổ sung ví dụ và lưu ý; hình gốc có thể dùng cách nói giản lược hoặc ví dụ lịch sử.</p>${references.map((ref, i) => (earlierPages.has(`${ref.source.id}:${ref.page}`) ? `<div class="study-source-repeat"><strong>${e(ref.source.file)} · trang ${ref.page}</strong><p>Trang này đã xuất hiện ở phần trước của bài; bạn có thể mở lại để đối chiếu.</p><div class="inline-actions"><button class="btn secondary small" data-action="source" data-id="${e(ref.source.id)}" data-page="${ref.page}">Đọc chữ trang này</button><a class="text-link" href="/documents/${e(ref.source.id)}#page=${ref.page}" target="_blank" rel="noopener">Mở PDF ↗</a></div></div>` : `<figure class="study-source-figure"><div class="study-source-bar"><span class="study-source-number">HÌNH ${String(i + 1).padStart(2, '0')}</span><span>TÀI LIỆU ĐỐI CHIẾU</span><b>TRANG ${ref.page}</b></div><a href="/documents/${e(ref.source.id)}#page=${ref.page}" target="_blank" rel="noopener"><img title="${e(ref.source.file)} · trang ${ref.page} · ${e(ref.source.id)}-p${ref.page}.webp" loading="lazy" src="/assets/source-pages/${e(ref.source.id)}-p${ref.page}.webp" alt="${e(ref.source.file)} · trang ${ref.page}: hình nguồn cho ${e(section.title)}" width="${Number(ref.image?.width) || 1100}" height="${Number(ref.image?.height) || 650}"></a><figcaption><span class="study-source-filename">${e(ref.source.file)}</span><div class="inline-actions mt"><button class="btn secondary small" data-action="source" data-id="${e(ref.source.id)}" data-page="${ref.page}">Đọc chữ trang này</button><a class="text-link" href="/documents/${e(ref.source.id)}#page=${ref.page}" target="_blank" rel="noopener">Mở PDF để phóng to ↗</a></div></figcaption></figure>`)).join('')}</section></div>`;
}
