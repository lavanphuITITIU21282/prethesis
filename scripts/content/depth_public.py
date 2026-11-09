guide('number-theory', [
(9, '''Đồng dư a≡b mod n nghĩa là a−b chia hết cho n. Có thể cộng, trừ, nhân các lớp đồng dư; phép chia chỉ được chuyển thành nhân nghịch đảo khi mẫu có nghịch đảo theo modulus. Vì vậy “chia hai vế cho a” trong số học modulo cần kiểm điều kiện, không dùng như số thực.

Coprime không đòi từng số là nguyên tố: 8 và 15 có gcd=1 dù cả hai hợp số. Nghịch đảo tồn tại chính xác khi gcd(a,n)=1; nếu gcd khác 1, phương trình ax≡1 mod n không có lời giải. Điều kiện này là nền của việc chọn public exponent và tính private exponent trong RSA.''',
'Tìm nghịch đảo và nhận ra phép chia sai',[
'Theo modulo26, 3×9=27≡1 nên 9 là nghịch đảo của 3; 2 không có nghịch đảo vì gcd(2,26)=2.',
'Từ 2x≡2 mod26 không suy duy nhất x≡1 mod26: x=1 và x=14 đều thỏa.',
'Trong mã, chuẩn hóa phần dư âm về miền 0…n−1 trước khi dùng làm chỉ số hoặc so giá trị đại diện.'],
'Vì sao không dùng số thực 1/7 làm private exponent của RSA?',
'Cần số nguyên d thỏa 7d≡1 theo modulus thích hợp, không phải nghịch đảo trong số thực. Đây là hai phép toán trên hai cấu trúc khác nhau.'),
(10, '''Euler totient φ(n) đếm phần tử nguyên tố cùng nhau với n trong một hệ đại diện. Với p nguyên tố, các số 1,…,p−1 đều nguyên tố cùng nhau với p; số 0 không được tính. Với p,q nguyên tố phân biệt, loại các bội của p/q để thu φ(pq)=(p−1)(q−1).

Euler theorem cần gcd(a,n)=1. Trong RSA, cách chọn d theo φ(n) là một điều kiện đủ quen thuộc trong bài học; lý thuyết cũng có thể dùng Carmichael function λ(n) theo đặc tả. Không được thay công thức φ(pq) bằng (p−1)(q−1) khi p,q không đáp ứng giả định.''',
'Tính φ từ danh sách trước khi dùng công thức',[
'Với n=12, các số coprime là 1,5,7,11 nên φ(12)=4.',
'Với p=13,q=17, n=221 và φ(n)=12×16=192; đây là hai nguyên tố phân biệt.',
'Nếu lấy p=q=13, n=169 thì φ(n)=13×12=156, không phải 12×12. Kiểm giả định trước phép thế số.'],
'Euler có trực tiếp chứng minh m=13 hoạt động trong RSA modulus221 không?',
'Không trực tiếp vì gcd(13,221)≠1. RSA vẫn có thể đúng với đại diện đó, nhưng cần lập luận riêng theo modulo13 và17 rồi ghép bằng CRT.'),
(12, '''Extended Euclidean algorithm dùng chia có dư rồi thế ngược để viết gcd(a,b)=ax+by. Khi gcd=1, giảm hệ thức theo modulus b cho ax≡1 mod b, lấy x làm nghịch đảo đã chuẩn hóa. Hệ số có thể âm; đó không phải lỗi thuật toán.

Bình phương–nhân tính modular exponentiation theo các bit của số mũ, giảm modulo sau mỗi phép nhân. Nó tránh tạo số mũ khổng lồ và giảm số phép nhân theo độ dài bit số mũ. Đó là thuật toán tính đúng; việc triển khai với khóa bí mật còn có yêu cầu chống lộ thông tin qua thời gian và các kênh bên.''',
'Euclid mở rộng với 7 và192',[
'192=27×7+3; 7=2×3+1, nên gcd=1.',
'1=7−2(192−27×7)=55×7−2×192. Vì vậy d=55 là nghịch đảo của7 modulo192.',
'Kiểm 7×55 mod192=1; với 42^7 mod221, giảm từng bình phương để thu ciphertext185.'],
'Tìm được d âm trong hệ thức Bézout thì có phải loại bỏ nghiệm không?',
'Không. Lấy d modulo modulus để được đại diện không âm thích hợp; mọi đại diện đồng dư thỏa cùng quan hệ nghịch đảo. Vẫn phải kiểm lại phép nhân modulo.')
])
extra('number-theory',2,'Bézout identity','Hệ thức ax+by=gcd(a,b) với các hệ số nguyên x,y.','Thế ngược Euclid để viết 1=55×7−2×192.','Hệ số có thể âm và cần chuẩn hóa khi dùng làm đại diện modulo.')

