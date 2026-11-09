# Kiến trúc Trạm học

Quyết định: **Modular Monolith theo nghiệp vụ**, dùng Next.js, React và TypeScript. Một ứng dụng được build và triển khai; các module có trách nhiệm riêng. Mục tiêu phát triển là nhiều người dùng, mỗi người có dữ liệu và trải nghiệm học riêng.

## Các module

| Module | Phần đang có | Ranh giới phát triển tiếp |
| --- | --- | --- |
| `identity` | Hợp đồng danh tính và quy tắc sở hữu tài nguyên | Đăng nhập, phiên, quyền truy cập phía server |
| `content` | Bài đọc, thuật ngữ, cú pháp, thư viện; repository đọc JSON và PDF | Quản lý nội dung, phiên bản tài liệu |
| `learning` | Tiến độ, ghi chú, dashboard, mô phỏng, timer; lưu trình duyệt | Lưu tiến độ theo tài khoản và đồng bộ thiết bị |
| `assessment` | Ngân hàng/lượt luyện, điểm, rubric, Gemini gateway | Bài làm và kết quả thuộc từng người dùng, quota riêng |
| `personalization` | Flashcard và thuật toán lịch ôn hiện có | Mô hình kiến thức, mục tiêu và chính sách chọn hoạt động học |

`identity` đã có đăng ký/đăng nhập/session local; xem AUTHENTICATION.md. PostgreSQL đã có schema theo module, migration có checksum, content seed, runtime role có RLS, connection pool server và adapter tiến độ theo revision. Endpoint health đã nối vào Next.js; luồng học dùng API tiến độ theo session khi đăng nhập, còn khách giữ localStorage. Không mở dịch vụ ra Internet trước khi hoàn tất quản lý tài khoản, API theo principal và nhập dữ liệu an toàn.

## Quy tắc phụ thuộc

```text
Next.js routes / module presentation
                 ↓
            application services
                 ↓
       domain rules + repository ports
                 ↑
     infrastructure implementations
```

- `domain/`: quy tắc thuần và hợp đồng; không phụ thuộc React, Next.js, filesystem hay database.
- `application/`: xử lý tác vụ, validation, recovery, chấm điểm; nhận repository/gateway qua tham số.
- `infrastructure/`: HTTP, browser storage, filesystem, provider AI và adapter PostgreSQL.
- `presentation/`: component React và state hiển thị. Không tự fetch dữ liệu hay ghi storage.
- `client.ts`, `server.mjs`: composition root của module, kết hợp service với implementation phù hợp. Tránh import server entry vào client.
- `src/app/`: route, layout và bộ điều khiển HTTP; chỉ điều phối module, không đặt thuật toán học trong route.
- `src/shared/domain/`: hợp đồng dữ liệu dùng chung và kernel nghiệp vụ đã được kiểm chứng; `shared/ui/` chứa thành phần giao diện dùng chung.

Một ngoại lệ chuyển tiếp được ghi rõ: `shared/domain/study-core.js` giữ API tương thích cho ngân hàng câu hỏi và bản sao v1; `nextReview` đã chuyển về personalization và được re-export. Không mở rộng facade này thành nơi gom mọi nghiệp vụ mới.

`StudyProvider` là điểm kết hợp local storage với service tiến độ, nên có một factory truy cập storage trì hoãn đến client. Các component còn lại gọi application service hoặc module client entry. Nghiệp vụ đơn giản không cần tạo đủ bốn thư mục.

## Dữ liệu và hosting

Bài đọc là JSON/PDF cục bộ; tiến độ khách ở `localStorage`, tiến độ tài khoản ở PostgreSQL kèm cache riêng theo UUID. Giữ nguyên khóa `tram-hoc-v1`, bản sao v1 và mã câu hỏi. Đổi cấu trúc thư mục không đổi origin hoặc xóa dữ liệu trình duyệt.

Hướng server tiếp theo:

- Nội dung chung tách khỏi hồ sơ, ghi chú, bài làm và lịch ôn riêng từng người.
- `UserProgressRepository` nhận danh tính đã được server xác thực và revision để hỗ trợ cập nhật đồng thời.
- Request không được tự xác định chủ sở hữu bằng cách gửi `userId` trong body.
- Giao dịch liên quan tiến độ/kết quả cần tính nhất quán; migration dữ liệu phải có kiểm chứng và cách quay lại.
- AI là gateway bên ngoài. Server giữ khóa, kiểm tra quyền và giới hạn sử dụng trước khi gửi bài làm; đầu ra phải được kiểm tra theo rubric.
- Các rate limit/cache trong bộ nhớ hiện có dành cho chế độ cá nhân. Khi chạy nhiều instance phải chuyển phần trạng thái cần dùng chung sang hạ tầng phù hợp.

Chi tiết PostgreSQL nằm trong [database/README.md](../database/README.md). `shared/infrastructure` giữ config/pool dùng chung, `app/_server/database.mjs` là composition root server-only. `learning/application/user-progress-service.ts` nhận principal và repository; adapter PostgreSQL ở learning/infrastructure. Aggregate JSONB v1 là đường tương thích dữ liệu cũ; các bảng assessment/personalization chưa có luồng UI ghi song song. Test tích hợp dùng database PostgreSQL riêng; chưa triển khai production; auth local và đồng bộ UI đã có. Xem PROGRESS_SYNC.md về state machine/cache/gateway và giải quyết xung đột.

## Kiểm tra kiến trúc

`npm run check:architecture` kiểm tra module bắt buộc, đường dẫn import, phụ thuộc của domain/application và việc presentation vượt qua service. Test nghiệp vụ và React kiểm tra hành vi; build production xác minh tích hợp Next.js.
