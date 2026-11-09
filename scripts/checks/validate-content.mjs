import { readFileSync, writeFileSync } from 'node:fs';
import { buildQuestions } from '../../src/shared/domain/study-core.js';
const c = JSON.parse(readFileSync(new URL('../../public/data/course.json', import.meta.url)));
const bank = buildQuestions(c);
const sections = c.lessons.flatMap((l) =>
  l.sections.map((s, i) => ({
    lesson: l.id,
    section: i + 1,
    title: s.title,
    questions: bank.filter((q) => q.lesson === l.id && q.sections?.includes(i)).length,
  })),
);
if (sections.some((s) => !s.questions)) throw new Error('Missing subsection questions');
const guides = c.lessons.flatMap((l) => l.sections.map((s) => s.study));
if (
  guides.some(
    (g) =>
      !g ||
      g.paragraphs.length < 2 ||
      g.example.steps.length < 3 ||
      !g.checkpoint.answer ||
      !g.references.length,
  )
)
  throw new Error('Incomplete study guide');
const coverage = c.terms.map((t) => ({
  term: t.name,
  lesson: t.lesson,
  questions: bank.filter((q) => q.term === t.id).length,
}));
if (coverage.some((t) => t.questions !== 3)) throw new Error('Missing term questions');
const report = {
  lessons: c.lessons.length,
  sections: c.lessons.reduce((n, l) => n + l.sections.length, 0),
  terms: c.terms.length,
  commands: c.commands.length,
  questions: bank.length,
  kinds: Object.fromEntries(
    ['recall', 'application', 'syntax', 'boss'].map((k) => [
      k,
      bank.filter((q) => q.kind === k).length,
    ]),
  ),
  termCoverage: `${coverage.length}/${c.terms.length}`,
  sourcePages: 203,
};
report.detailedGuides = guides.length;
report.solvedCheckpoints = guides.filter((g) => g.checkpoint.answer).length;
report.embeddedSourceImages = new Set(
  guides.flatMap((g) => g.references.map((r) => `${r.source}/${r.page}`)),
).size;
writeFileSync(
  new URL('../../public/data/coverage.json', import.meta.url),
  JSON.stringify({ summary: report, terms: coverage, sections }, null, 2),
);
console.log(JSON.stringify(report, null, 2));
