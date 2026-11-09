add('hash-properties','hash','Hàm băm và ba bài toán không được nhầm','Phân biệt tiền ảnh, tiền ảnh thứ hai và va chạm.','source-5',[2,5,6,7,8,9],['Dữ liệu dài tùy ý','Hàm băm H','Digest độ dài cố định'],'''
Băm không phải mã hóa
Cryptographic hash function ánh xạ dữ liệu độ dài tùy ý sang digest độ dài cố định. Không có khóa giải mã digest để lấy lại bản rõ. Cùng đầu vào và thuật toán phải cho cùng digest, nhưng nhiều đầu vào có thể chung đầu ra vì không gian đầu ra hữu hạn. Tính an toàn không yêu cầu va chạm không tồn tại; nó yêu cầu tìm va chạm là khó trong mô hình đã nêu.

Ba thử thách khác nhau
Preimage resistance: cho h, khó tìm M sao cho H(M)=h. Second-preimage resistance: cho M, khó tìm M' khác M cùng hash. Collision resistance: khó tìm bất kỳ cặp M,M' khác nhau cùng hash. Với digest lý tưởng n bit, tìm tiền ảnh thường tốn cỡ 2^n phép thử, tìm va chạm tổng quát cỡ 2^(n/2) do birthday bound. Các ước lượng này là mô hình lý tưởng, không thay phân tích thuật toán.

Không suy rộng avalanche
Avalanche effect mô tả thay đổi nhỏ đầu vào làm thay đổi nhiều bit đầu ra theo kỳ vọng. Nó là trực giác hữu ích để quan sát, không là chứng minh kháng va chạm hay tiền ảnh. Khi đo hai SHA-256, số bit khác nhau không luôn đúng 128; đó là biến ngẫu nhiên quanh kỳ vọng. Thêm newline cũng đổi byte đầu vào, vì vậy printf và echo có thể cho hash khác nhau dù nhìn văn bản gần giống.
''','''
Cryptographic hash function|Hàm băm mật mã|Ánh xạ dữ liệu dài tùy ý sang digest cố định với các tính chất mật mã.|Tạo dấu nhận diện dữ liệu mà không cần khóa.|Không phải phép mã hóa có thể giải mã digest.
Digest|Giá trị băm|Đầu ra độ dài cố định của hàm băm.|Một SHA-256 được biểu diễn bằng 64 ký tự hex.|Độ dài hex khác số bit của đầu ra.
Preimage resistance|Kháng tiền ảnh|Cho một giá trị băm, khó tìm đầu vào tương ứng.|Chỉ biết h và muốn tìm M với H(M)=h.|Thông điệp ít khả năng vẫn có thể đoán bằng từ điển.
Second-preimage resistance|Kháng tiền ảnh thứ hai|Cho một thông điệp cố định, khó tìm thông điệp khác cùng băm.|Kẻ tấn công cần thay một tập tin đã ấn định bằng tập tin khác cùng hash.|Khác với tự chọn cả hai thông điệp.
Collision resistance|Kháng va chạm|Khó tìm bất kỳ hai đầu vào khác nhau cùng băm.|Đối thủ được tự chọn cả hai văn bản có digest giống nhau.|Va chạm tồn tại nhưng cần khó tìm.
Birthday bound|Giới hạn sinh nhật|Va chạm tổng quát trong không gian n bit xuất hiện ở cỡ 2^(n/2) mẫu.|Ước lượng công việc tìm cặp va chạm cho hash lý tưởng.|Không dùng 2^(n/2) làm chi phí tiền ảnh chung.
Avalanche effect|Hiệu ứng thác lũ|Thay đổi nhỏ đầu vào làm nhiều bit đầu ra thay đổi theo kỳ vọng.|Sửa một chữ rồi so bit khác nhau của SHA-256.|Một phép thử không chứng minh an toàn mật mã.
''','Một hash 128 bit lý tưởng dùng cho tải phần mềm và cam kết số từ 0–999. Tính chi phí tổng quát cho ba bài toán; giải thích vì sao cam kết vẫn dễ lộ và vì sao đo avalanche không chứng minh kháng va chạm.',[
'Tiền ảnh/tiền ảnh thứ hai thông thường cỡ 2^128, va chạm tổng quát cỡ 2^64 trong mô hình lý tưởng; nêu mục tiêu đối thủ.',
'Số chỉ có 1.000 khả năng nên thử hết H(0)…H(999), không cần giải bài toán tiền ảnh tổng quát.',
'Dùng ngẫu nhiên bí mật đủ mạnh r trong cam kết H(domain||r||n), công bố r khi mở; phân biệt hiding và binding.',
'Avalanche là quan sát thống kê, không chứng minh ba thuộc tính. Hash tải phần mềm cần giá trị tham chiếu từ nguồn xác thực.'
])

