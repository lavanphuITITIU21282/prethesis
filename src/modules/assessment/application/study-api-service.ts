import { restoreAIGrade } from '../../../shared/domain/grade.js';
import type { Lesson } from '../../../shared/domain/models';
import type { GradingGateway } from '../domain/grading-gateway';

export function createStudyApiService(gateway: GradingGateway) {
  return {
    async isGradingAvailable(signal?: AbortSignal) {
      return (await gateway.gradingStatus(signal)).configured === true;
    },
    async grade(lesson: Lesson, rawAnswer: string, signal?: AbortSignal) {
      const answer = rawAnswer.trim();
      if (answer.length < 10 || answer.length > 20000)
        throw new Error('Hãy viết từ 10 đến 20.000 ký tự trước khi chấm. Bản nháp vẫn được giữ.');
      const data = await gateway.grade(lesson.id, answer, signal);
      const grade = restoreAIGrade({ ...(data as object), answerText: answer }, lesson);
      if (!grade) throw new Error('Kết quả chấm không đúng rubric; chưa lưu điểm.');
      return grade;
    },
  };
}
