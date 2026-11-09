# Tiến độ theo tài khoản

Chế độ khách tiếp tục dùng `tram-hoc-v1` như trước, không cần tài khoản hoặc database cho chức năng học chính. Khi đăng nhập, giao diện chuyển sang tiến độ riêng của tài khoản và tải bản trên PostgreSQL. Đăng xuất quay về kho khách, không chép dữ liệu tài khoản vào kho khách.

## Lưu và nhập dữ liệu

- Thay đổi bài đọc, ghi chú, quiz/nháp, lịch ôn, lịch sử, hoạt động và cài đặt được lưu vào bản nháp thiết bị ngay, rồi tự gửi sau khoảng 800 ms không có thay đổi mới. Mỗi lần chỉ có một request lưu trên controller; thay đổi trong lúc đang lưu được gửi ở lượt tiếp theo.
- Đầu trang có trạng thái đang tải/chờ/lưu/đã đồng bộ/mất kết nối/xung đột. **Đồng bộ lại** đọc revision mới và thử tiếp. Không chỉ dựa vào thông báo toast để biết đã lưu lên server.
- **Nhập từ kho học khách** chỉ đọc kho khách khi người dùng chọn, hiển thị số lượng và vài ghi chú mẫu. **Xác nhận thay bằng bản khách** thay toàn bộ bản tài khoản, không tự merge. Bản khách gốc vẫn giữ nguyên.
- Nhập JSON trên trang Tiến độ có bước xem trước/xác nhận như trước; nếu đang đăng nhập thì bản thay thế sẽ đồng bộ lên tài khoản. Xuất JSON vẫn dùng định dạng v1.
- Timer đang chạy chỉ thuộc thiết bị. Nó được giữ trong cache của tài khoản trên thiết bị, không gửi tới server hoặc mang theo khi nhập/xuất dữ liệu khách.

## Xung đột và khôi phục

Mỗi bản server có revision. API dùng compare-and-swap; revision cũ trả 409, không tự ghi đè. Hai thiết bị có thay đổi riêng sẽ cần chọn một bản, không tự cộng lịch sử hoặc ghép câu trả lời.

**Xem và chọn bản cần dùng** hiển thị số lượng, ví dụ ghi chú và thời điểm lưu của server. Có thể dùng bản server hoặc giữ nháp thiết bị rồi lưu lên tài khoản. Nếu server đổi tiếp sau bước xem trước, yêu cầu xem lại thay vì áp dụng lựa chọn lên dữ liệu chưa được xem.

Trước khi giải quyết xung đột, các bản local và server được giữ dưới khóa khôi phục riêng. **Bản khôi phục** cho phép xem danh sách của đúng tài khoản, xuất JSON hoặc chọn một bản để khôi phục có xác nhận. Bản lỗi không parse được vẫn có thể xuất nguyên văn. Khôi phục cũng là một thay đổi tiến độ, có kiểm revision khi gửi server.

Nháp và các bản khôi phục dùng namespace `tram-hoc-account-v1:<UUID>`, tách khỏi `tram-hoc-v1`. Hai tab cùng sửa sẽ giữ nháp cạnh tranh riêng; cùng một tab cập nhật một slot nháp thay vì tạo bản mới cho từng phím. Các bản khôi phục không tự xóa. Khi browser hết quota hoặc từ chối storage, ứng dụng cảnh báo xuất JSON; nếu không sao lưu được bản lỗi thì chặn ghi. Bản chỉ còn trong bộ nhớ có thể mất khi đóng trang/đổi tài khoản nếu bỏ qua cảnh báo. Xóa dữ liệu trình duyệt cũng xóa cache và bản khôi phục chưa xuất.

Cache trên thiết bị không được mã hóa và không phải ranh giới bảo mật chống người có quyền đọc storage/DevTools của cùng trình duyệt. Tài khoản, session và RLS bảo vệ dữ liệu server; không chia sẻ profile trình duyệt chứa dữ liệu cá nhân trên thiết bị không tin cậy.

## Mất mạng và đổi tài khoản

Nếu đã có cache của tài khoản được xác minh, có thể tiếp tục sửa khi request gặp lỗi và thử lại khi có mạng/focus. Nếu chưa từng tải được bản tài khoản và không có cache, tạm chặn sửa để tránh tạo một bản rỗng ghi đè dữ liệu chưa đọc. Đây không phải PWA hỗ trợ mở lạnh khi mất kết nối tới server.

Server layout xác minh cookie trước khi chọn namespace. Cookie tồn tại nhưng không xác minh được sẽ không fallback vào dữ liệu khách. Sau đăng nhập/đăng xuất, client khóa controller cũ và refresh server layout; provider remount theo UUID. Khi phát hiện session hết hạn hoặc tài khoản thay đổi, ngừng ghi, che state khỏi UI, vô hiệu hóa xuất/khôi phục của scope cũ và yêu cầu tải lại. Nháp cũ vẫn giữ ở namespace cũ để cùng tài khoản lấy lại sau.

## API và kiến trúc

- `GET /api/progress`: lấy bản của principal server; `{progress:null}` khi chưa có bản.
- `PUT /api/progress`: `{state,revision}`, JSON tối đa 8 MiB. Kiểm origin/content-type, cấu trúc v1 và revision; dùng validator v1 trước khi lưu. DB vẫn có CHECK dung lượng/kiểu dữ liệu.
- Owner luôn lấy từ cookie/session; trường userId trong body không chọn được tài khoản. `X-Study-Account` chỉ là guard phát hiện request xếp hàng từ tab cũ; header không khớp principal trả `409 ACCOUNT_CHANGED`.
- 401 khi không xác thực, 409 khi revision/scope đổi, 413 khi body quá lớn, 422 khi không đạt CHECK dữ liệu, 503 khi dịch vụ lỗi. Tất cả response no-store, không trả SQL/driver error/credential.
- `learning/server.ts` kết hợp service với Postgres repository. Route chỉ điều phối principal/HTTP. `AccountSync` ở application nhận gateway/cache qua port, không phụ thuộc React/fetch/storage. `learning/client.ts` là composition root cho browser adapter; provider dùng useSyncExternalStore.
- Không có migration mới: tiếp tục `learning.user_progress` và bản sao v1; chưa tự ghi đồng thời sang attempts/grades/review_schedules. Điểm trong aggregate là dữ liệu tiến độ cá nhân nhập từ client, không phải chứng chỉ/điểm thi được server chứng thực.
- Client writer ID dùng getRandomValues, không dùng randomUUID để giữ tương thích HTTP LAN. Đây không phải token xác thực. Xem [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues). Server đọc session bằng [cookies của Next.js](https://nextjs.org/docs/app/api-reference/functions/cookies), không đưa token vào props client.

Kiểm tra `npm test`, `npm run test:db`, typecheck/lint/architecture/build. Có test mất ACK sau commit, phản hồi GET cũ, chỉnh sửa trong lúc lưu, hai tab, hai tài khoản, import/khôi phục, cookie thật và revision conflict. Test DB chạy trong database riêng, không nhập dữ liệu browser của người dùng vào DB chính.

Giới hạn: đồng bộ toàn aggregate, không hỗ trợ merge tự động/realtime push; thiết bị khác đọc bản mới khi tải trang, lấy focus hoặc bấm đồng bộ. Trước hosting công khai cần đo tải/dung lượng thực tế, hoàn thiện quản lý tài khoản và quota AI theo tài khoản.