add('hash-algorithms','hash','MD, SHA và cấu trúc bên trong','Hiểu phần nào cũ, phần nào là cấu trúc, phần nào là thuật toán.','source-5',[10,11,12,13,14,15,16,17,18],['Thông điệp + Đệm','Khối → Hàm nén','Trạng thái → Digest'],'''
Các họ thuật toán
MD2 và MD4 là các thiết kế cũ đã hỏng. MD5 có đầu ra 128 bit nhưng đã mất tính kháng va chạm; điều đó không đồng nghĩa mọi tiền ảnh MD5 đều dễ tìm. SHA-1 có đầu ra 160 bit và cũng không phù hợp nơi cần kháng va chạm. SHA-2 gồm SHA-256 và SHA-512; SHA-3 dựa trên Keccak với cấu trúc khác. MD6 là một thiết kế khác, không phải tên mới của MD5 hay chuẩn SHA-3.

Merkle–Damgård và sponge
MD5, SHA-1, SHA-2 xử lý khối qua hàm nén theo kiểu Merkle–Damgård cùng quy tắc đệm. Trạng thái đầu khởi tạo rồi cập nhật tuần tự qua các khối. SHA-3 dùng sponge construction: hấp thụ đầu vào và vắt đầu ra từ trạng thái. Sự khác biệt cấu trúc quan trọng khi suy về tấn công mở rộng độ dài; không áp máy móc cùng kết luận cho mọi họ hash.

Công cụ phải thống nhất định dạng
sha256sum file > file.sha256 tạo dòng có định dạng tương thích với sha256sum -c file.sha256. openssl dgst -sha256 file thường cho định dạng khác. Không lấy đầu ra một công cụ rồi mặc định công cụ kia đọc được. Khi băm trong chương trình, phải thống nhất byte: UTF-8, newline, chuẩn hóa văn bản và dạng nhị phân/hex. Hai chuỗi hiển thị giống có thể có byte Unicode khác nhau.
''','''
MD5|Message Digest 5|Hàm băm 128 bit đã mất kháng va chạm.|Đánh giá rủi ro ký tài liệu dùng digest MD5.|Va chạm hỏng không tự chứng minh tiền ảnh dễ.
SHA-1|Secure Hash Algorithm 1|Hàm băm 160 bit đã mất kháng va chạm.|Kiểm tra một hệ cũ dùng SHA-1 để ký nội dung.|Không dùng để suy bảo đảm kháng va chạm mới.
SHA-2|Họ SHA-2|Họ hàm băm gồm SHA-256 và SHA-512 cùng các biến thể.|Phân biệt SHA-256 thuộc họ thuật toán nào.|Không phải tên khác của SHA-3.
SHA-256|SHA-2 với digest 256 bit|Hàm băm SHA-2 sinh 256 bit, thường viết 64 ký tự hex.|Tính digest để kiểm tra thay đổi tập tin.|Không phải hàm lưu mật khẩu chuyên dụng.
SHA-512|SHA-2 với digest 512 bit|Hàm băm SHA-2 sinh digest 512 bit.|Chọn digest 64 byte trong họ SHA-2.|512 bit đầu ra không có nghĩa va chạm tốn 2^512.
SHA-3|Họ SHA-3|Họ hàm băm dựa trên Keccak với cấu trúc sponge.|So sánh kiến trúc với SHA-2.|Không chỉ là SHA-2 tăng số vòng.
Merkle–Damgård|Cấu trúc lặp hàm nén|Xử lý khối qua trạng thái nối tiếp với hàm nén và đệm.|Giải thích MD5/SHA-2 cập nhật trạng thái qua nhiều khối.|Cần xét cụ thể thuật toán và cách dùng khi suy tấn công.
Compression function|Hàm nén mật mã|Hàm cập nhật trạng thái từ trạng thái trước và khối dữ liệu.|Một bước trong cấu trúc băm lặp.|Không phải công cụ nén giảm dung lượng tập tin.
Sponge construction|Cấu trúc sponge|Cấu trúc hấp thụ dữ liệu và vắt đầu ra từ trạng thái.|Hiểu nền tảng cấu trúc của SHA-3.|Không suy tính chất từ Merkle–Damgård một cách máy móc.
''','Hai hệ băm cùng văn bản: một dùng echo, một dùng UTF-8 chuẩn hóa khác; hệ thứ ba đưa openssl dgst vào sha256sum -c. Phân tích ba nguồn lệch và phản biện “MD5 có collision nên tôi đảo được mọi digest”.',[
'echo thường thêm newline, làm khác byte đầu vào; cần đặc tả byte và dùng printf khi cần không newline.',
'Unicode có nhiều biểu diễn cho chuỗi trông giống; thống nhất encoding và quy tắc chuẩn hóa nếu giao thức yêu cầu.',
'Định dạng openssl dgst mặc định không tương thích trực tiếp sha256sum -c; sinh/check bằng cùng công cụ hoặc định dạng đúng.',
'Tìm hai đầu vào tùy chọn khác tìm đầu vào cho digest cho trước. Mất collision resistance không tự suy mất preimage resistance.'
])

