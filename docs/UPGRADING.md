# Nâng cấp và bàn giao

## Sửa đúng module

1. Đọc `ARCHITECTURE.md` và chọn module sở hữu hành vi cần đổi.
2. Viết quy tắc nghiệp vụ trong domain/application. Tách storage hoặc provider bằng port khi có I/O.
3. Giữ interface public ổn định; tránh để module khác phụ thuộc implementation nội bộ.
4. Với thay đổi định dạng dữ liệu, bổ sung migration cùng test bản sao cũ. Không tự tăng version rồi bỏ dữ liệu cũ.
5. Chạy `npm test`, `npm run typecheck`, `npm run check:architecture`, `npm run check`, `npm run build`.

## Các giai đoạn tiếp theo

- Nền cấu trúc: module, công cụ kiểm tra, tài liệu và gói source có checksum.
- Nền database đã có: schema PostgreSQL, migration/seed, runtime role/RLS, pool server, adapter tiến độ v1 và kiểm chứng backup/restore. Xem database/README.md; không sửa migration đã áp dụng.
- Đã có tài khoản local, đăng ký/đăng nhập/đăng xuất và session PostgreSQL. Hoàn thiện quản lý tài khoản, API tiến độ theo principal đã nối UI vào repository, có conflict giữa thiết bị và nhập local có xác nhận; tiếp tục theo dõi tải, quản lý tài khoản và giữ an toàn cache/khôi phục. Repository riêng assessment/personalization là bước tiếp theo.
- Cá nhân hóa: thêm bằng chứng theo khái niệm, mục tiêu và chính sách đề xuất có lý do; giữ phân biệt đã đọc với đã hiểu.
- Hosting: môi trường staging, HTTPS, backup/restore, quota AI theo tài khoản và giám sát. Chọn dịch vụ dựa trên tải và ngân sách lúc triển khai.

## Tạo gói source

```powershell
npm run pack
# Hoặc khi npm chưa có trong PATH:
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/release/package.ps1
```

Gói mặc định ghi vào `Downloads/TramHoc-releases/`, nằm ngoài project. Gồm source, lockfile, tests, docs, scripts, PDF và artwork gốc để có thể tiếp tục biên soạn. Gói không bao gồm `.env.local`, dependencies, build, log hoặc cache.

ZIP có `RELEASE-MANIFEST.json` liệt kê kích thước và SHA-256 từng file. Script đọc lại ZIP để kiểm tra trước khi đổi từ `.partial` sang `.zip`. File `.zip.sha256` kiểm tra toàn gói. Checksum giúp phát hiện thay đổi, không phải chữ ký xác thực tác giả.

## Mở gói trên máy khác

1. Kiểm SHA-256 với file đi kèm rồi giải nén vào thư mục mới.
2. Cài Node.js phù hợp `package.json` và npm; mở thư mục chứa `package.json` trong VS Code.
3. Chạy `npm ci`, sau đó các lệnh kiểm tra và `npm run build`.
4. Nếu cần Gemini, tự tạo `.env.local` từ `.env.example` và cấu hình khóa của môi trường mới. Không chuyển khóa qua gói source.
5. Chạy `npm run dev` khi phát triển hoặc `npm start` sau build.

Gói không chứa tiến độ cá nhân trong trình duyệt. Xuất JSON trong ứng dụng trước khi đổi máy hoặc địa chỉ, rồi nhập sau khi mở ứng dụng mới.
