// Shared validation: AI scores never overwrite the manually assigned rubric scores.
const object = (v) => v && typeof v === 'object' && !Array.isArray(v);
const text = (v, max) => {
  if (typeof v !== 'string' || v.length > max) throw new Error('Invalid feedback text');
  return v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim();
};
const list = (v, max) => {
  if (!Array.isArray(v) || v.length > max) throw new Error('Invalid feedback list');
  return v.map((s) => text(s, 1500)).filter(Boolean);
};
export function validateGradeResult(value, lesson) {
  if (
    !object(value) ||
    !Array.isArray(value.criteria) ||
    value.criteria.length !== lesson.challenge.rubric.length
  )
    throw new Error('Invalid rubric');
  const indices = new Set();
  const criteria = value.criteria
    .map((c) => {
      if (
        !object(c) ||
        !Number.isInteger(c.criterionIndex) ||
        c.criterionIndex < 1 ||
        c.criterionIndex > lesson.challenge.rubric.length ||
        indices.has(c.criterionIndex)
      )
        throw new Error('Invalid criterion');
      indices.add(c.criterionIndex);
      const maxPoints = lesson.challenge.rubric[c.criterionIndex - 1].points;
      if (
        !Number.isFinite(c.score) ||
        c.score < 0 ||
        c.score > maxPoints ||
        !Number.isInteger(c.score * 2)
      )
        throw new Error('Invalid score');
      return {
        criterionIndex: c.criterionIndex,
        score: c.score,
        maxPoints,
        evidence: text(c.evidence, 1200),
        feedback: text(c.feedback, 3000),
        improvement: text(c.improvement, 1800),
      };
    })
    .sort((a, b) => a.criterionIndex - b.criterionIndex);
  const result = {
    score: criteria.reduce((sum, c) => sum + c.score, 0),
    summary: text(value.summary, 2500),
    criteria,
    strengths: list(value.strengths, 4),
    gaps: list(value.gaps, 4),
    nextSteps: list(value.nextSteps, 3),
  };
  if (!result.summary || result.nextSteps.length < 1 || criteria.some((c) => !c.feedback))
    throw new Error('Incomplete feedback');
  return result;
}
export function restoreAIGrade(value, lesson) {
  try {
    if (
      !object(value) ||
      value.provider !== 'Google Gemini' ||
      typeof value.model !== 'string' ||
      !/^[a-zA-Z0-9._-]{1,100}$/.test(value.model) ||
      !Number.isFinite(value.gradedAt) ||
      value.gradedAt < 0 ||
      typeof value.answerText !== 'string' ||
      value.answerText.length > 20000 ||
      !/^[a-f0-9]{64}$/.test(value.answerHash)
    )
      return null;
    return {
      ...validateGradeResult(value, lesson),
      lessonId: lesson.id,
      provider: 'Google Gemini',
      model: value.model,
      gradedAt: value.gradedAt,
      answerText: value.answerText,
      answerHash: value.answerHash,
      cached: value.cached === true,
    };
  } catch {
    return null;
  }
}
export const gradeMatchesAnswer = (grade, answer) =>
  !!grade && grade.answerText === String(answer ?? '').trim();