add('hash-apps','hash','Toàn vẹn, cam kết và mật khẩu','Xem nguồn giá trị băm đáng tin ở đâu trước khi kiểm tra.','source-5',[19,20,21,22,23,24],['Dữ liệu → Hash','Tham chiếu đáng tin','So sánh + Đúng mục tiêu'],'''
Kiểm tra tải về cần nguồn tham chiếu
Nếu kẻ tấn công thay được cả tập tin và giá trị băm trên cùng kênh không xác thực, kiểm tra hash vẫn có thể báo đúng cho tập tin giả. Hash chỉ phát hiện sai lệch so với giá trị được dùng đối chiếu. Cần chữ ký nhà phát hành hoặc kênh tham chiếu đáng tin. Một checksum dùng phát hiện lỗi ngẫu nhiên không mặc định có tính chất của hàm băm mật mã.

Cam kết một bí mật
Commitment có bước cam kết và mở. Binding ngăn người cam kết đổi nội dung sau đó; hiding che nội dung trước khi mở. Nếu cam kết số nhỏ bằng H(n), người xem có thể vét hết n. Thêm r bí mật ngẫu nhiên đủ mạnh, định dạng không nhập nhằng và ngữ cảnh giúp bảo vệ hiding: H(domain||r||n). Trusted timestamp ràng buộc một digest với thời điểm qua cơ chế đáng tin, không tự chứng minh tác giả thật hoặc nội dung đúng.

Mật khẩu cần chống đoán ngoại tuyến
Password verification nên dùng KDF/password hash có salt và chi phí phù hợp; lưu kết quả để so khi đăng nhập, không cần lưu mật khẩu rõ. Salt riêng ngăn dùng lại bảng tiền tính giữa tài khoản nhưng không làm mật khẩu yếu thành mạnh. Slide minh họa định dạng /etc/shadow và SHA-512-crypt; đó không phải chỉ SHA-512(password). Không đọc tệp thật trong web; chỉ phân tích mẫu giả lập. Tránh ghi bí mật vào log.
''','''
Checksum|Giá trị kiểm lỗi|Giá trị hỗ trợ phát hiện thay đổi hoặc lỗi theo cơ chế đã chọn.|Phát hiện lỗi ngẫu nhiên khi truyền tập tin.|Không mặc định chống được đối thủ chủ động.
Commitment|Cam kết mật mã|Cơ chế che nội dung lúc cam kết và ràng buộc nội dung khi mở.|Chốt lựa chọn trước khi người khác công bố đáp án.|Cần xét cả hiding và binding.
Hiding|Tính che giấu của cam kết|Người xem chưa suy được nội dung từ bản cam kết trong mô hình.|Không đoán được số đã chọn trước bước mở.|H(n) với n ít khả năng thường không che tốt.
Binding|Tính ràng buộc của cam kết|Người cam kết khó mở một cam kết thành hai nội dung khác nhau.|Người chơi không đổi số sau khi xem người khác.|Cần định dạng và hash phù hợp.
Trusted timestamp|Dấu thời gian đáng tin|Bằng chứng ràng buộc dữ liệu/digest với thời điểm qua nguồn tin cậy.|Chứng minh một digest đã tồn tại trước mốc thời gian.|Không tự chứng minh ai là tác giả.
Password hashing|Băm mật khẩu|Dẫn xuất/lưu giá trị kiểm mật khẩu với salt và chi phí phù hợp.|Máy chủ kiểm đăng nhập mà không lưu mật khẩu rõ.|Một lần SHA-256 quá nhanh không thay password KDF.
Offline guessing|Đoán ngoại tuyến|Thử mật khẩu trên dữ liệu đã lấy mà không cần hỏi máy chủ thật.|Đối thủ lấy database hash rồi tự thử từ điển.|Giới hạn đăng nhập máy chủ không chặn quá trình này.
''','Ứng dụng lưu SHA-256(password), salt cố định, cho 5 lần đăng nhập; trò chơi cam kết H(số từ 1–6); tải phần mềm lấy digest từ cùng HTTP. Thiết kế sửa cả ba và chỉ rõ bảo đảm còn lại.',[
'Hash mật khẩu cần KDF/password hash phù hợp, salt riêng và chi phí đo được; giới hạn đăng nhập chỉ ảnh hưởng online, không chặn đoán ngoại tuyến.',
'Cam kết số có entropy thấp bị thử 6 giá trị; thêm ngẫu nhiên bí mật đủ mạnh và định dạng có ngữ cảnh, công bố r khi mở.',
'Digest cùng HTTP có thể bị thay cùng tập tin; dùng chữ ký/giá trị từ nguồn đã xác thực và kiểm đúng khóa nhà phát hành.',
'Nêu giới hạn: mật khẩu yếu vẫn đoán được với đủ chi phí; cam kết cần binding/hiding; chữ ký cần khóa đúng và được bảo vệ.'
])

