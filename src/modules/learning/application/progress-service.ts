import { freshState, validateBackup } from '../../../shared/domain/study-core.js';
import type { Course, StudyState, Timer } from '../../../shared/domain/models';
import type { ProgressRepository } from '../domain/progress-repository';

export function restoreTimer(value: unknown): Timer | null {
  if (!value || typeof value !== 'object') return null;
  const timer = value as Timer;
  if (
    !Number.isFinite(timer.remaining) ||
    timer.remaining < 0 ||
    timer.remaining > 1500 ||
    ![5, 10, 25].includes(timer.duration) ||
    (timer.running && !Number.isFinite(timer.endsAt))
  )
    return null;
  return { ...timer };
}

export function loadProgress(repository: ProgressRepository, course: Course) {
  try {
    const raw = repository.readRaw();
    if (!raw) return { state: freshState(), warning: '' };
    const input = JSON.parse(raw);
    const state = validateBackup(input, course);
    state.timer = restoreTimer(input.timer);
    return { state, warning: '' };
  } catch {
    // Keep the original bytes recoverable before any future progress write.
    try {
      const raw = repository.readRaw();
      if (raw !== null) repository.preserveRecovery(raw);
    } catch {
      return {
        state: freshState(),
        warning:
          'Không đọc được bản lưu và chưa sao lưu được bản lỗi. Hãy giữ trang này mở để khôi phục dữ liệu.',
        blocked: true,
      };
    }
    return {
      state: freshState(),
      warning:
        'Bản lưu cũ không đọc được. Bản gốc đã được giữ để khôi phục; bạn có thể nhập bản sao JSON.',
    };
  }
}

export function saveProgress(repository: ProgressRepository, state: StudyState): boolean {
  try {
    repository.writeRaw(JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
