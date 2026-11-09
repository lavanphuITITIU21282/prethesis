# Supporting named concepts appearing in explanations or command examples.
extras={
'cia':[
('CIA triad','Bộ ba CIA','Ba mục tiêu bí mật, toàn vẹn và sẵn sàng.','Phân loại ảnh hưởng lên quyền đọc, tính đúng và khả năng sử dụng.','Một sự cố có thể ảnh hưởng nhiều mục tiêu.'),
('DAD triad','Bộ ba DAD','Ba kiểu hậu quả disclosure, alteration và destruction đối ứng CIA.','Mô tả lộ, sửa và phá tài nguyên sau sự cố.','Đây là phân loại hậu quả, không là ba loại thuật toán.')],
'aaa':[
('AAA','Xác thực, cấp quyền, ghi nhận','Nhóm chức năng authentication, authorization và accounting trong kiểm soát truy cập.','Phân tách chứng minh danh tính, cấp quyền và theo dõi sử dụng.','Bài còn tách identification/auditing để nhìn rõ quy trình.')],
'keys':[
('Base64','Biểu diễn Base64','Mã biểu diễn byte bằng bảng ký tự để vận chuyển dạng văn bản.','Đưa dữ liệu nhị phân vào nội dung PEM hoặc văn bản.','Bất kỳ ai có quy tắc đều giải biểu diễn; không tạo bí mật.')],
'aes':[
('Meet-in-the-middle','Gặp ở giữa','Kỹ thuật ghép tính toán từ hai đầu của cấu trúc để giảm tìm kiếm trong các tình huống phù hợp.','Giải thích vì sao số bit khóa danh nghĩa của mã hóa ghép không tự bằng mức an toàn.','Khác man-in-the-middle dù viết tắt gần giống.')],
'substitution':[
('Rail fence','Hoán vị hàng rào','Mã cổ điển xếp ký tự theo đường zigzag rồi đọc theo hàng.','Minh họa đổi vị trí nhưng giữ số lần xuất hiện từng chữ.','Không che phân bố ký tự như một bảo đảm mật mã hiện đại.')],
'hash-algorithms':[
('MD2','Message Digest 2','Thiết kế hàm băm cũ đã hỏng, chỉ xét trong lịch sử bài học.','Phân loại các thiết kế MD cũ trong slide.','Không suy một thuật toán an toàn chỉ từ độ dài đầu ra.'),
('MD4','Message Digest 4','Thiết kế băm cũ đã hỏng, tiền thân trong dòng MD.','Đọc bảng thuật toán lịch sử và nhận ra thuật toán không phù hợp bảo vệ mới.','Không nhầm MD4 với MD5 hoặc MD6.'),
('MD6','Message Digest 6','Thiết kế hash từng tham gia lựa chọn SHA-3 nhưng không được chọn làm SHA-3.','Giải thích vì sao MD6 không phải tên chuẩn SHA-3.','Số phiên bản lớn không tự chứng minh được chuẩn hóa.'),
('Keccak','Nền tảng của SHA-3','Họ cấu trúc/thuật toán được chọn làm nền tảng cho SHA-3.','Nhận ra SHA-3 có cấu trúc sponge khác SHA-2.','Không mặc định mọi biến thể Keccak có đầu ra giống SHA-3.'),
('UTF-8','Mã ký tự UTF-8','Cách mã hóa ký tự Unicode thành chuỗi byte có độ dài biến đổi.','Đặc tả chính xác byte văn bản đem băm hoặc ký.','Cùng hình hiển thị có thể có chuỗi Unicode khác nhau.')],
'hash-apps':[
('SHA-512-crypt','Lược đồ băm mật khẩu SHA-512-crypt','Lược đồ kiểm mật khẩu có salt và vòng lặp, dùng SHA-512 trong cấu trúc riêng.','Đọc mẫu định dạng $6$ trong slide mà không coi đó là SHA512(password).','Khác chỉ gọi SHA-512 một lần trên mật khẩu.')],
'hmac':[
('Encrypt-then-MAC','Mã hóa rồi xác thực','Cách kết hợp tạo MAC trên bản mã và dữ liệu liên quan theo đặc tả để kiểm trước giải mã.','Thiết kế kênh CBC kiểm tag trước khi xử lý bản rõ.','Cần khóa, định dạng và phạm vi xác thực đúng; không chỉ ghép hai lệnh tùy ý.')],
'rsa':[
('ASN.1','Ngôn ngữ mô tả cấu trúc dữ liệu','Khuôn mô tả cấu trúc dữ liệu dùng cùng quy tắc mã hóa như DER.','Phân biệt cấu trúc khóa với byte mã hóa DER và lớp bọc PEM.','Mô tả dữ liệu không tự bảo vệ bí mật.'),
('Chinese remainder theorem','Định lý phần dư Trung Hoa','Kết hợp các đồng dư với modulus nguyên tố cùng nhau để có nghiệm modulo tích.','Lập luận RSA trên từng modulus nguyên tố hoặc xét broadcast attack RSA thô.','Không áp kết hợp như vậy khi điều kiện modulus không thỏa.')],
'protocols':[
('Ed25519','Lược đồ chữ ký Ed25519','Lược đồ chữ ký trên đường cong elliptic được dùng trong ví dụ khóa SSH mở rộng.','Đọc ssh-keygen -t ed25519 trong phần cú pháp.','Là loại khóa chữ ký, không là lựa chọn RSA-OAEP.')]
}
for lid,rows in extras.items():
    lesson=next(l for l in lessons if l['id']==lid)
    for name,vi,definition,scenario,pitfall in rows:
        tid=f'{lid}-t{len(lesson["terms"])+1}'
        terms.append(dict(id=tid,lesson=lid,module=lesson['module'],name=name,vi=vi,definition=definition,scenario=scenario,pitfall=pitfall))
        lesson['terms'].append(tid)