add('hmac','hash','MAC, HMAC và mở rộng độ dài','Vì sao H(K || M) không phải một MAC tự chế nên dùng.','source-5',[25,26,27,28,29,30,31,32],['Khóa chung K','HMAC(K, M)','Kiểm tag trước xử lý'],'''
Hash không khóa không xác thực nguồn
Đối thủ có thể thay M và tính H(M') vì thuật toán công khai. MAC dùng khóa chung để tạo authentication tag. Bên nhận kiểm tag trên đúng byte và ngữ cảnh trước khi chấp nhận thông điệp. Các bên giữ cùng khóa đều tạo được tag, nên MAC không cung cấp bằng chứng phân biệt người gửi với người nhận cho bên thứ ba.

Nguy cơ của secret-prefix MAC
Với một số hash kiểu Merkle–Damgård như SHA-256, nếu dùng H(K||M), digest tiết lộ trạng thái đủ để tiếp tục hash phần nối thêm khi biết/đoán độ dài khóa và đệm. Length extension không tìm K và không đảo hash; nó tạo digest hợp lệ cho thông điệp mở rộng có chứa glue padding. Khả năng khai thác còn phụ thuộc định dạng và parser. Không suy rằng mọi cách ghép khóa và hash đều an toàn.

Cấu trúc HMAC chuẩn
HMAC dùng hai lớp với khóa chuẩn hóa: H((K'⊕opad)||H((K'⊕ipad)||M)). ipad/opad là hằng tạo miền trong/ngoài. Cấu trúc này khác H(K||M); dùng thư viện chuẩn và thuật toán được chọn đúng. Khi kiểm tag, dùng so sánh constant-time theo API phù hợp, kiểm độ dài và cấu trúc, ràng buộc metadata. HMAC vẫn không che nội dung và không tự ngăn replay: cần nonce/số thứ tự được xác thực cùng thông điệp.
''','''
MAC|Mã xác thực thông điệp|Giá trị xác thực dùng khóa chung để bảo vệ nguồn và toàn vẹn.|Hai bên chung khóa kiểm xem bản tin có bị sửa không.|Bên nào có khóa cũng có thể tạo nên không là chữ ký công khai.
HMAC|MAC dựa trên hash có khóa|Cấu trúc hash hai lớp chuẩn với khóa và hằng trong/ngoài.|Cần xác thực thông điệp bằng SHA-256 và bí mật chung.|Khác với chỉ ghép K trước M rồi băm.
Authentication tag|Thẻ xác thực|Giá trị được kiểm để chấp nhận nguồn/toàn vẹn theo lược đồ.|Một gói dữ liệu kèm trường kiểm chứng mật mã.|Tag đúng không tự bảo đảm tính mới.
Length extension|Mở rộng độ dài|Tiếp tục một số hash từ digest để xác thực phần mở rộng trong cấu trúc dễ lỗi.|H(K||M) với SHA-256 bị xét khả năng nối thêm glue padding và T.|Không cần tìm khóa và không phải đảo hàm băm.
ipad|Hằng đệm trong HMAC|Hằng được XOR với khóa chuẩn hóa cho lớp hash trong.|Đọc công thức lớp bên trong HMAC.|Không phải salt ngẫu nhiên mỗi thông điệp.
opad|Hằng đệm ngoài HMAC|Hằng được XOR với khóa chuẩn hóa cho lớp hash ngoài.|Đọc công thức lớp ngoài HMAC.|Phải dùng đúng cấu trúc, không tùy ý thay hằng.
Constant-time comparison|So sánh hạn chế rò thời gian|Cách so sánh tránh lộ vị trí khác biệt qua thời gian theo API/mô hình.|Kiểm tag mà không dừng sớm theo byte sai đầu tiên.|Còn phải kiểm định dạng và các kênh rò khác.
''','API dùng SHA256(K||user=7&amount=10), parser chấp nhận byte đệm và lấy tham số amount cuối. Đối thủ biết tag, độ dài K trong 8–32 byte. Phân tích điều kiện mở rộng, thiết kế HMAC chống replay và đánh giá tranh chấp hai bên chung khóa.',[
'Đoán từng độ dài K, dựng glue padding theo độ dài K||M và tiếp tục SHA-256 cho phần nối. Không cần suy ra K.',
'Parser chấp nhận đệm và ưu tiên tham số cuối làm phần nối có ý nghĩa; nếu parser từ chối không có kết luận khai thác nghiệp vụ giống nhau.',
'HMAC trên định dạng không nhập nhằng gồm phương thức, đường dẫn, dữ liệu, nonce/số thứ tự; kiểm tag và chống replay trước cập nhật nghiệp vụ.',
'HMAC không tạo chống chối bỏ giữa hai bên cùng khóa vì cả hai tạo được tag; cần mô hình chữ ký và bằng chứng khác nếu yêu cầu kiểm chứng thứ ba.'
])