guide('dh', [
(4, '''Trong nhóm đã chọn, public values A=g^a và B=g^b không phải bản thân private exponents. Hai phía tính B^a=A^b=g^(ab), vì các phép lũy thừa cùng theo quy tắc nhóm. Giá trị chung chưa tự là khóa AES: cần KDF và ngữ cảnh giao thức để tạo đúng vật liệu khóa.

Phải công bố tham số đúng loại: trong nhóm nhân modulo p nguyên tố, nhóm các phần tử khác 0 có p−1 phần tử; một nhóm con có thể có bậc q riêng. Không gọi nhóm đó có bậc p chỉ vì modulus tên p. Chọn g tùy ý vì “là số nguyên tố nhỏ” chưa chứng minh nó sinh nhóm/nhóm con cần dùng.''',
'DH đồ chơi tính hai phía',[
'p=23,g=5,a=6,b=15: A=5^6 mod23=8; B=5^15 mod23=19.',
'Alice tính 19^6 mod23=2; Bob tính 8^15 mod23=2. Cả hai có cùng đại diện số2.',
'Số nhỏ này dễ vét cạn, chỉ để kiểm công thức. Tham số và quá trình xác thực của giao thức thật phải theo đặc tả.'],
'Nếu A và B khác nhau thì có mâu thuẫn với việc hai bên nhận cùng bí mật không?',
'Không. Hai giá trị công khai được tính từ số mũ khác nhau nên thường khác; phép tính chéo mới cho cùng g^(ab). Không yêu cầu A=B.'),
(3, '''Discrete logarithm hỏi lấy a từ g và A=g^a trong nhóm. Computational Diffie–Hellman hỏi tính g^(ab) từ g,g^a,g^b. Đây là các bài toán liên quan nhưng khác phát biểu; độ khó tùy cấu trúc nhóm và tham số. Một ví dụ số nhỏ tính được không đại diện độ khó của nhóm dùng thật.

Kiểm public value rất quan trọng: phần tử không hợp lệ, đơn vị hoặc thuộc nhóm con nhỏ có thể làm bí mật dễ đoán/lộ thông tin trong một số thiết kế. Các giao thức quy định phép kiểm cụ thể; đừng tự nhận mọi số nguyên đối thủ gửi rồi lũy thừa bằng bí mật. KDF còn cần ràng buộc vai trò và transcript theo thiết kế.''',
'Quan sát một public value xấu trong mô hình học',[
'Nếu nhận B=1 thì B^a modp luôn1, không còn là bí mật khó đoán.',
'Nếu nhận giá trị bậc nhỏ, tập kết quả có thể nhỏ hơn miền mong muốn; phân tích phải theo nhóm và cách key được dùng.',
'Trong thư viện/giao thức thật, dùng kiểm tra tham số/public key được quy định thay vì vài điều kiện số học tự chế.'],
'Một public value nằm giữa 1 vàp−1 có chắc thuộc đúng nhóm con cần dùng không?',
'Chưa. Điều kiện miền số chưa đủ kiểm tư cách nhóm con và các giá trị bị cấm theo giao thức; cần phép kiểm tương ứng với bộ tham số.'),
(8, '''DH không xác thực cho phép MITM thay hai giá trị công khai và thiết lập hai bí mật khác nhau với hai đầu. Cả hai người dùng có thể thấy dữ liệu giải được bình thường vì đối thủ dịch qua lại. Authentication phải gắn với transcript đủ dữ liệu: giá trị khóa tạm, tham số, danh tính/vai trò và ngữ cảnh để ngăn thay hoặc dùng chéo.

Forward secrecy nói về việc lộ khóa xác thực dài hạn về sau không đủ giải phiên cũ trong mô hình thích hợp với khóa tạm được tạo/xóa đúng. Nó không bảo vệ bản rõ đang bị đọc trên máy đã chiếm, hay session key đã bị ghi lại trong log. Phải tách bí mật dài hạn dùng xác thực với bí mật tạm dùng thỏa thuận.''',
'Hai phiên của kẻ xen giữa',[
'Alice gửi A, MITM thay bằng X khi chuyển tới Bob; Bob gửi B, MITM thay bằng Y khi chuyển tới Alice.',
'MITM biết số mũ của X/Y nên tính được bí mật từng phía; Alice và Bob không nhất thiết có cùng secret với nhau.',
'Xác thực transcript/khóa theo giao thức ngăn chấp nhận các giá trị bị thay mà không có bằng chứng đúng.'],
'Lưu mọi private exponent tạm để “dễ debug” có giữ nguyên Forward secrecy khi kho log bị lấy không?',
'Không theo mô hình kho đó chứa bí mật đủ tái tính phiên. Xóa khóa tạm/không ghi bí mật và bảo vệ đầu cuối là điều kiện thực tế của lời bảo đảm.')
])
extra('dh',1,'Computational Diffie–Hellman problem','Bài toán tính g^(ab) từ các giá trị công khai g,g^a,g^b trong nhóm được chỉ định.','Phân tích điều đối thủ cần tính để biết bí mật chia sẻ DH.','Không nhầm nguyên văn phát biểu với tìm logarit rời rạc a.')
extra('dh',1,'Small-subgroup attack','Tấn công khai thác phần tử nhóm con nhỏ trong các thiết kế trao đổi khóa có kiểm đầu vào không đủ.','Đối thủ đưa public value có bậc nhỏ để hạn chế tập bí mật có thể xảy ra.','Khả năng và phép phòng phụ thuộc nhóm, giao thức và triển khai cụ thể.')

