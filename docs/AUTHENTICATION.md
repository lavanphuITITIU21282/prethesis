# Tài khoản Trạm học

Mở **Tài khoản** trong menu hoặc `/account`. Chọn **Đăng ký** để tạo tài khoản bằng tên đăng nhập 3–32 ký tự ASCII (chữ, số, `_`), tên hiển thị và mật khẩu 15–128 ký tự. Tên đăng nhập không phân biệt hoa thường. Bạn có thể hiện/ẩn mật khẩu, đăng xuất từ màn tài khoản hoặc vào lộ trình với tư cách khách. Tài khoản cục bộ dùng được khi không có Internet.

Đăng ký thành công sẽ tạo session. Đăng nhập tạo token mới và thu hồi token cũ của cùng trình duyệt; đăng xuất thu hồi session trong database rồi xóa cookie. Session hết hạn tuyệt đối sau 7 ngày; tài khoản có `disabled_at` không thể đăng nhập và session cũ không còn hiệu lực.

## Khởi tạo

Chạy `npm run db:migrate` sau khi cập nhật source, rồi khởi động lại Next.js. Môi trường mới vẫn dùng setup → migrate → seed → provision như database/README.md. Migration 004 bổ sung bảng mật khẩu, phiên và giới hạn thử. Migration 005 thêm hàm tạo phiên Google dùng các bảng hiện có.

- Mật khẩu dùng Node.js scrypt bất đồng bộ: N=131072, r=8, p=1, salt ngẫu nhiên 16 byte, key 64 byte. So sánh bằng timingSafeEqual; tài khoản không tồn tại vẫn chạy scrypt với hash giả. Không ghi mật khẩu vào log hoặc localStorage.
- Token ngẫu nhiên 32 byte, database chỉ lưu SHA-256. Cookie `tram_hoc_session`: HttpOnly, SameSite=Lax, Path=/, Max-Age 604800. HTTPS luôn bật Secure. Không có JWT trong localStorage.
- Cookie không có Secure khi dùng HTTP local/LAN để giữ khả năng phát triển hiện có; chỉ dùng trên mạng tin cậy. Triển khai ngoài môi trường này cần HTTPS, đặt `AUTH_ORIGIN` đúng public origin và `AUTH_COOKIE_SECURE=true`. Không tin forwarding header để tự xác định origin.
- POST bắt buộc origin khớp, không cross-site, nhận JSON tối đa 4 KiB. Client không được cung cấp userId làm danh tính. `/api/auth/me` trả 401 khi chưa xác thực; `/api/auth/session` trả user hoặc null. Không trả hash mật khẩu/token cho frontend trong JSON.
- Database giới hạn 60 lần xác thực/phút toàn app, 10 lần/15 phút theo tên đăng nhập đã băm và 15 đăng ký/giờ. Scrypt tối đa 2 tác vụ đồng thời trên mỗi process. Khi vượt trả 429; cửa sổ được lưu PostgreSQL nên không mất khi restart. Giới hạn chung phù hợp LAN cá nhân, cần đánh giá lại trước khi mở đăng ký công khai.

## Bật đăng nhập Google

1. Trong Google Cloud, cấu hình Branding và Audience của ứng dụng, sau đó tạo OAuth client loại **Web application**. Nếu ứng dụng đang ở chế độ Testing, thêm tài khoản Google cần dùng vào danh sách test users. [Hướng dẫn Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect#settingup)
2. Với môi trường local dùng `http://localhost:4173`, thêm **Authorized redirect URI** đúng từng ký tự là `http://localhost:4173/api/auth/google/callback`. Khi dùng tên miền, đăng ký URI tương ứng trên HTTPS.
3. Đặt ba giá trị phía máy chủ trong `.env.local`. File này đã được Git ignore.

   ```dotenv
   GOOGLE_OAUTH_ORIGIN=http://localhost:4173
   GOOGLE_OAUTH_CLIENT_ID=<OAuth client ID>
   GOOGLE_OAUTH_CLIENT_SECRET=<OAuth client secret>
   ```

4. Chạy migration, khởi động lại Next.js và mở `http://localhost:4173/account`. Nếu dùng địa chỉ khác, mở đúng origin đã cấu hình. Có thể bỏ `GOOGLE_OAUTH_ORIGIN` khi `AUTH_ORIGIN` đã trỏ tới cùng origin.

Lần đăng nhập Google đầu tiên tạo hồ sơ Trạm học riêng. Những lần sau tìm lại hồ sơ bằng Google subject đã xác minh. Nếu trước đó bạn dùng tài khoản mật khẩu, có thể xuất tiến độ từ tài khoản cũ rồi nhập có xác nhận vào tài khoản Google. Đăng xuất tại Trạm học thu hồi phiên Trạm học.

Google chỉ nhận yêu cầu `openid profile`. Máy chủ đổi mã qua HTTPS với PKCE, xác minh ID token bằng thư viện Google và so khớp nonce. Cookie OAuth có chữ ký, hết hạn sau 10 phút và gắn với phiên đã bắt đầu. PostgreSQL giới hạn 60 callback/phút trước khi gọi Google. Trạm học lưu định danh Google và tên hiển thị, còn token Google chỉ dùng trong callback. Nút Google hiển thị trạng thái chưa cấu hình nếu thiếu thông số. Biểu tượng G lấy từ [tài nguyên chính thức của Google](https://developers.google.com/identity/branding-guidelines).

## Ranh giới bảo mật

Application service nhận repository và crypto gateway; presentation gọi client adapter, không tự truy cập database. Composition root server-only tạo service dùng chung. `getPrincipal(request)` trả `{userId}` chỉ khi cookie khớp session còn hiệu lực, ngược lại trả null; API dữ liệu riêng tiếp theo phải từ chối null trước khi gọi service tiến độ.

Runtime không được SELECT/INSERT/UPDATE trực tiếp các bảng credential/session/throttle. Các entry point SQL `identity.auth_*` có SECURITY DEFINER, search_path cố định và tên bảng có schema đầy đủ; PUBLIC bị thu hồi EXECUTE, chỉ runtime group được gọi. Chủ sở hữu migration local hiện có quyền bypass RLS để thực hiện các thao tác xác thực giới hạn này. Khi đổi chủ sở hữu/restore sang môi trường khác cần kiểm tra lại quyền và chức năng; không gán quyền owner hoặc BYPASSRLS cho runtime.

Session được xác minh từ cookie; form không quyết định owner. Người nắm credential SQL backend vẫn là bên được tin cậy và không được chia sẻ credential này cho trình duyệt/người dùng.

## Dữ liệu học và giới hạn hiện tại

Đăng nhập dùng tiến độ tài khoản và tự đồng bộ PostgreSQL. Dữ liệu khách `tram-hoc-v1` vẫn thuộc trình duyệt/origin, chỉ được nhập vào tài khoản sau xem trước và xác nhận; không bị xóa khi đăng xuất. Nháp tài khoản có namespace riêng và UI xử lý revision conflict/khôi phục. Xem PROGRESS_SYNC.md.

Chưa có đổi/quên mật khẩu, email verification, MFA hoặc quản lý các thiết bị đang đăng nhập. Chưa coi bản đăng nhập local này là giải pháp vận hành công khai hoàn chỉnh.

Kiểm tra: `npm test` cho HTTP/React; `npm run test:db` cho scrypt/session/throttle/SQL trên database test riêng. Các test không tạo tài khoản demo trong database đang dùng.

Tham khảo: [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
