import { escapeHTML as e } from '../../../../shared/domain/study-core.js';

export function termAnnotationHTML(term) {
  if (!term) return '';
  return `<dl class="term-annotation"><div><dt>Nghĩa tiếng Việt</dt><dd lang="vi">${e(term.vi || '')}</dd></div>${term.englishFull ? `<div><dt>Tiếng Anh đầy đủ</dt><dd lang="en">${e(term.englishFull)}</dd></div>` : ''}${term.nameNote ? `<div><dt>Ghi chú tên gọi</dt><dd lang="vi">${e(term.nameNote)}</dd></div>` : ''}</dl>`;
}

export function termLabelHTML(term) {
  return `<span class="term-label"><span lang="en">${e(term.name)}</span><small lang="vi">${e(term.vi || '')}</small></span>`;
}
