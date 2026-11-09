import { restoreAIGrade } from './grade.js';
export const STORAGE_KEY = 'tram-hoc-v1';
export const DAY = 86400000;
export const normalize = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
export const escapeHTML = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
export function shuffled(values, random = Math.random) {
  const a = [...values];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function buildQuestions(course) {
  const bank = [];
  for (const t of course.terms) {
    const others = course.terms
      .filter((o) => o.id !== t.id)
      .sort(
        (a, b) =>
          Number(b.lesson === t.lesson) - Number(a.lesson === t.lesson) ||
          Number(b.module === t.module) - Number(a.module === t.module),
      );
    const distractors = others.slice(0, 3);
    const sections = course.lessons
      .find((l) => l.id === t.lesson)
      .sections.flatMap((s, i) => (s.terms?.includes(t.id) ? [i] : []));
    const common = {
      lesson: t.lesson,
      module: t.module,
      sections,
      term: t.id,
      explanation: `${t.name}: ${t.definition} Lưu ý: ${t.pitfall}`,
    };
    bank.push({
      ...common,
      id: t.id + '-name',
      kind: 'recall',
      prompt: `Định nghĩa sau mô tả thuật ngữ nào? ${t.definition}`,
      options: [
        { id: t.id, text: t.name },
        ...distractors.map((o) => ({ id: o.id, text: o.name })),
      ],
      correct: t.id,
    });
    bank.push({
      ...common,
      id: t.id + '-meaning',
      kind: 'recall',
      prompt: `Cách giải thích nào đúng với thuật ngữ “${t.name}”?`,
      options: [
        { id: t.id, text: t.definition },
        ...distractors.map((o) => ({ id: o.id, text: o.definition })),
      ],
      correct: t.id,
    });
    bank.push({
      ...common,
      id: t.id + '-case',
      kind: 'application',
      prompt: `Tình huống: ${t.scenario} Thuật ngữ nào phù hợp nhất với tình huống này?`,
      options: [
        { id: t.id, text: t.name },
        ...distractors.map((o) => ({ id: o.id, text: o.name })),
      ],
      correct: t.id,
    });
  }
  const allTokens = course.commands.flatMap((c) =>
    c.tokens.map((t, i) => ({ ...t, id: c.id + '-' + i })),
  );
  for (const c of course.commands)
    for (const [i, t] of c.tokens.entries()) {
      const id = c.id + '-' + i;
      const others = allTokens
        .filter((o) => o.id !== id && o.meaning !== t.meaning)
        .sort((a, b) => Number(b.id.startsWith(c.id + '-')) - Number(a.id.startsWith(c.id + '-')))
        .slice(0, 3);
      bank.push({
        id: 'syntax-' + id,
        kind: 'syntax',
        lesson: c.lesson,
        module: course.lessons.find((l) => l.id === c.lesson).module,
        sections: c.sections || [],
        command: c.id,
        prompt: `${c.situation} Trong lệnh này, ${t.token} dùng để làm gì?`,
        code: c.code,
        options: [{ id, text: t.meaning }, ...others.map((o) => ({ id: o.id, text: o.meaning }))],
        correct: id,
        explanation: `${t.token}: ${t.meaning} Kết quả toàn lệnh: ${c.result} Lưu ý: ${c.warning}`,
      });
    }
  for (const l of course.lessons)
    bank.push({ ...l.challenge, kind: 'boss', lesson: l.id, module: l.module });
  return bank;
}
export function defaultQuizFilters() {
  return { module: '', lesson: '', section: '', term: '', kind: '', size: 'all', priority: 'all' };
}
export function normalizeQuizFilters(value, course) {
  const out = defaultQuizFilters(),
    v = value || {};
  if (course.modules.some((m) => m.id === v.module)) out.module = v.module;
  let lesson = course.lessons.find((l) => l.id === v.lesson);
  const term = course.terms.find((t) => t.id === v.term);
  if (term) {
    out.term = term.id;
    lesson = course.lessons.find((l) => l.id === term.lesson);
  }
  if (lesson) {
    out.lesson = lesson.id;
    out.module = lesson.module;
    if (
      typeof v.section === 'string' &&
      /^\d+$/.test(v.section) &&
      lesson.sections[Number(v.section)]
    )
      out.section = String(Number(v.section));
  }
  if (['mcq', 'recall', 'application', 'syntax', 'boss'].includes(v.kind)) out.kind = v.kind;
  if (['all', 'due', 'new'].includes(v.priority)) out.priority = v.priority;
  return out;
}
export function filterQuestions(bank, filters, reviews = {}, now = Date.now()) {
  const f = filters;
  return bank.filter(
    (q) =>
      (!f.module || q.module === f.module) &&
      (!f.lesson || q.lesson === f.lesson) &&
      (f.section === '' || q.sections?.includes(Number(f.section))) &&
      (!f.term || q.term === f.term) &&
      (!f.kind || (f.kind === 'mcq' ? q.kind !== 'boss' : q.kind === f.kind)) &&
      (f.priority === 'all' ||
        (q.term && (f.priority === 'due' ? reviews[q.term]?.due <= now : !reviews[q.term]))),
  );
}
export function createQuizSession(questions, filters, random = Math.random, now = Date.now()) {
  if (!questions.length) return null;
  const chosen = shuffled(questions, random);
  return {
    id: `quiz-${now}-${Math.floor(random() * 0x100000000).toString(36)}`,
    startedAt: now,
    updatedAt: now,
    filters: { ...filters, size: 'all' },
    ids: chosen.map((q) => q.id),
    index: 0,
    answers: {},
    orders: Object.fromEntries(
      chosen
        .filter((q) => q.options)
        .map((q) => [q.id, shuffled(q.options, random).map((o) => o.id)]),
    ),
    recorded: false,
  };
}
export function activateQuizSession(state, session) {
  if (!session) return;
  const previous = state.quiz;
  state.quizSessions = (state.quizSessions || []).filter(
    (s) => s.id !== session.id && s.id !== previous?.id,
  );
  if (previous && previous.id !== session.id) state.quizSessions.unshift(previous);
  state.quizSessions = state.quizSessions.slice(0, 20);
  state.quiz = session;
}
export function freshState() {
  return {
    version: 1,
    read: {},
    notes: {},
    reviews: {},
    drafts: {},
    bossScores: {},
    aiGrades: {},
    history: [],
    activity: {},
    settings: { minutes: 10, font: 100, dark: false, focus: false, goal: 1 },
    lastLesson: 'cia',
    quiz: null,
    quizSessions: [],
    quizFilters: defaultQuizFilters(),
    timer: null,
  };
}
// Compatibility export preserves existing question-bank and backup consumers.
export { nextReview } from '../../modules/personalization/domain/review-schedule.js';
export function modPow(base, exp, mod) {
  let b = BigInt(base),
    e = BigInt(exp),
    m = BigInt(mod),
    r = 1n;
  if (m < 1n || e < 0n) throw new Error('Tham số không hợp lệ');
  b = ((b % m) + m) % m;
  while (e) {
    if (e & 1n) r = (r * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return r;
}
export function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return Math.abs(a);
}
export function inverse(a, m) {
  if (gcd(a, m) !== 1) return null;
  let [r, n, s, t] = [a, m, 1, 0];
  while (n) {
    const q = Math.floor(r / n);
    [r, n] = [n, r - q * n];
    [s, t] = [t, s - q * t];
  }
  return ((s % m) + m) % m;
}
export function isPrime(n) {
  if (!Number.isSafeInteger(n) || n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}
export function restoreQuiz(value, bank, course) {
  if (
    !value ||
    !Array.isArray(value.ids) ||
    !value.ids.length ||
    value.ids.length > bank.length ||
    new Set(value.ids).size !== value.ids.length ||
    !Number.isInteger(value.index) ||
    value.index < 0 ||
    value.index > value.ids.length
  )
    return null;
  const map = new Map(bank.map((q) => [q.id, q]));
  if (!value.ids.every((id) => map.has(id))) return null;
  const time = (n) => (Number.isFinite(n) && n >= 0 ? n : 0);
  const session = {
    id:
      typeof value.id === 'string' && /^[\w-]{1,100}$/.test(value.id)
        ? value.id
        : `legacy-${value.ids[0]}`,
    startedAt: time(value.startedAt),
    updatedAt: time(value.updatedAt),
    filters: course ? normalizeQuizFilters(value.filters, course) : defaultQuizFilters(),
    ids: [...value.ids],
    index: value.index,
    answers: {},
    orders: {},
    recorded: value.recorded === true,
    ...(value.freeNavigation === true ? { freeNavigation: true } : {}),
  };
  for (const id of session.ids) {
    const q = map.get(id);
    if (q.options) {
      const valid = q.options.map((o) => o.id);
      const order = value.orders?.[id];
      session.orders[id] =
        Array.isArray(order) &&
        order.length === valid.length &&
        new Set(order).size === valid.length &&
        order.every((v) => valid.includes(v))
          ? [...order]
          : valid;
      const answer = value.answers?.[id];
      if (answer && valid.includes(answer.selected))
        session.answers[id] = { selected: answer.selected, correct: answer.selected === q.correct };
    } else {
      const answer = value.answers?.[id];
      const score = answer?.score;
      if (Number.isFinite(score) && Number.isInteger(score * 2) && score >= 0 && score <= 10) {
        const ai = answer.selfRated === false && answer.method === 'gemini';
        session.answers[id] = { score, selfRated: !ai, ...(ai ? { method: 'gemini' } : {}) };
      }
    }
  }
  const missing = session.ids.findIndex((id, i) => i < session.index && !session.answers[id]);
  if (missing >= 0 && (!session.freeNavigation || session.index === session.ids.length)) {
    session.index = missing;
    session.recorded = false;
  }
  return session;
}
export function caesar(text, key) {
  return text.replace(/[a-z]/gi, (c) => {
    const b = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - b + ((key % 26) + 26)) % 26) + b);
  });
}
export function validateBackup(input, course) {
  if (!input || typeof input !== 'object' || input.version !== 1)
    throw new Error('Bản sao không đúng phiên bản Trạm học.');
  const out = freshState();
  const object = (v) => v && typeof v === 'object' && !Array.isArray(v);
  const ids = new Set(course.lessons.map((l) => l.id));
  for (const type of ['notes', 'drafts'])
    if (object(input[type]))
      for (const [id, value] of Object.entries(input[type])) {
        if (ids.has(id) && typeof value === 'string' && value.length <= 50000)
          out[type][id] = value;
      }
  if (object(input.read))
    for (const l of course.lessons) {
      const rows = input.read[l.id];
      if (Array.isArray(rows))
        out.read[l.id] = [
          ...new Set(rows.filter((n) => Number.isInteger(n) && n >= 0 && n < l.sections.length)),
        ];
    }
  if (object(input.reviews))
    for (const t of course.terms) {
      const v = input.reviews[t.id];
      if (
        object(v) &&
        ['level', 'seen', 'correct', 'due', 'updated'].every(
          (k) => Number.isFinite(v[k]) && v[k] >= 0,
        ) &&
        v.level <= 6 &&
        v.seen >= v.correct
      )
        out.reviews[t.id] = {
          level: Math.floor(v.level),
          seen: Math.floor(v.seen),
          correct: Math.floor(v.correct),
          due: v.due,
          updated: v.updated,
        };
    }
  if (object(input.bossScores))
    for (const l of course.lessons) {
      const v = input.bossScores[l.id];
      if (Array.isArray(v) && v.length === 4)
        out.bossScores[l.id] = v.map((n, i) =>
          Number.isInteger(n) && n >= 0 && n <= l.challenge.rubric[i].points ? n : 0,
        );
    }
  if (object(input.aiGrades))
    for (const l of course.lessons) {
      const grade = restoreAIGrade(input.aiGrades[l.id], l);
      if (grade) out.aiGrades[l.id] = grade;
    }
  if (object(input.settings)) {
    const v = input.settings;
    for (const k of ['focus', 'dark']) if (typeof v[k] === 'boolean') out.settings[k] = v[k];
    if ([5, 10, 25].includes(v.minutes)) out.settings.minutes = v.minutes;
    if ([90, 100, 110, 120, 130].includes(v.font)) out.settings.font = v.font;
    if ([1, 2, 3].includes(v.goal)) out.settings.goal = v.goal;
  }
  if (object(input.activity))
    for (const [date, v] of Object.entries(input.activity))
      if (/^\d{4}-\d{2}-\d{2}$/.test(date) && object(v))
        out.activity[date] = {
          sections: Math.min(1000, Math.max(0, Number(v.sections) || 0)),
          minutes: Math.min(1440, Math.max(0, Number(v.minutes) || 0)),
        };
  if (Array.isArray(input.history))
    out.history = input.history
      .slice(-100)
      .filter(
        (v) =>
          object(v) &&
          Number.isFinite(v.date) &&
          Number.isInteger(v.total) &&
          v.total > 0 &&
          v.total < 10000 &&
          Number.isInteger(v.correct) &&
          v.correct >= 0 &&
          v.correct <= v.total,
      )
      .map((v) => ({ date: v.date, total: v.total, correct: v.correct }));
  if (ids.has(input.lastLesson)) out.lastLesson = input.lastLesson;
  const bank = buildQuestions(course);
  out.quizFilters = normalizeQuizFilters(input.quizFilters, course);
  out.quiz = restoreQuiz(input.quiz, bank, course);
  if (Array.isArray(input.quizSessions)) {
    const seen = new Set(out.quiz ? [out.quiz.id] : []);
    for (const value of input.quizSessions.slice(0, 20)) {
      const session = restoreQuiz(value, bank, course);
      if (session && !seen.has(session.id)) {
        out.quizSessions.push(session);
        seen.add(session.id);
      }
    }
  }
  return out;
}