add('blockchain','hash','Chuỗi băm, proof of work và va chạm','Phân biệt sửa lịch sử, nối thêm và tìm hai thông điệp chung digest.','source-5',[33,34,35,36,37,38,39,40,41,42,43,44,45],['Khối + Hash trước','Nonce → Đạt mục tiêu','Đồng thuận + Kiểm tra'],'''
Liên kết dữ liệu bằng hash
Hash chain đặt hash của khối trước vào khối sau. Sửa một khối làm liên kết sau không còn khớp trừ khi tính lại các giá trị liên quan. Chỉ riêng chuỗi băm chưa ngăn một người viết lại toàn bộ chuỗi rồi tự công bố; cần điểm đối chiếu đáng tin hoặc cơ chế đồng thuận. Blockchain kết hợp cấu trúc liên kết, quy tắc chấp nhận và mạng duy trì lịch sử theo giao thức.

Chi phí tạo khối và đồng thuận
Proof of work tìm nonce sao cho hash dữ liệu khối đạt mục tiêu độ khó. Nếu yêu cầu d bit đầu bằng 0 với hash lý tưởng, xác suất mỗi thử khoảng 2^-d và kỳ vọng 2^d thử. Đây không phải bài toán va chạm; cũng không phải giải mã hash. Trong Bitcoin, lựa chọn lịch sử liên quan công việc tích lũy hợp lệ theo quy tắc, không đơn giản đếm số máy hay số bản sao.

Va chạm cần xác định quyền chọn
Collision attack tìm hai đầu vào khác cùng digest; chosen-prefix collision cho đối thủ bắt đầu từ hai tiền tố khác rồi hoàn thiện chúng. Nguy cơ với chữ ký là lấy chữ ký cho nội dung lành rồi gắn với nội dung khác chung digest nếu định dạng cho phép. Demo MD5 trong slide là lịch sử thuật toán yếu; không có nghĩa có thể thay mọi tập tin bất kỳ giữ hash. Phân biệt collision với second preimage và length extension.
''','''
Hash chain|Chuỗi băm|Cấu trúc liên kết dữ liệu bằng giá trị băm của phần trước.|Sửa khối trước làm liên kết khối sau sai.|Một người có thể viết lại cả chuỗi nếu không có neo tin cậy/đồng thuận.
Blockchain|Chuỗi khối|Lịch sử khối liên kết mật mã được duy trì theo quy tắc giao thức.|Mạng kiểm tra và thống nhất lịch sử các khối.|Không tự làm dữ liệu đầu vào thành sự thật.
Proof of work|Bằng chứng công việc|Bằng chứng thể hiện chi phí tìm kết quả đạt mục tiêu khó nhưng dễ kiểm.|Thử nonce cho hash đạt ngưỡng độ khó.|Không phải tìm va chạm hash.
Mining nonce|Nonce đào khối|Giá trị được thay đổi trong quá trình tìm hash khối đạt mục tiêu.|Thử nhiều giá trị cho cùng dữ liệu khối.|Khác quy tắc nonce duy nhất của mode mã hóa.
Consensus|Đồng thuận|Quy tắc để các bên thống nhất trạng thái/lịch sử trong mô hình.|Các nút chọn lịch sử hợp lệ theo giao thức.|Không đồng nghĩa cứ nhiều bản sao là bất biến.
Collision attack|Tấn công va chạm|Tìm hai đầu vào khác nhau có cùng hash để phá bảo đảm cần kháng va chạm.|Tạo cặp văn bản khác nhau nhưng chung digest ký.|Khác thay một tập tin cố định bằng second preimage.
Chosen-prefix collision|Va chạm với tiền tố chọn trước|Tạo phần tiếp nối cho hai tiền tố chọn trước để có cùng digest.|Hai văn bản mở đầu khác nhau được hoàn thiện thành cặp chung hash.|Không suy ra mọi tập tin cố định đều thay thế dễ dàng.
''','Một hệ lưu 1.000 khối hash trên một máy và gọi là bất biến. Thêm PoW d=20, sau đó tăng d=24. Phân tích khả năng viết lại, kỳ vọng công việc, khác biệt collision/second-preimage và điều kiện chuyển chữ ký giữa hai file.',[
'Chỉ hash chain trên một máy cho phép người toàn quyền tính lại lịch sử; cần neo độc lập hoặc mô hình đồng thuận/thẩm quyền rõ.',
'PoW kỳ vọng 2^20 rồi 2^24 thử mỗi mục tiêu lý tưởng: tăng 16 lần, không 4 lần. Còn phải xét công việc tích lũy và đối thủ.',
'Tự chọn hai file là collision; thay một file cố định cần second preimage hoặc cấu trúc đặc biệt. PoW là tìm đầu ra đạt mục tiêu.',
'Chuyển chữ ký cần chữ ký phụ thuộc digest trùng và định dạng/ngữ cảnh chấp nhận; khóa/chứng chỉ và thuật toán ký cũng phải phù hợp.'
])