guide('rsa', [
(14, '''RSA toy key generation cần p,q nguyên tố phân biệt, n=pq, e coprime với φ(n), rồi d là nghịch đảo e theo modulus thích hợp. Public key chứa n,e; private key có thể chứa d,p,q và các tham số CRT để tính nhanh. Public key không cần giữ bí mật nhưng cần xác thực đúng chủ thể.

Đại diện thông điệp phải trong 0≤m<n ở phép RSA thô. Khi dùng lược đồ thật, chuyển byte sang số và padding là các bước được quy định; không tự ép mọi tệp thành số rồi giảm modn vì sẽ mất thông tin. Tính đúng m^ed≡m có thể được chứng minh theo từng modulo nguyên tố và ghép CRT, kể cả khi m không coprime với n.''',
'Khóa đồ chơi p=13,q=17,e=7',[
'n=221, φ(n)=192; gcd(7,192)=1, d=55. Public key là (221,7), private exponent là55.',
'Với m=42, C=42^7 mod221=185; giải 185^55 mod221=42.',
'Thử thêm m=13 để không áp Euler trực tiếp khi gcd(m,n)≠1; kết quả RSA thô vẫn khôi phục13 với khóa này.'],
'Gửi m=300 trực tiếp vào phép RSA modulus221 rồi giải có lấy lại duy nhất300 không?',
'Không. Phép modulo chỉ giữ lớp đồng dư, nên 300 và79 có cùng đại diện. Phải tuân miền đầu vào và encoding/lược đồ, không bỏ qua kích thước.'),
(29, '''Textbook RSA là deterministic: cùng public key và m cho cùng C, nên đối thủ có thể mã hóa các bản rõ ứng viên rồi so mà không cần private key. Với số m và e nhỏ thỏa m^e<n, chưa có wrap modulo, C=m^e cho phép lấy căn nguyên. Tính nhân của RSA thô cũng cho các biến đổi có cấu trúc.

Broadcast attack với cùng thông điệp nhỏ, cùng e và nhiều modulus phù hợp có thể dùng CRT để ghép thông tin rồi lấy căn dưới điều kiện bài toán. Các vấn đề này không được sửa đơn giản bằng việc tăng n. Randomized encoding như lược đồ OAEP phải được dùng đúng qua thư viện.''',
'Hai phản ví dụ cho quảng cáo RSA thô',[
'Nếu e=3,m=2 và n>8, C=8; căn bậc3 nguyên cho ngay2, không cần phân tích n.',
'Vì E(m1)E(m2) modn=E(m1m2 modn), bản mã có thể bị biến đổi theo quan hệ đại số.',
'Nếu m chỉ là YES hoặc NO theo encoding công khai, đối thủ mã hóa hai ứng viên và so bản mã deterministic.'],
'RSA modulus rất lớn nhưng chỉ mã hóa PIN bốn số bằng công thức thô. Đối thủ có public key cần làm gì?',
'Thử mã hóa mọi PIN theo encoding rồi so với ciphertext. Đây là kiểm miền bản rõ nhỏ dựa trên tính xác định, không cần phá khóa RSA bằng phân tích n.'),
(25, '''PEM là lớp biểu diễn văn bản thường chứa Base64 và nhãn; DER là encoding nhị phân của cấu trúc ASN.1. Cùng định dạng PEM có thể chứa public key, private key hoặc certificate, nên phải đọc loại đối tượng chứ không đoán theo đuôi .pem. Public export phải thật sự bỏ thành phần riêng.

Trong API, một đối tượng key pair có thể cho xuất cả phần riêng và công khai. Cần chọn public_key() trước khi export để chia sẻ công khai. Mã hóa private key lúc lưu cần lược đồ bảo vệ và passphrase đúng; chỉ gọi export_key(format='PEM') không tự bảo vệ bí mật. Ví dụ học không nên in private key ra giao diện hoặc log.''',
'Kiểm đường đi khóa qua công cụ/API',[
'Sinh đối tượng khóa thử trong môi trường riêng; giữ private key theo chính sách, không tải lên trang học.',
'Xuất public component bằng thao tác riêng; kiểm nó dùng cho verify/encrypt và không chứa private components.',
'Thử import lại public export và kiểm đúng loại/thuật toán. Phân biệt định dạng lưu trữ với cách sinh hay độ mạnh key.'],
'Một tệp bắt đầu bằng BEGIN PRIVATE KEY và nội dung Base64 có được coi là đã mã hóa vì không đọc bằng mắt được không?',
'Không. Base64 là encoding; phải xét loại cấu trúc private-key và có cơ chế bảo vệ mật khẩu/lược đồ mã hóa nào thật sự áp dụng hay không.')
])
extra('rsa',1,'Broadcast attack','Lớp tấn công khai thác cùng thông điệp RSA thô gửi tới nhiều modulus trong các điều kiện nhất định.','Phân tích cùng m,cùng e nhỏ và đủ bản mã để ghép thông tin bằng CRT.','Phải kiểm điều kiện về thông điệp, modulus và encoding; không tự áp cho RSA-OAEP đúng chuẩn.')