# Two capstone scenarios intentionally require connecting several chapters.
def harder(lid,prompt,answers):
    l=next(l for l in lessons if l['id']==lid)
    l['challenge']['prompt']=prompt
    l['challenge']['rubric']=[dict(text=a,points=p) for a,p in zip(answers,[3,3,2,2])]

harder('protocols','TRÙM CUỐI — Một hệ thống thanh toán có 100 thiết bị cùng khóa CTR. Nonce bằng số phiên RAM, reset sau reboot; counter 16 bit, mỗi phiên 70.000 khối. Máy chủ nhận JSON, kiểm SHA256(K||JSON), parser lấy trường amount cuối; endpoint phân biệt lỗi padding trên kênh CBC dự phòng. Thiết bị ký RSA-PSS chỉ trên nonce, chứng chỉ server có chữ ký đúng nhưng sai tên. API có TLS và token hợp lệ nên bỏ kiểm quyền từng hóa đơn. Nhật ký chỉ lưu HTTP 200 trên cùng máy quản trị; backup mỗi 24 giờ chưa thử phục hồi. Hãy: (1) dựng chuỗi lỗi xuyên các lớp và chỉ rõ điều kiện khai thác, không tự giả định mọi lỗi tự động kết hợp; (2) tính giới hạn counter, suy công thức lộ dữ liệu khi tái dòng khóa và phân biệt với oracle CBC; (3) thiết kế lại định dạng bản tin, thiết lập khóa, AEAD/AAD, chữ ký, quản lý nonce xuyên reboot và chống replay nguyên tử; (4) đưa ra ít nhất 8 thử âm, kế hoạch thay khóa khi lộ, phục hồi và chứng cứ quy trách nhiệm. Với từng bảo đảm, chỉ rõ giả định tin cậy và điều gì vẫn chưa chứng minh được.',[
'Phân tầng: kiểm chứng chứng chỉ cần tên/chuỗi đúng; TLS không cấp quyền hóa đơn. CTR trùng nonce và tràn counter là hai nguồn tái dòng khóa; 16 bit chỉ có 65.536 giá trị nên 70.000 khối không hợp lệ. Khi cùng S: C1⊕C2=P1⊕P2; biết một bản rõ suy được bản kia trong đoạn trùng. Sửa bit CTR đổi bit bản rõ. CBC oracle là một đường rò khác cần truy cập endpoint và tín hiệu hợp lệ; không được mặc định cùng khóa hoặc cùng parser nếu đề chưa cho.',
'SHA256(K||JSON) có nguy cơ length extension nếu đối thủ biết/đoán độ dài K và parser chấp nhận đệm/nối; parser lấy trường cuối làm nảy sinh thay ngữ nghĩa khi điều kiện đó giữ. Dùng HMAC theo định dạng xác định thay MAC tự chế; hoặc AEAD theo giao thức chuẩn, ràng buộc phiên bản, phương thức, tài khoản, hóa đơn, amount/currency, bên nhận và sequence/nonce. Ký PSS trên nội dung giao dịch và ngữ cảnh chứ không riêng nonce; thống nhất hash, MGF1, salt length, serialization. Cấp quyền máy chủ trên từng tài nguyên.',
'Phân tách khóa theo miền/thiết bị; quản lý nonce/counter bền qua reboot và từ chối trước tràn, có cơ chế thay khóa/phiên. AEAD kiểm tag trước dùng bản rõ, xác thực metadata qua AAD và duy trì trạng thái chống replay cập nhật nguyên tử. Thỏa thuận khóa có xác thực transcript/KDF; nếu cần forward secrecy dùng cơ chế khóa tạm phù hợp và xóa đúng. Lộ khóa cần xác định phạm vi dữ liệu/phiên bị ảnh hưởng, thay khóa và xử lý bằng chứng, không chỉ đổi khóa rồi tuyên bố an toàn.',
'Thử âm ít nhất: sai tên chứng chỉ, sai chuỗi tin cậy, tài khoản trái hóa đơn, đổi amount, đổi người nhận, tag sai, chữ ký sai, sequence lặp đồng thời, reboot lặp nonce, counter sắp tràn, sai serialization, lỗi giải mã. Log chủ thể/giao dịch/thời gian/kết quả, bảo vệ và lưu đối chiếu độc lập; tài khoản riêng, phân tách quản trị. Thử khôi phục bản sạch; lịch backup 24 giờ chỉ cho giới hạn theo giả định bản sao dùng được. Chữ ký thiết bị không tự chứng minh ý chí chủ thẻ, log HTTP 200 không chứng minh giao dịch đúng, AEAD không bảo đảm sẵn sàng.'
])
harder('hybrid','TRÙM CUỐI — Thiết kế kho lưu trữ 5 GiB/tệp cho 500 người dùng. Tệp chia khối, tải song song và hỗ trợ tải lại sau mất điện; máy chủ lưu trữ có thể bị chiếm, danh bạ khóa có thể bị thay, có người bị thu hồi quyền sau khi từng đọc tệp. Mỗi tệp có manifest JSON chứa thứ tự khối, kích thước, chủ sở hữu và phiên bản. Yêu cầu bí mật, toàn vẹn chống đảo/cắt/ghép khối, chia sẻ khóa, bằng chứng công khai người phát hành và phục hồi khi một máy hỏng. (1) Chọn ranh giới tin cậy, luồng khóa và dữ liệu, nêu tham số/giả định; (2) ràng buộc từng khối và manifest, thiết kế nonce qua upload lại và cách tránh phát hành phiên bản dở dang; (3) phân biệt đổi khóa, thu hồi quyền tương lai và dữ liệu người nhận đã biết; (4) so tác động lộ khóa RSA vận chuyển với ECDHE theo phiên khi đối thủ ghi lưu giao tiếp, và đưa bộ thử đối kháng. Không chấp nhận đáp án chỉ liệt kê AES + RSA + SHA-256.',[
'Sinh khóa dữ liệu đủ chất lượng và dùng cơ chế đối xứng xác thực cho khối; khóa dữ liệu được bảo vệ cho người nhận bằng cơ chế công khai/lai phù hợp, không RSA trực tiếp 5 GiB. Xác minh khóa nhận qua PKI tên/chuỗi/chính sách hoặc fingerprint kênh độc lập. Xác định client/thiết bị nào thấy bản rõ, máy chủ lưu gì, ai giữ khóa và ai được ký; mã hóa phía server vẫn lộ bản rõ nếu server đang xử lý nó bị chiếm.',
'Đặc tả byte manifest/serialization, định danh tệp và phiên bản, tổng số khối, độ dài và thứ tự. AEAD/AAD ràng buộc tệp, phiên bản, chỉ số, độ dài/ngữ cảnh; xác minh manifest ký và đủ khối để phát hiện tráo/cắt/ghép. Cấp nonce không trùng cùng khóa khi tải lại sau reboot; chọn khóa mới cho phiên bản mới hoặc quản lý trạng thái/miền đúng. Commit manifest và trạng thái hoàn thành nguyên tử, không coi upload một phần là phiên bản hợp lệ.',
'Thu hồi quyền ngăn lấy khóa/dữ liệu tương lai theo thiết kế, không xóa bản rõ hoặc khóa người từng đọc đã lưu. Có thể đổi khóa cho phiên bản tương lai và mã hóa lại theo nhu cầu; vẫn phải nêu giới hạn bản sao cũ. Backup cần giữ đủ dữ liệu, manifest và khả năng khôi phục khóa theo chính sách, kiểm thử thực tế; mất khóa có thể khiến backup không dùng được.',
'RSA vận chuyển khóa với khóa giải mã dài hạn lộ có thể làm lộ khóa phiên đã ghi lưu; ECDHE xác thực có bí mật tạm xóa đúng hỗ trợ forward secrecy cho giao tiếp, không tự bảo vệ khóa dữ liệu dài hạn đã bọc/lưu. Thử sai khóa/danh bạ, đảo khối, thiếu khối, khối cũ ghép phiên bản mới, nonce lặp, manifest sửa, ghi nửa chừng, người bị thu hồi và phục hồi khi mất một máy; chỉ ra đối tượng vẫn được tin.'
])
