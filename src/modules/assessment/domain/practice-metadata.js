export const quizLabels = {
  mcq: 'Chỉ trắc nghiệm',
  recall: 'Thuật ngữ',
  application: 'Tình huống',
  syntax: 'Cú pháp',
  boss: 'Luyện tập sâu · Tự luận',
};
const practiceArtwork = {
  cia: { name: 'Ngọc Lân Hộ Pháp', category: 'nhân vật & linh thú', assetStem: 'cia-practice-v1' },
  aaa: { name: 'Huyền Hồ Giữ Ấn', category: 'nhân vật & linh thú', assetStem: 'aaa-practice-v1' },
  risk: {
    name: 'Bạch Hổ Vượt Kiếp',
    category: 'nhân vật & linh thú',
    assetStem: 'risk-practice-v1',
  },
  services: {
    name: 'Linh Hạc Dược Sư',
    category: 'nhân vật & linh thú',
    assetStem: 'services-practice-v1',
  },
  keys: {
    name: 'Huyền Báo Kiếm Sư',
    category: 'nhân vật & linh thú',
    assetStem: 'keys-practice-v1',
  },
  hybrid: {
    name: 'Thanh Long Đồng Hành',
    category: 'nhân vật & linh thú',
    assetStem: 'hybrid-practice-v1',
  },
  'sign-intro': {
    name: 'Ấn Ngọc Thiên Tín',
    category: 'pháp bảo',
    assetStem: 'sign-intro-practice-v2',
  },
  caesar: { name: 'Luân Chuyển Phù', category: 'phù triện', assetStem: 'caesar-practice-v2' },
  substitution: {
    name: 'Huyễn Ảnh Linh Phù',
    category: 'phù triện',
    assetStem: 'substitution-practice-v2',
  },
  otp: { name: 'Nhất Niệm Châu', category: 'đan dược', assetStem: 'otp-practice-v2' },
  aes: { name: 'Hàn Ngọc Linh Kiếm', category: 'pháp bảo', assetStem: 'aes-practice-v2' },
  cbc: { name: 'Lưu Thủy Kiếm Thức', category: 'võ công', assetStem: 'cbc-practice-v1' },
  ctr: { name: 'Đạp Phong Bộ', category: 'võ công', assetStem: 'ctr-practice-v2' },
  shell: { name: 'Vạn Hoa Đan Lô', category: 'đan dược', assetStem: 'shell-practice-v2' },
  'hash-properties': {
    name: 'Khắc Ảnh Chân Phù',
    category: 'phù triện',
    assetStem: 'hash-properties-practice-v2',
  },
  'hash-algorithms': {
    name: 'Thiên Tầng Bảo Kính',
    category: 'pháp bảo',
    assetStem: 'hash-algorithms-practice-v2',
  },
  'hash-apps': { name: 'Hồi Xuân Đan', category: 'đan dược', assetStem: 'hash-apps-practice-v2' },
  hmac: { name: 'Đồng Tâm Song Phù', category: 'phù triện', assetStem: 'hmac-practice-v2' },
  blockchain: {
    name: 'Liên Hoàn Thương Quyết',
    category: 'võ công',
    assetStem: 'blockchain-practice-v1',
  },
  'number-theory': {
    name: 'Tinh La Pháp Bàn',
    category: 'pháp bảo',
    assetStem: 'number-theory-practice-v2',
  },
  dh: { name: 'Kim Bằng Truyền Tín', category: 'nhân vật & linh thú', assetStem: 'dh-practice-v1' },
  rsa: { name: 'Thiên Môn Cơ Khóa', category: 'pháp bảo', assetStem: 'rsa-practice-v2' },
  oaep: { name: 'Liên Tâm Hộ Đan', category: 'đan dược', assetStem: 'oaep-practice-v2' },
  pss: { name: 'Nhất Bút Kiếm Ý', category: 'võ công', assetStem: 'pss-practice-v1' },
  protocols: {
    name: 'Hỏa Phượng Quy Lai',
    category: 'nhân vật & linh thú',
    assetStem: 'protocols-practice-v1',
  },
};
export function practiceArtFor(course, filters) {
  if (!filters) return null;
  const lesson =
    course.lessons.find((l) => l.id === filters.lesson) ||
    course.lessons.find((l) => l.id === course.terms.find((t) => t.id === filters.term)?.lesson);
  const art = lesson && practiceArtwork[lesson.id];
  return art
    ? {
        ...art,
        id: lesson.id,
        lessonTitle: lesson.title,
        src: `/assets/practice-lesson-art/${art.assetStem}.webp`,
        small: `/assets/practice-lesson-art/${art.assetStem}-960.webp`,
        thumb: `/assets/practice-lesson-art/${art.assetStem}-480.webp`,
      }
    : null;
}
export function quizScopeLabel(course, filters) {
  if (!filters) return 'Phiên đã lưu';
  const lesson = course.lessons.find((l) => l.id === filters.lesson);
  const term = course.terms.find((t) => t.id === filters.term);
  const section = lesson?.sections[Number(filters.section)];
  const parts = [
    lesson?.title || course.modules.find((m) => m.id === filters.module)?.title || 'Tất cả chương',
  ];
  if (filters.section !== '' && section)
    parts.push(`Phần ${Number(filters.section) + 1}: ${section.title}`);
  if (term) parts.push(term.name);
  return parts.join(' · ');
}