guide('oaep', [
(33, '''OAEP tạo encoded message bằng hash, seed ngẫu nhiên, mask generation và các quy tắc kiểm. Byte thông điệp không chỉ được nối thêm một ít rác rồi giữ nguyên ở cuối như mọi loại padding. RSAES-OAEP là toàn lược đồ mã hóa; OAEP là encoding bên trong trước phép RSA.

PKCS#1 v1.5 encryption có cấu trúc khác: khối bắt đầu 00 02, phần PS gồm byte khác0 có độ dài tối thiểu theo chuẩn, rồi 00 và thông điệp. Không được diễn giải mọi byte trừ hai byte đầu đều ngẫu nhiên, vì còn delimiter và M. Lỗi giải mã phân biệt được có thể tạo oracle trong các thiết kế dễ bị tấn công.''',
'Đọc luồng mã hóa ở ba tầng',[
'Bắt đầu từ byte M hợp độ dài, ngẫu nhiên seed và các tham số lược đồ đã thống nhất.',
'OAEP encode tạo khối phù hợp; sau đó phép RSA public-key operation xử lý đại diện số của khối đó.',
'Bên nhận thực hiện private-key operation và kiểm/decode theo toàn quy tắc; lỗi trả về không để lộ các chi tiết trung gian dễ thành oracle.'],
'OAEP dùng ngẫu nhiên có cho phép bỏ xác thực public key của người nhận không?',
'Không. Ngẫu nhiên hóa giải quyết tính chất của lược đồ mã hóa, không chứng minh key thuộc đúng Bob. Lấy nhầm public key vẫn có thể mã hóa bí mật cho đối thủ.'),
(30, '''Giới hạn OAEP là mLen≤k−2hLen−2, với k là số byte modulus và hLen là số byte digest của hash OAEP. Dùng bit thay byte trong công thức sẽ cho kết quả sai rất lớn. Các tham số có vai trò khác nhau: hash OAEP, MGF1 hash và label phải khớp theo cấu hình/giao thức.

RSA-OAEP không tự chứng minh người gửi: ai có public key đều có thể tạo ciphertext. Nó thường được dùng để bảo vệ một khóa dữ liệu nhỏ trong mã hóa lai. Không “sửa” vượt giới hạn bằng cách cắt các đoạn tùy ý mà thiếu định dạng và ràng buộc tổng thể.''',
'Bảng tính giới hạn đầu vào',[
'RSA2048: k=256 byte. Với SHA-256 hLen=32 -> mLen tối đa256−64−2=190 byte.',
'Cùng modulus nhưng SHA-512 hLen=64 -> tối đa126 byte. Đổi hash có thể đổi giới hạn thông điệp.',
'Khóa dữ liệu32 byte vừa trong cả hai ví dụ; tệp1MiB thì phải dùng cơ chế dữ liệu lớn, không áp RSA một lần trực tiếp.'],
'RSA4096 với SHA-256 bảo vệ tối đa bao nhiêu byte theo công thức và có đủ cho tệp1MiB không?',
'k=512,hLen=32 nên tối đa446 byte. Không đủ cho1MiB; dùng mã hóa lai và định dạng/giao thức đúng.'),
(44, '''OpenSSL pkeyutl chọn thao tác bằng -encrypt/-decrypt, loại đầu vào key bằng -pubin khi cần, và các tùy chọn RSA padding/hash qua -pkeyopt. Khi giải mã, dùng private key thích hợp và cùng tham số OAEP. Tên tệp key.bin chỉ biểu thị dữ liệu đầu vào; nó không tự sinh khóa đối xứng.

API PyCryptodome cần import đúng key và khởi tạo PKCS1_OAEP theo hash đã chọn. Không dựa vào mặc định hai thư viện có thể khác; ghi cấu hình ra metadata/giao thức. Khi decode thất bại, giữ xử lý lỗi nhất quán và không sử dụng dữ liệu chưa được lược đồ chấp nhận.''',
'Kiểm khả năng tương thích giữa hai đầu',[
'Xác định public/private key cùng cặp và định dạng được thư viện chấp nhận.',
'Chốt OAEP hash, MGF1 hash và label; dùng dữ liệu thử trong giới hạn, giải rồi so đúng byte.',
'Thử sai label, sai key, dữ liệu bị sửa và đầu vào quá dài để xác nhận không trả dữ liệu giả như một kết quả thành công.'],
'Mã hóa ở Python giải được tại Python nhưng OpenSSL báo lỗi. Bước kiểm đầu tiên là gì?',
'Đối chiếu key và toàn bộ tham số OAEP/MGF1/label, định dạng và byte ciphertext. Không suy lỗi RSA toán học chỉ từ một cặp API mặc định không khớp.')
])
extra('oaep',0,'RSAES-OAEP','Lược đồ mã hóa RSA kết hợp OAEP encoding với các phép RSA và quy tắc kiểm tương ứng.','Thư viện mã hóa khóa dữ liệu nhỏ bằng RSAES-OAEP.','Không đồng nghĩa phép lũy thừa RSA thô hoặc chữ ký PSS.')
extra('oaep',0,'Decryption oracle','Giao diện/hành vi cho đối thủ thông tin từ các truy vấn giải mã được chọn.','Phân biệt lỗi padding và lỗi nội dung ở một dịch vụ giải mã dễ bị tấn công.','Khả năng khai thác phụ thuộc lược đồ, kiểu thông tin lộ và mô hình truy vấn.')

