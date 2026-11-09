# Trạm học

Công cụ học an toàn thông tin cá nhân bằng **Next.js App Router, React và TypeScript**, chạy trên máy cá nhân hoặc trong LAN. Giao diện Mặc Nguyệt, nội dung học tiếng Việt và thuật ngữ tiếng Anh được giữ lại.

Kiến trúc hiện tại là **Modular Monolith theo nghiệp vụ**, chuẩn bị cho hosting nhiều người dùng. PostgreSQL có schema, migration, nội dung seed, connection pool server và repository tiến độ. Đã có đăng ký/đăng nhập/session local tại /account; UI học đồng bộ tiến độ theo tài khoản; chế độ khách vẫn dùng localStorage. Hồ sơ làm việc, quy tắc clean code và phạm vi project nằm trong [AGENTS.md](AGENTS.md).

## Chạy trong VS Code

Yêu cầu **Node.js 20.19+, 22.13+ hoặc 24+ và npm** để chạy cả ứng dụng lẫn bộ kiểm tra và ESLint. Khuyến nghị dùng Node.js LTS. Lần cài dependencies đầu tiên cần Internet; chức năng học chính không cần Internet sau khi cài xong.

Mở đúng thư mục project trong VS Code, rồi chạy trong Terminal:

```powershell
npm ci
npm run dev
```

Mở **http://localhost:4173**. Máy khác cùng LAN dùng `http://<IPv4 máy chủ>:4173`. Giữ địa chỉ và cổng cũ để trình duyệt tiếp tục đọc đúng kho tiến độ.

Trên máy đang dùng Node đi kèm Codex và npm chưa có trong PATH:

```powershell
.\SETUP.ps1
.\scripts\windows\START-LAN.ps1
```

`SETUP.ps1` dùng npm có sẵn trên máy hoặc CLI npm đã được lưu trong bộ công cụ của người dùng. Nếu cả hai đều thiếu, cài Node.js kèm npm rồi chạy lại.

**Ctrl + Shift + B** gọi `scripts/windows/RUN-VSCODE.ps1`, dùng lại máy chủ Next.js đã chạy hoặc khởi động nền. Có thêm task cài dependencies, build, kiểm tra TypeScript và chạy test trong **Terminal → Run Task**.

### Công cụ viết code và debug

Project đề xuất hai extension trong `.vscode/extensions.json`: **Prettier – Code formatter** (`esbenp.prettier-vscode`) và **ESLint** (`dbaeumer.vscode-eslint`). JavaScript/TypeScript và debugger dùng công cụ có sẵn của VS Code.

- `.vscode/settings.json` chọn Prettier làm formatter và format khi lưu. Khi lưu thủ công, ESLint áp dụng các sửa tự động hỗ trợ được; lỗi cần xử lý thủ công vẫn hiện trong **Problems** (`Ctrl+Shift+M`).
- ESLint dùng flat config `eslint.config.mjs`, bộ quy tắc Next.js Core Web Vitals, React Hooks và TypeScript. `eslint-config-prettier` tránh xung đột quy tắc format. Dependencies được khóa trong `package-lock.json`.
- TypeScript dùng SDK trong `node_modules/typescript/lib`. Nếu VS Code hỏi chọn phiên bản, chọn **Use Workspace Version**; cũng có thể dùng lệnh **TypeScript: Select TypeScript Version**.
- **Terminal → Run Task** có các task kiểm tra ESLint, kiểm tra format và format code, dùng chung cơ chế tìm Node trên Windows.
- **Ctrl+Shift+D → Trạm học: Debug React trong Edge → F5** khởi chạy hoặc dùng lại server 4173 và mở trình duyệt debug để đặt breakpoint phía client.
- Để debug phía server, dừng server nền bằng task **Trạm học: Dừng máy chủ** (hoặc Ctrl+C nếu đang chạy foreground), rồi chọn **Trạm học: Debug server Next.js → F5**. Debug terminal tự gắn vào Node và tiến trình con, dùng launcher tìm Node nên không yêu cầu npm trong PATH. Sau khi server sẵn sàng, mở `http://localhost:4173`. Dừng phiên debug và terminal khi kết thúc.

