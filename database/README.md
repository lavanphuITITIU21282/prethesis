# PostgreSQL: schema, kết nối và vận hành

Đã có PostgreSQL 18.6, schema theo nghiệp vụ, migration có checksum, dữ liệu nội dung, runtime role riêng, connection pool server và repository tiến độ có revision. Đã có đăng ký/đăng nhập/session local và API tiến độ nối UI theo tài khoản. Chế độ khách giữ localStorage; dữ liệu khách chỉ nhập khi xác nhận. Xem ../docs/PROGRESS_SYNC.md.

## Khởi tạo nền database

```powershell
npm run db:setup
npm run db:migrate
npm run db:seed
npm run db:provision
npm run test:db
```

Các lệnh này cũng chạy được với `node scripts/runtime/task.mjs <tên lệnh>`, ví dụ `node scripts/runtime/task.mjs db:migrate`, khi npm chưa có trong PATH.

- `db:migrate`: áp dụng `database/migrations/*.sql` trong transaction, khóa advisory để tránh chạy đồng thời. `app_meta.schema_migrations` lưu checksum; từ chối sửa/xóa migration đã áp dụng, trùng version hoặc thêm migration sai thứ tự. Migration mới phải có số tiếp theo; không format lại SQL cũ. Khi migration lỗi, toàn bộ lượt chạy rollback.
- `db:seed`: nạp content release 1, gồm 5 chương, 25 bài, 75 phần, 254 thuật ngữ, 21 lệnh và 899 câu hỏi trong transaction. Chạy lại cùng nội dung không thêm trùng; nội dung khác trên cùng release bị từ chối. Để tạo release mới, đặt biến môi trường `CONTENT_VERSION` thành số mới trước khi chạy; không đổi version của tiến độ cũ tự động.
- `db:provision`: tạo login `tram_hoc_app`, nhận quyền từ group `tram_hoc_runtime`, không superuser/BYPASSRLS/CREATEDB/CREATEROLE. Credential runtime được tạo riêng ở `.env.database.app.local`, không dùng credential quản trị trong ứng dụng. Chạy lại giữ mật khẩu; không tự reset role đã có nhưng mất tệp credential.

## Mô hình và ràng buộc

Xem [sơ đồ quan hệ](SCHEMA.md) để đối chiếu các bảng và khóa ngoại.

| Schema | Bảng | Trách nhiệm |
| --- | --- | --- |
| `identity` | `users`, `external_identities`, `password_credentials`, `sessions`, `auth_limits` | Danh tính, mật khẩu băm, session và giới hạn xác thực |
| `content` | `courses`, `releases`, `chapters`, `lessons`, `sections`, `concepts`, `commands`, `questions` | Khóa nội dung giữ nguyên, khóa ngoại cùng course/release, payload bài học có cấu trúc JSONB |
| `learning` | `user_progress` | Aggregate tiến độ v1 theo user/course, content version, revision và thời điểm cập nhật |
| `assessment` | `attempts`, `grades` | Phiên/bảng điểm; FK ghép bắt buộc cùng chủ sở hữu, course và release; điểm 0–10, tự chấm và Gemini tách riêng |
| `personalization` | `review_schedules` | Lịch ôn theo user/concept, số đúng không vượt số đã xem, index thời điểm đến hạn |
| `app_meta` | `schema_migrations` | Nhật ký migration và checksum |

Tổng cộng 18 bảng kể cả migration metadata. Nội dung học phong phú được giữ trong JSONB, còn ID, quan hệ và version có khóa ngoại SQL. Tiến độ v1 là aggregate JSONB có ràng buộc loại/phiên bản/kích thước, được kiểm tra thêm bằng validator ứng dụng. Cách này giữ nguyên ghi chú, nháp, thứ tự câu/đáp án và lịch sử đã có.

`user_progress` là nguồn dữ liệu của adapter tiến độ v1. `attempts`, `grades`, `review_schedules` là hợp đồng lưu trữ riêng cho các repository module về sau; hiện chưa có luồng UI ghi đồng thời vào các bảng này hoặc coi chúng là bản sao đã đồng bộ của aggregate. Không tự backfill dữ liệu người học khi seed nội dung.

Các index hỗ trợ khóa ngoại theo lesson/concept/question, phiên gần đây của user và lịch ôn đến hạn. Không thêm GIN index toàn bộ JSONB khi chưa có truy vấn cần dùng.

## Kết nối server và quyền truy cập

