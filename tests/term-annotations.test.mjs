import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  termAnnotationHTML,
  termLabelHTML,
} from '../src/modules/content/presentation/renderers/term-label.js';
import { buildQuestions } from '../src/shared/domain/study-core.js';
const course = JSON.parse(readFileSync('public/data/course.json', 'utf8'));

test('all 254 terms have Vietnamese glosses and abbreviated names have reviewed English expansions', () => {
  assert.equal(course.terms.length, 254);
  for (const t of course.terms) {
    assert.ok(t.vi.trim(), t.name);
    if (/^[A-Z0-9][A-Z0-9#.-]+$/.test(t.name)) assert.ok(t.englishFull, t.name);
  }
  const lookup = (name) => course.terms.find((t) => t.name === name);
  assert.equal(lookup('HMAC').englishFull, 'Keyed-Hash Message Authentication Code');
  assert.equal(lookup('OAEP').englishFull, 'Optimal Asymmetric Encryption Padding');
  assert.match(lookup('CBC').vi, /liên kết/);
  assert.equal(lookup('RSA').englishFull, 'Rivest–Shamir–Adleman');
  assert.ok(!lookup('Nonce').englishFull, 'Nonce is a word, not an initialism');
});

test('term annotations render language-labelled text and safely escape all fields', () => {
  const t = {
    name: '<b>HMAC</b>',
    vi: '<script>nghĩa</script>',
    englishFull: 'A & B',
    nameNote: '<img src=x>',
  };
  const html = termAnnotationHTML(t) + termLabelHTML(t);
  assert.ok(html.includes('lang="vi"') && html.includes('lang="en"'));
  assert.ok(html.includes('Tiếng Anh đầy đủ'));
  assert.ok(html.includes('&lt;script&gt;') && html.includes('A &amp; B'));
  assert.ok(!html.includes('<script>') && !html.includes('<img'));
  assert.ok(!termAnnotationHTML({ vi: 'Bản rõ' }).includes('Tiếng Anh đầy đủ'));
});

test('translation metadata does not reveal answers in practice choices or change coverage', () => {
  const bank = buildQuestions(course);
  assert.equal(bank.length, 899);
  for (const t of course.terms) {
    const q = bank.find((q) => q.id === t.id + '-name');
    assert.equal(q.options.find((o) => o.id === t.id).text, t.name);
    assert.equal(q.correct, t.id);
  }
});