guide('pss', [
(47, '''RSASSA-PSS là lược đồ chữ ký RSA sử dụng EMSA-PSS encoding. Hash thông điệp, salt và mask generation tham gia cấu trúc được kiểm; signature dùng private-key operation còn bên kiểm dùng public key. Đó không phải dùng RSA-OAEP theo chiều ngược.

PSS có thể tạo chữ ký khác nhau trên cùng thông điệp do salt ngẫu nhiên mới. Bên nhận không tạo một chữ ký mẫu bằng private key để so; họ kiểm các điều kiện lược đồ bằng public key. Thông điệp vẫn không được che, trừ khi có một lớp bảo vệ bí mật riêng.''',
'Ký hai lần cùng byte',[
'Dùng cùng key và cấu hình PSS để ký M hai lần với salt ngẫu nhiên phù hợp.',
'Hai signature có thể khác byte nhưng Verify(M,S1) và Verify(M,S2) cùng hợp lệ.',
'Đổi một byte M và kiểm cả hai chữ ký: phải bị từ chối nếu không có sự kiện bất thường ngoài mô hình mong đợi.'],
'Một hệ đòi chữ ký mới phải bằng byte chữ ký đã lưu để xem hợp lệ có đúng với PSS không?',
'Không. Cần Verify theo lược đồ/tham số. So byte chữ ký với một mẫu duy nhất loại sai các chữ ký ngẫu nhiên hợp lệ.'),
(48, '''Prehash là việc API nhận một đối tượng/digest hash đã được tạo, khác với API tự nhận thông điệp rồi băm. Truyền digest hex vào API nhận message có thể ký H(hex(H(M))) thay vì H(M). Hai phía phải đồng thuận chính xác kiểu dữ liệu và tầng nào băm.

Serialization xác định các byte được ký cho dữ liệu có cấu trúc. JSON tương đương về trường chưa chắc tương đương byte khi đổi khoảng trắng, thứ tự hoặc Unicode. Nếu chọn canonicalization, quy tắc phải được đặc tả và áp dụng giống nhau; nếu ký byte nguyên gốc, phải giữ chính những byte đó để kiểm.''',
'Một giao dịch JSON nhìn giống nhưng byte khác',[
'M1={"a":1,"b":2}; M2={"b":2,"a":1}. Chúng có thể cùng nghĩa ở ứng dụng nhưng không cùng chuỗi byte.',
'Chọn ký byte nguyên gốc hoặc một dạng chuẩn hóa được quy định; không tự chuẩn hóa khác ở mỗi bên.',
'Trong PyCryptodome PSS, truyền đối tượng hash phù hợp như SHA256.new(message_bytes), không thay bằng chuỗi hexdigest.'],
'Vì sao dấu cách mới trong JSON có thể làm chữ ký không khớp mà không phải chữ ký “kém ổn định”?',
'Chữ ký kiểm byte đã quy định. Nếu ứng dụng không có quy tắc canonicalization tương ứng, dấu cách làm đầu vào khác và bị từ chối là hành vi đúng.'),
(38, '''Kiểm nghiệm chữ ký phải có ca âm: sai key, sửa message, sửa signature, sai tham số và chữ ký bị cắt. Ca thành công duy nhất không chứng minh nhánh lỗi được xử lý đúng. Với API verify trả None khi thành công và ném ngoại lệ khi sai, viết if verify(...) có thể đảo logic mong muốn.

Sau khi Verify thành công, vẫn phải kiểm quyền, danh tính, thời hạn và freshness theo ứng dụng. Nếu bài thực hành chỉ thử đổi bit chữ ký, kết luận giới hạn là phát hiện byte chữ ký bị đổi theo phép kiểm; không mở rộng thành bảo đảm mọi giao dịch có chủ ý hoặc mọi key chưa bị chiếm.''',
'Ma trận kiểm thử một bộ ký',[
'Giữ một message/key/signature đúng làm baseline và xác nhận Verify thành công.',
'Mỗi lần chỉ thay một biến: một byte message, một byte signature, key khác hoặc tham số khác. Ghi rõ trạng thái mong muốn là từ chối.',
'Kiểm code gọi không nuốt ngoại lệ rồi coi như thành công; không lưu điểm/kết quả giả khi thư viện từ chối.'],
'verify không ném ngoại lệ nhưng trả None. bool(None)=False có phải chữ ký sai không?',
'Không với API có hợp đồng thành công bằng không ném ngoại lệ. Phải đọc hợp đồng hàm và xử lý ngoại lệ tương ứng, không tự suy mọi verify trả boolean.')
])
extra('pss',0,'RSASSA-PSS','Lược đồ chữ ký RSA dùng PSS encoding và các phép ký/kiểm RSA tương ứng.','Ký hash thông điệp qua API PSS bằng private key rồi kiểm bằng public key.','Không dùng nó như lược đồ mã hóa thông điệp bí mật.')