- `src/shared/infrastructure/postgres.mjs`: pool tối đa 5 connection mặc định, timeout kết nối 3 giây, câu lệnh 5 giây, idle connection 10 giây; transaction dùng cùng một client và luôn trả client về pool. Rollback lỗi sẽ loại client thay vì tái sử dụng transaction hỏng.
- `src/app/_server/database.mjs`: composition root có `server-only`, tạo pool trì hoãn đến truy vấn đầu tiên và dùng lại qua hot reload. Không kết nối database lúc build hoặc gửi credential xuống client.
- Next.js dùng `DATABASE_URL` phía server nếu được cấu hình; nếu không, dùng `.env.database.app.local`. Không fallback sang `.env.database.local` quản trị. URL production phải khai báo TLS đúng theo provider; không tắt kiểm tra chứng chỉ. Restart server sau khi đổi credential/URL.
- Runtime pool từ chối role có superuser/BYPASSRLS/CREATEDB/CREATEROLE. Runtime chỉ đọc nội dung; không có DDL, migration hoặc sửa danh tính.
- Sáu bảng dữ liệu riêng theo user và ba bảng xác thực bật `ENABLE` và `FORCE ROW LEVEL SECURITY`. `withUser` chỉ chấp nhận UUID, mở transaction rồi đặt `app.user_id` bằng `set_config(..., true)`; context được xóa khi commit/rollback và không rò sang request tiếp theo.
- `app.user_id` chỉ có ý nghĩa khi backend đã xác thực người dùng. Người giữ credential database có thể tự đặt SQL context; RLS này không thay thế auth hoặc bảo vệ trước SQL tùy ý từ client. Không có API nhận userId từ body để truy cập dữ liệu riêng.
- `createUserProgressService` nhận principal từ server và kiểm tra bản sao v1 trước khi gọi `UserProgressRepository`. `createPostgresProgressRepository` dùng SQL có tham số và compare-and-swap revision; lần đầu dùng revision 0, lần sau dùng revision đã đọc. Xung đột ném `ProgressConflictError`, không ghi đè âm thầm. Timer đang chạy giữ ở thiết bị, không mang qua nhập dữ liệu server.

Chạy Next.js rồi kiểm tra `GET /api/health/database`: thành công trả `200 {"ok":true,"database":"postgresql"}`; mất cấu hình/kết nối hoặc role không an toàn trả 503 với mã chung. Endpoint không trả host, username, SQL hoặc thông báo lỗi driver; có `Cache-Control: no-store`. `/api/health` vẫn kiểm tra ứng dụng độc lập để chế độ học local tiếp tục chạy khi database tắt.

## Sao lưu và kiểm chứng khôi phục

```powershell
npm run db:backup
# Use the exact dump path returned by the backup command.
npm run db:verify-backup -- "C:\path\to\backup.dump"
```

Backup dùng `pg_dump --format=custom --no-owner`, giữ ACL/policy, ghi vào `Downloads/TramHoc-db-backups` ngoài source. Chỉ đổi `.partial` thành `.dump` sau khi dump thành công; SHA-256 nằm trong file `.dump.sha256`. Backup có thể chứa dữ liệu cá nhân, cần giữ riêng cùng credential runtime/admin; credential role không nằm trong dump.

`db:verify-backup` đối chiếu checksum, tạo một database tạm tên ngẫu nhiên, dùng `pg_restore --exit-on-error --single-transaction` và kiểm tra dữ liệu khôi phục. Sau đó chỉ xóa database tạm vừa tạo. Không có lệnh ghi đè database đang dùng. Trên cluster mới cần tạo group `tram_hoc_runtime` trước khi restore ACL; backup/restore không thay thế sao lưu credential và kế hoạch nâng major.

`npm run test:db` dùng PostgreSQL thật và database test riêng, tự dọn sau chạy. Bộ test kiểm migration/seed chạy lại, rollback lỗi, checksum, FK/CHECK, RLS, rollback/context khi tái sử dụng pool, xung đột từ hai connection và round-trip dữ liệu học v1. `npm test` không cần database, chỉ kiểm nghiệp vụ/React/HTTP và health handler giả lập.

## Cài đặt và kiểm tra

Yêu cầu Docker Desktop đang chạy ở chế độ Linux containers, Node.js theo `package.json` và dependencies đã cài (`npm ci` hoặc `SETUP.ps1`).

```powershell
npm run db:setup
npm run db:status
npm run db:check
```

Nếu npm chưa có trong PATH:

```powershell
node scripts/runtime/task.mjs db:setup
node scripts/runtime/task.mjs db:check
```

VS Code có task **Trạm học: Chuẩn bị PostgreSQL**, **Trạm học: Kiểm tra PostgreSQL** và **Trạm học: Dừng PostgreSQL** trong **Terminal → Run Task**. Các task dùng chung cơ chế tìm Node của launcher Windows.

