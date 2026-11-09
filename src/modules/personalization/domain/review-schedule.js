export function nextReview(previous, quality, now = Date.now()) {
  const prior = previous || { level: 0, seen: 0, correct: 0 };
  const level = quality === 0 ? 0 : Math.min(6, prior.level + (quality === 2 ? 1 : 0));
  const days = [0, 1, 3, 7, 14, 30, 60];
  return {
    level,
    seen: prior.seen + 1,
    correct: prior.correct + (quality > 0 ? 1 : 0),
    due: now + (quality === 0 ? 10 * 60000 : (days[level] || 1) * 86400000),
    updated: now,
  };
}