guide('protocols', [
(52, '''SSH public-key authentication chứng minh client sở hữu private key được server cho phép dùng cho tài khoản. authorized_keys là danh sách key được chấp nhận ở server; known_hosts thuộc phía client để nhận diện host key. Đó là hai hướng tin cậy khác nhau, không phải hai bản sao cùng một danh sách.

Host key thay đổi cần được kiểm theo quy trình vì có thể là đổi máy hợp lệ hoặc dấu hiệu MITM. Tự xóa known_hosts mỗi khi cảnh báo xuất hiện làm mất điểm neo tin cậy. Passphrase bảo vệ private key lúc lưu là một lớp khác với mật khẩu tài khoản trên server và không thay việc xác thực host.''',
'Lần SSH đầu và các lần sau',[
'Xác nhận host key/fingerprint qua kênh phù hợp trước khi tin; không coi lần đầu tự hiện ra là chứng minh đúng host.',
'Server kiểm bằng chứng từ client và key trong authorized_keys của đúng tài khoản.',
'Khi host key đổi, điều tra lý do và xác nhận key mới; không chỉ bấm bỏ qua để kết nối được.'],
'Chép private key client vào authorized_keys có đúng cấu trúc không?',
'Không. authorized_keys chứa public keys được cấp quyền; private key giữ ở phía client theo chính sách. Nhầm hai loại làm lộ bí mật mà không tạo quy trình cấp quyền đúng.'),
(54, '''TLS 1.3 kết hợp thiết lập key, xác thực và mã hóa xác thực bản ghi theo giao thức; HTTPS là HTTP trên TLS. Mô hình certificate-based handshake cần kiểm certificate/name, bằng chứng khóa và transcript, không chỉ nhận một public key rồi mã hóa dữ liệu tùy ý.

Phải phân biệt ví dụ RSA key transport lịch sử với TLS1.3. RSA có thể liên quan chữ ký trong những cấu hình phù hợp, nhưng TLS1.3 không dùng RSA key transport như cách gửi session key trong một số slide cũ. Transcript liên kết các bản tin thiết lập để tránh đối thủ thay tham số mà vẫn được chấp nhận.''',
'Tách ba lớp khi phân tích HTTPS',[
'Lớp danh tính: client xác thực đúng máy chủ mong muốn qua quy trình certificate/key theo cấu hình.',
'Lớp phiên: các bên thiết lập secret và xác thực transcript theo giao thức, rồi dẫn xuất vật liệu khóa.',
'Lớp ứng dụng: HTTP còn cần Authorization, quản lý session và kiểm dữ liệu; TLS không tự chặn truy cập sai quyền ở endpoint.'],
'Trang dùng HTTPS nhưng server ứng dụng bị chiếm có còn giữ bí mật với chính server đó không?',
'Thông thường server endpoint cần xử lý bản rõ nên TLS không bảo vệ khỏi chính endpoint đã chiếm. Phải nêu rõ biên của bảo vệ đường truyền và mô hình xử lý dữ liệu.'),
(57, '''Thẻ chip trong mô hình bài học có thể giữ private key và tạo bằng chứng theo thử thách/giao dịch. Cần phân biệt xác thực thiết bị có key với xác nhận giao dịch cụ thể. Chữ ký trên một nonce không chứa số tiền/bên nhận có thể không chứng minh sự đồng ý với các trường đó.

Transaction binding ràng buộc bằng chứng với nội dung quan trọng, danh tính, ngữ cảnh và tính mới. Dù thiết bị ký đúng byte, tầng hiển thị/nhập liệu còn phải bảo đảm người dùng thấy và chủ ý đúng giao dịch. Bài học không giả định mọi thẻ/ngân hàng dùng một lược đồ công khai giống nhau; phân tích theo mô hình trong tài liệu.''',
'Từ thử thách xác thực sang giao dịch',[
'Nếu chỉ ký nonce mới, kết luận giới hạn là bằng chứng sở hữu key trong ngữ cảnh giao thức được thiết kế.',
'Muốn xác thực giao dịch, đưa số tiền, tiền tệ, bên nhận, mã giao dịch và freshness vào cấu trúc được bảo vệ.',
'Bên nhận kiểm chữ ký, quyền và trạng thái xử lý; thử đổi một trường quan trọng hoặc gửi lại giao dịch đã dùng.'],
'Người dùng xác nhận10 nhưng thiết bị ký100 do hiển thị sai. Chữ ký đúng có tự chứng minh người dùng đồng ý100 không?',
'Không. Mật mã ràng buộc byte với key, còn ràng buộc giữa byte, giao diện và ý định người dùng cần được bảo đảm bởi quy trình/hệ thống khác.')
])
extra('protocols',1,'Handshake transcript','Chuỗi dữ liệu thiết lập phiên được giao thức dùng để ràng buộc và xác thực ngữ cảnh thương lượng.','Xác thực các giá trị khóa tạm và tham số phiên theo giao thức TLS.','Không tùy ý bỏ một trường vì nó đã xuất hiện ở màn hình trước.')