`db:setup` kiểm tra Docker, tạo mật khẩu ngẫu nhiên nếu chưa có cấu hình, tải official image PostgreSQL 18.6 Alpine và khởi động container. Lệnh đợi healthcheck rồi thử kết nối có mật khẩu từ Node.js bằng câu SELECT. Không tạo bảng học hoặc nhập dữ liệu.

- Project Compose: `tram-hoc-db`; cấu hình tại `database/compose.yaml`.
- Database: `tram_hoc`; kết nối mặc định `127.0.0.1:5432`, không mở cổng database ra LAN.
- Thông tin quản trị local lưu tại `.env.database.local` ở gốc, được Git ignore và nằm ngoài allowlist đóng gói; `.env.database.app.local` dành riêng cho runtime. Các tệp này tách khỏi `.env.local` của Next.js/Gemini; không in, commit hoặc chia sẻ nội dung.
- User khởi tạo container chỉ dành cho quản trị local. Runtime role đã tách riêng; danh tính từ session server vẫn cần triển khai trước khi mở API riêng tư.
- Dữ liệu nằm trong Docker named volume `tram-hoc-db_postgres_data`, mount vào `/var/lib/postgresql` theo bố cục PostgreSQL 18. Không nằm trong source hoặc ZIP bàn giao.
- `db:setup` chạy lại sẽ giữ mật khẩu và volume cũ. Không xóa cấu hình riêng khi còn dùng volume: đổi biến password không tự đổi mật khẩu đã lưu trong PostgreSQL.
- Nếu cổng 5432 đã bị chiếm trước lần khởi tạo, chọn cổng trống qua `POSTGRES_PORT` trong tệp cấu hình riêng. Các lần sau giữ cấu hình nhất quán.

```powershell
npm run db:stop     # Stop the container; preserve its data volume.
npm run db:start    # Start again and verify the connection.
npm run db:shell    # Open psql bundled in the database container.
```

Không có lệnh reset/xóa volume trong bộ công cụ này. `psql`, `pg_dump` và `pg_restore` đi kèm image; không cần cài thêm bản PostgreSQL Windows song song cho môi trường này. Khi nâng major PostgreSQL phải có kế hoạch migration/backup, không chỉ thay tag image trên volume cũ.

Nguồn: [Docker Official Image PostgreSQL](https://hub.docker.com/_/postgres), [node-postgres](https://node-postgres.com/features/connecting).

## Ranh giới tích hợp cần triển khai tiếp

| Module | Dữ liệu dự kiến |
| --- | --- |
| identity | User ID nội bộ, liên kết danh tính từ auth provider, phiên/quyền theo giải pháp auth được chọn |
| content | Nội dung và phiên bản dùng chung; giữ ID khóa học/bài/khái niệm hiện có |
| learning | Tiến độ, ghi chú, phiên học, hoạt động và revision theo user ID |
| assessment | Bài làm, kết quả, rubric version, nguồn điểm và thời điểm chấm |
| personalization | Mục tiêu, bằng chứng kiến thức theo khái niệm, lịch ôn và phiên bản chính sách đề xuất |

Yêu cầu khi triển khai:

- User ID được lấy từ session đã xác thực ở server. Mọi truy vấn riêng tư giới hạn theo chủ sở hữu.
- Ràng buộc database, transaction và kiểm thử phải ngăn liên kết bài làm hoặc kết quả của hai tài khoản khác nhau.
- Adapter tiến độ thực hiện `UserProgressRepository` trong module learning; cập nhật có revision để không ghi đè âm thầm từ thiết bị khác.
- Dữ liệu nhập từ bản sao trình duyệt được kiểm tra bằng validator, ánh xạ vào tài khoản hiện tại và ghi trong transaction phù hợp.
- Nếu dùng Row-Level Security, phải thiết kế role kết nối và chính sách đúng; không mặc định owner/superuser được bảo vệ bởi RLS.
- Migration có version, quy trình sao lưu và kiểm chứng khôi phục. Không chỉnh sửa trực tiếp schema production khi nâng cấp.

Schema, migration, runtime pool và adapter tiến độ đã có. API tiến độ theo principal, nhập local có xác nhận và UI conflict đã có. Phần tiếp theo là hoàn thiện quản lý tài khoản và repository riêng cho assessment/personalization. Chưa có hosting, không có credential hoặc dữ liệu database trong gói source. Nguồn: [PostgreSQL RLS](https://www.postgresql.org/docs/18/ddl-rowsecurity.html), [node-postgres transaction](https://node-postgres.com/features/transactions).