Cấu hình debugger theo [hướng dẫn Next.js](https://nextjs.org/docs/app/guides/debugging), điều chỉnh cho launcher Windows và cổng của project. ESLint theo [hướng dẫn chính thức](https://nextjs.org/docs/app/api-reference/config/eslint).

- `START-LAN.cmd` / `scripts/windows/START-LAN.ps1`: chạy foreground; Ctrl+C để dừng.
- `scripts/windows/START-BACKGROUND.ps1`: chạy nền, ghi PID và log trong `logs/`.
- `scripts/windows/STOP-BACKGROUND.ps1`: kiểm tra PID thuộc project rồi dừng cả cây tiến trình Next.js.
- Đổi cổng: `./scripts/windows/START-LAN.ps1 -Port 4180`, hoặc đặt `$env:PORT='4180'` trước khi chạy npm.
- Nếu bản máy chủ cũ vẫn chạy, dừng bằng `scripts/windows/STOP-BACKGROUND.ps1` trước khi khởi động bản Next.js.

Không mở HTML bằng `file://` hoặc Live Server. Nếu máy khác không truy cập được, kiểm tra cùng mạng, đúng IPv4 và quyền Node trên mạng Private trong Windows Firewall.

## Bản production

```powershell
npm run build
npm start
```

Build tạo `.next/`; không sửa hoặc commit thư mục này. `npm start` dùng bản build hiện có. Toàn bộ font, hình và nội dung học được phục vụ cục bộ, không cần CDN.

## Chức năng được giữ

- 5 chương, 25 bài, 75 phần học, 254 thuật ngữ và 899 câu luyện tập.
- Bài đọc có ví dụ từng bước, câu tự kiểm tra, sơ đồ và hình nguồn từ 6 PDF / 203 trang.
- Luyện tập lọc theo chương, bài, phần nhỏ, loại câu và ưu tiên ôn; mở toàn bộ câu khớp bộ lọc.
- Câu hỏi và đáp án xáo trộn một lần; lưu câu đang làm, đáp án, nháp tự luận, phiên gần nhất và tối đa 20 phiên trước.
- Điều hướng câu bằng phím trái/phải; không can thiệp lúc nhập liệu hoặc mở hộp thoại.
- Flashcard ưu tiên thẻ đến hạn; quên thì nhắc sau 10 phút, nhớ thì tăng khoảng cách ôn.
- Ghi chú, tiến độ đọc, lịch ôn, thống kê, đồng hồ tập trung, cỡ chữ, dark mode và focus mode.
- Mô phỏng Caesar, XOR, ECB/CBC minh họa, SHA-256 thật, RSA và Diffie–Hellman số nhỏ.
- Thư viện PDF có tìm chữ, đọc theo trang và HTTP Range/HEAD.
- Tự luận có rubric 10 điểm; điểm tự chấm và điểm Gemini được lưu riêng.

## Dữ liệu cá nhân

Mở **Tài khoản** trong menu hoặc `/account` để đăng ký, đăng nhập hoặc đăng xuất. Có thể bật đăng nhập Google bằng OAuth client của dự án. Phiên lưu ở PostgreSQL và đăng xuất thu hồi phiên. Tiến độ tài khoản tự đồng bộ, dữ liệu khách chỉ được nhập sau khi xem trước và xác nhận. [Hướng dẫn tài khoản và Google OAuth](docs/AUTHENTICATION.md) · [Hướng dẫn đồng bộ](docs/PROGRESS_SYNC.md)

Giữ nguyên khóa `tram-hoc-v1`, định dạng bản sao phiên bản 1, mã bài và mã câu hỏi. Các URL bookmark dạng `#/learn/...` được chuyển sang URL Next.js tương ứng.

Chế độ khách lưu bằng `localStorage`; khi đăng nhập, tiến độ lưu PostgreSQL và có cache/nháp riêng theo UUID tài khoản trên thiết bị. `localhost`, `127.0.0.1` và IP LAN là các kho khác nhau. Dùng **Tiến độ & ghi chú → Xuất/Nhập bản sao** khi đổi địa chỉ hoặc thiết bị. Xóa dữ liệu trình duyệt sẽ xóa bản lưu ở thiết bị đó.

Nếu bản lưu bị lỗi, ứng dụng giữ dữ liệu gốc dưới khóa `tram-hoc-v1-recovery` trước khi cho phép ghi đè. Nếu không giữ được bản gốc, ứng dụng chặn ghi tự động và hiển thị cảnh báo. Bản sao JSON không mang theo đồng hồ đang chạy.

## Gemini tùy chọn

Đặt khóa ở `.env.local` tại thư mục gốc theo `.env.example`:

```text
GEMINI_API_KEY=<khóa của bạn>
GEMINI_MODEL=<model được tài khoản của bạn hỗ trợ>
```

Next.js đọc cấu hình phía server. Restart máy chủ sau khi đổi cấu hình. Không đưa khóa vào biến `NEXT_PUBLIC_*`, mã frontend, log hoặc bản sao tiến độ.

Chỉ khi bấm chấm, bài làm, đề, rubric và phần giải thích của bài được gửi tới Google. Cần Internet ở máy chủ. Timeout, lỗi provider hoặc kết quả sai rubric không tạo điểm giả; bản nháp vẫn được giữ. Test dùng provider giả lập, không tiêu quota.

Giới hạn hiện tại: bài tối đa 20.000 ký tự, 2 lần chấm đồng thời, tối đa 12 lượt/giờ trong nhóm truy cập cá nhân và 60 lượt/giờ toàn máy chủ; cache kết quả giống nhau 15 phút. Dịch vụ này dành cho máy cá nhân/LAN đáng tin cậy.

## Cấu trúc code

```text
src/app/                  Next.js routes, layout và bộ điều khiển HTTP
src/modules/identity/     Đăng ký/đăng nhập, session và kiểm tra sở hữu dữ liệu
src/modules/content/      Bài học, thuật ngữ, tài liệu và repository nội dung
src/modules/learning/     Tiến độ, ghi chú, phiên học, timer và mô phỏng
src/modules/assessment/   Luyện tập, chấm điểm và Gemini gateway
src/modules/personalization/ Flashcard và lịch ôn
src/shared/               Hợp đồng/kernel dùng chung, routing và UI
src/styles/               CSS giao diện hiện có
public/                   Dữ liệu và tài nguyên phục vụ trình duyệt
resources/documents/      Sáu PDF gốc
resources/artwork/        Ảnh gốc và metadata dùng khi biên soạn
scripts/runtime/          Lệnh chạy, test, build, format
scripts/windows/          Task VS Code và launcher Windows
scripts/checks/           Kiểm tra nội dung và kiến trúc
scripts/content/          Nguồn biên soạn bằng Python và metadata ngôn ngữ
scripts/assets/           Công cụ chuẩn bị/kiểm chứng artwork
scripts/release/          Đóng gói source và kiểm checksum
docs/                     Kiến trúc, nâng cấp và báo cáo hợp nhất
database/                 Schema SQL, migration và hướng dẫn backup/restore
tests/                    Kiểm tra nghiệp vụ, React, HTTP và ranh giới module
.vscode/                  Task chạy trong VS Code
```

React quản lý state, sự kiện và vòng đời giao diện. Logic học thuần JavaScript đã có được tái sử dụng cùng khai báo kiểu TypeScript; phần mới viết bằng TypeScript. Nội dung bài dùng renderer đã kiểm tra escaping. Thư mục `public/` chỉ giữ dữ liệu và tài nguyên tĩnh; không chứa ứng dụng vanilla cũ.

## Kiểm tra và clean code

```powershell
npm test
npm run typecheck
npm run lint
npm run format:check
npm run check
npm run check:architecture
npm run build
npm run format
```

Nếu npm chưa có trong PATH nhưng dependencies đã được cài, dùng `node scripts/runtime/task.mjs test`, `node scripts/runtime/task.mjs typecheck` hoặc `node scripts/runtime/task.mjs build`.

`npm run check` kiểm tra nội dung và cập nhật `public/data/coverage.json`. Test React chạy với DOM giả lập; không thay thế kiểm tra bố cục bằng trình duyệt thật. Comment trong code/script viết bằng tiếng Anh; nội dung sản phẩm dùng tiếng Việt.

`npm run lint` kiểm tra code và không chấp nhận warning; `npm run lint:fix` áp dụng các sửa tự động của ESLint. `npm run format:check` chỉ kiểm tra định dạng, còn `npm run format` ghi lại định dạng. Khi npm chưa có trong PATH, các lệnh tương ứng chạy bằng `node scripts/runtime/task.mjs lint`, `node scripts/runtime/task.mjs lint:fix` hoặc `node scripts/runtime/task.mjs format:check`.

Không commit `.env.local`, `node_modules/`, `.next/`, log hoặc tệp tạm. Giữ `package-lock.json` và dùng `npm ci` để cài đúng dependencies. Chưa tự tạo commit hoặc xuất bản website.

## Biên soạn nội dung

Giữ nguyên sáu PDF `FCoDS*.pdf` trong `resources/documents/`. Sửa nguồn trong `scripts/content/content_*.py`, `scripts/content/depth_*.py` hoặc `scripts/content/build_content.py`. Dựng lại cần Python, PyMuPDF và Pillow:

```powershell
python scripts/content/extract_sources.py
python scripts/content/build_all.py
npm run check
npm test
node scripts/checks/audit-content.mjs
```

Đối chiếu PDF khi sửa kiến thức, hình hoặc công thức. Giữ thuật ngữ tiếng Anh và giải thích tiếng Việt. Các mô phỏng số nhỏ chỉ phục vụ học tập. Prompt và xuất xứ hình nằm trong manifest ở `public/data/` và `docs/PROJECT_REPORT.txt`.

## Kiến trúc và gói bàn giao

Để khởi tạo database local, mở Docker Desktop rồi chạy `npm run db:setup`, `npm run db:migrate`, `npm run db:seed`, `npm run db:provision` và `npm run test:db`. Nếu npm chưa có trong PATH, dùng `node scripts/runtime/task.mjs <tên lệnh>`. PostgreSQL chạy ở `127.0.0.1:5432`, dữ liệu nằm trong Docker volume; credential quản trị và runtime tách riêng, đều được ignore. Endpoint `/api/health/database` kiểm tra kết nối server; `/api/progress` lưu theo session và revision. Kho khách chỉ được đưa lên tài khoản khi người dùng xác nhận. Có lệnh `db:backup` và `db:verify-backup` để sao lưu/kiểm khôi phục ngoài source. Xem [hướng dẫn database](database/README.md).

Chi tiết: [Kiến trúc](docs/ARCHITECTURE.md), [Nâng cấp và đóng gói](docs/UPGRADING.md), [Thiết kế database](database/README.md), [Báo cáo kỹ thuật](docs/PROJECT_REPORT.txt).

Chạy `npm run pack` để tạo ZIP source trong `Downloads/TramHoc-releases/`, kèm manifest SHA-256 từng file và checksum toàn gói. Gói gồm mã, tests, scripts, migration SQL, tài liệu, PDF và artwork gốc; loại secret, dependencies, build, log, cache và dữ liệu database. PostgreSQL local đã hoạt động; cần hoàn tất quản lý tài khoản, API phân quyền và đồng bộ dữ liệu trước khi hosting công khai.
