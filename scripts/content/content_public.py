add('number-theory','public','Modulo, Euler và Euclid mở rộng','Nền toán đủ để tính khóa RSA bằng tay.','source-6',[9,10,11,12,13,18,19,20],['Số học modulo','gcd · φ(n) · Nghịch đảo','Lũy thừa modulo nhanh'],'''
Đồng dư và số nguyên tố cùng nhau
a≡b mod n nghĩa là n chia hết a−b. Hai số nguyên tố cùng nhau nếu gcd(a,b)=1. Với modulus n, nghịch đảo của e là d sao cho ed≡1 mod n; tồn tại khi gcd(e,n)=1. Không được lấy 1/e trong số thực thay nghịch đảo modulo. Ví dụ 7×55=385≡1 mod 192 nên 55 là nghịch đảo của 7 modulo 192.

Hàm φ và định lý Euler
Euler totient φ(n) đếm các số nguyên trong 1…n nguyên tố cùng nhau với n. Với p nguyên tố, φ(p)=p−1; với hai nguyên tố khác nhau p,q thì φ(pq)=(p−1)(q−1). Định lý Euler: nếu gcd(a,n)=1 thì a^φ(n)≡1 mod n. Điều kiện này phải được kiểm tra khi dùng định lý; việc RSA hoạt động với một số bản rõ không nguyên tố cùng nhau cần lập luận khác qua từng modulus nguyên tố.

Tính có hiệu quả và kiểm chứng
Extended Euclidean algorithm tìm x,y sao cho ax+by=gcd(a,b), từ đó suy ra nghịch đảo khi gcd bằng 1. Modular exponentiation dùng bình phương và nhân, giảm modulo từng bước thay vì tạo số a^e rất lớn rồi chia. Có thể kiểm d bằng (e×d) mod φ(n)=1. Trong mô phỏng, số nhỏ chỉ giúp nhìn phép tính và không có độ an toàn thật.
''','''
Modulo|Phép lấy phần dư|Quan hệ/tính toán theo phần dư khi chia cho modulus.|Giảm các bước lũy thừa để không tạo số khổng lồ.|Cần chuẩn hóa phần dư âm đúng quy ước.
GCD|Ước chung lớn nhất|Số nguyên dương lớn nhất chia hết cả hai số.|Kiểm gcd(e,φ(n)) trước khi tìm khóa RSA.|Không phải tích hay bội chung nhỏ nhất.
Coprime|Nguyên tố cùng nhau|Hai số có ước chung lớn nhất bằng 1.|Kiểm điều kiện tồn tại nghịch đảo modulo.|Không đòi cả hai số đều là số nguyên tố.
Euler totient|Hàm phi Euler|Số lượng số trong 1…n nguyên tố cùng nhau với n.|Tính φ(pq) khi p,q là nguyên tố phân biệt.|Không dùng (p−1)(q−1) nếu giả định p,q sai.
Euler theorem|Định lý Euler|Nếu gcd(a,n)=1 thì a^φ(n) đồng dư 1 modulo n.|Rút gọn lũy thừa với điều kiện nguyên tố cùng nhau.|Không bỏ điều kiện gcd.
Modular inverse|Nghịch đảo modulo|d sao cho e×d đồng dư 1 theo modulus.|Tìm d từ e=7 và modulus 192.|Khác phép chia số thực.
Extended Euclidean algorithm|Euclid mở rộng|Tìm hệ số Bézout ax+by=gcd(a,b).|Tính nghịch đảo phục vụ sinh khóa RSA.|Chỉ lấy nghịch đảo khi gcd=1.
Modular exponentiation|Lũy thừa modulo|Tính a^e mod n bằng thuật toán giảm modulo có hiệu quả.|Bình phương–nhân để mã hóa RSA số nhỏ.|Không nên tạo a^e toàn bộ trước khi giảm.
''','Với p=13,q=17,e=7, tính n,φ(n),d bằng Euclid mở rộng, kiểm chứng nghịch đảo và mã hóa/giải mã m=42. Chỉ rõ điều kiện áp dụng Euler và vì sao số nhỏ không an toàn.',[
'n=221, φ=12×16=192; 192=27×7+3, 7=2×3+1 nên 1=55×7−2×192; d=55.',
'7×55=385≡1 mod192. C=42^7 mod221=185; 185^55 mod221=42, dùng bình phương–nhân.',
'Euler cần gcd(m,n)=1; ở đây gcd(42,221)=1. Nếu không thỏa không được áp trực tiếp, cần lập luận RSA qua p,q.',
'221 phân tích dễ thành 13×17; phi và d suy được ngay. Không dùng mô phỏng số nhỏ như triển khai thật.'
])

add('dh','public','Diffie–Hellman và điều gì chưa được xác thực','Hai bên tạo chung bí mật mà không truyền trực tiếp bí mật đó.','source-6',[2,3,4,5,6,7,8],['A = g^a mod p','B = g^b mod p','B^a = A^b mod p'],'''
Luồng tính toán cơ bản
Trong ví dụ nhóm nhân modulo p, hai bên thống nhất tham số nhóm p và phần tử sinh thích hợp g. Alice chọn a bí mật, gửi A=g^a mod p. Bob chọn b bí mật, gửi B=g^b mod p. Alice tính B^a, Bob tính A^b, cùng được g^(ab) mod p. Ví dụ p=23,g=5,a=6,b=15: A=8,B=19, chung giá trị 2. Tham số nhỏ chỉ minh họa.

Giả định khó và kiểm tra tham số
Discrete logarithm problem hỏi tìm a từ g,A trong nhóm xác định. Khó khăn phụ thuộc nhóm và tham số, không chỉ “g là số nhỏ”. Trong nhóm nhân toàn phần modulo nguyên tố, số phần tử khác 0 là p−1, không phải p. Giá trị chia sẻ cần đưa qua KDF với ngữ cảnh để tạo khóa sử dụng; phải kiểm tra đầu vào nhóm theo giao thức, không dùng mọi số nhận được tùy ý.

Trao đổi khóa chưa chứng minh danh tính
DH không xác thực có thể bị MITM dựng hai bí mật riêng với Alice và Bob. Cần xác thực transcript qua chữ ký/chứng chỉ hoặc cơ chế được thiết kế phù hợp. DHE dùng khóa tạm thời; ECDHE dùng phiên bản đường cong elliptic với khóa tạm thời. Forward secrecy giúp phiên cũ không bị giải mã chỉ vì lộ khóa xác thực dài hạn về sau, khi khóa tạm đã được tạo/xóa đúng và giả định giao thức giữ.
''','''
Diffie–Hellman|Thỏa thuận khóa DH|Hai bên tính chung bí mật từ giá trị công khai và số mũ bí mật trong nhóm.|Alice tính B^a, Bob tính A^b ra cùng g^(ab).|Không tự xác thực danh tính hai bên.
Discrete logarithm problem|Bài toán logarit rời rạc|Tìm số mũ a từ g và g^a trong nhóm.|Phân tích cơ sở độ khó của một lựa chọn nhóm DH.|Khó hay dễ phụ thuộc nhóm/tham số.
Cyclic group|Nhóm cyclic|Nhóm có thể sinh các phần tử từ một phần tử sinh.|Chọn miền toán học có cấu trúc cho DH.|Phải nêu đúng nhóm hoặc nhóm con đang dùng.
Generator|Phần tử sinh|Phần tử sinh ra nhóm hoặc nhóm con đã chọn qua các lũy thừa.|Chọn g cho tham số DH.|Không phải mọi số nhỏ đều là phần tử sinh phù hợp.
KDF|Hàm dẫn xuất khóa|Hàm tạo vật liệu khóa theo đầu vào và ngữ cảnh quy định.|Biến bí mật DH thành khóa mã hóa/xác thực cho phiên.|Không dùng tùy ý số chia sẻ thô như mọi loại khóa.
ECDHE|DH elliptic với khóa tạm thời|Thỏa thuận khóa DH trên đường cong elliptic dùng khóa tạm theo phiên.|Thiết lập khóa phiên với khả năng forward secrecy trong giao thức phù hợp.|Cần xác thực transcript và xóa khóa tạm đúng.
Forward secrecy|Bí mật chuyển tiếp|Lộ khóa dài hạn về sau không đủ khôi phục khóa phiên cũ trong mô hình.|Đánh giá phiên ghi lưu khi khóa xác thực bị lộ một năm sau.|Không bảo vệ khi bản rõ/khóa phiên bị lấy ngay lúc chạy.
''','Tính DH p=23,g=5,a=6,b=15. Kẻ xen giữa thay A,B bằng giá trị của mình: giải thích vì sao tính toán vẫn thành công mà danh tính sai. Thiết kế ràng buộc transcript, KDF và đánh giá lộ khóa dài hạn về sau.',[
'A=8,B=19; 19^6 mod23=8^15 mod23=2. Nhấn mạnh chỉ là nhóm nhỏ minh họa.',
'MITM có thể tính bí mật riêng với từng đầu; hai đầu có kết nối mã hóa nhưng không nói chuyện trực tiếp đúng người.',
'Xác thực cả hai giá trị, tham số/thuật toán, vai trò và ngữ cảnh phiên; kiểm đầu vào nhóm và dùng KDF theo giao thức.',
'Khóa tạm tạo/xóa đúng giúp phiên cũ không lộ chỉ vì khóa xác thực dài hạn lộ; vẫn phụ thuộc xác thực và không lộ bí mật phiên.'
])

add('rsa','public','RSA: từ p, q đến khóa công khai','Tính một ví dụ hoàn chỉnh rồi phân tích textbook RSA.','source-6',[9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,29],['p,q → n, φ(n)','e ↔ d','C = m^e · m = C^d'],'''
Sinh khóa trong mô hình học
Chọn nguyên tố khác nhau p,q, tính n=pq và φ(n)=(p−1)(q−1). Chọn e nguyên tố cùng nhau với φ(n), tìm d=e^−1 mod φ(n). Khóa công khai gồm n,e; khóa riêng chứa d và thường thêm các thành phần tối ưu. Với p=13,q=17,e=7 có n=221,d=55. Mã hóa số đại diện 0≤m<n bằng C=m^e mod n, giải mã m=C^d mod n.

Textbook RSA có nhiều đường tắt
Textbook RSA xác định: cùng m và khóa cho cùng C. Với e nhỏ và m^e<n, lấy căn bậc e nguyên của C sẽ ra m mà không phân tích n. Còn có tính nhân: E(m1)E(m2) mod n=E(m1m2 mod n). Lớn hóa n không sửa tính xác định và tính nhân. Không dùng công thức toán học thô làm lược đồ mã hóa thông điệp thực tế.

Định dạng khóa và công cụ
PEM bọc dữ liệu nhị phân được Base64 thành văn bản có nhãn; DER là mã hóa nhị phân theo quy tắc định dạng. Đây là định dạng, không tự làm khóa bí mật. Lệnh genpkey sinh khóa và pkey -pubout xuất khóa công khai. Ví dụ slide có khóa nhỏ để quan sát; phần cú pháp dùng tham số thực hành lớn hơn và ghi rõ giả định. Không dán khóa riêng thật vào ghi chú web.
''','''
RSA|Hệ mật mã RSA|Hệ khóa công khai dùng lũy thừa modulo với modulus có cấu trúc tích nguyên tố.|Tính mã hóa và giải mã từ n,e,d.|Phải dùng lược đồ chuẩn, không textbook RSA cho dữ liệu thật.
RSA modulus|Modulus RSA|n=pq với p,q nguyên tố được giữ bí mật trong mô hình hai nguyên tố.|Khóa công khai chứa tích n thay vì công bố p,q.|Phân tích được n có thể suy khóa riêng.
Public exponent|Số mũ công khai|Tham số e của khóa RSA thỏa điều kiện nghịch đảo với modulus sinh khóa.|Chọn e rồi kiểm điều kiện trước sinh d.|e nhỏ không làm textbook RSA an toàn.
Private exponent|Số mũ bí mật|Tham số d nghịch đảo e theo điều kiện sinh khóa RSA.|Dùng số mũ riêng để giải mã trong mô hình học.|Không công bố d cùng n,e.
Textbook RSA|RSA thô|Phép lũy thừa modulo chưa có lược đồ đệm/định dạng an toàn.|Cùng số bản rõ mã hóa ra cùng số bản mã.|Tính xác định và tính nhân gây tấn công.
Deterministic encryption|Mã hóa xác định|Cùng bản rõ và khóa cho cùng bản mã khi không có ngẫu nhiên thay đổi.|Đối thủ thử danh sách bản rõ ngắn bằng khóa công khai rồi so.|Không tạo bảo đảm bí mật ngữ nghĩa cho miền dễ đoán.
PEM|Định dạng văn bản PEM|Biểu diễn dữ liệu mã hóa nhị phân qua Base64 với nhãn bao quanh.|Tập tin khóa có BEGIN và END cùng nội dung Base64.|Base64 không tự mã hóa bảo vệ khóa.
DER|Mã hóa nhị phân DER|Quy tắc biểu diễn nhị phân chuẩn tắc của cấu trúc ASN.1.|Phân biệt dữ liệu nhị phân khóa với lớp bọc văn bản.|Không đồng nghĩa với bản mã bí mật.
''','Với textbook RSA e=3,n=55,m=3, tìm C và cách lấy lại m không biết d. Chứng minh tính nhân, giải thích tấn công từ điển miền 100 mã và tại sao đổi PEM sang DER không sửa thiết kế.',[
'C=27 vì 3^3<55; căn bậc ba nguyên 27 là 3, không cần khóa riêng hay phân tích n.',
'E(m1)E(m2)=(m1m2)^e modn; bản mã có thể được biến đổi có quan hệ. Modulus lớn hơn không loại cấu trúc này.',
'100 mã ứng viên có thể được mã hóa công khai rồi so vì deterministic; lược đồ ngẫu nhiên đúng như OAEP xử lý vấn đề theo giả định.',
'PEM/DER chỉ định dạng biểu diễn khóa; cần lược đồ chuẩn, quản lý khóa và mã hóa lai cho dữ liệu lớn.'
])

add('oaep','public','OAEP và giới hạn dữ liệu RSA','Đệm mã hóa không phải đệm chữ ký.','source-6',[28,29,30,31,32,33,43,44,45],['Thông điệp + Ngẫu nhiên','OAEP + RSA','Khóa dữ liệu → Mã hóa lai'],'''
Đệm có chức năng theo lược đồ
RSAES-OAEP dùng ngẫu nhiên, hàm băm và mask generation để mã hóa thông điệp trước phép RSA, khắc phục nhiều vấn đề của RSA thô trong mô hình chuẩn. Không diễn giải OAEP là “thêm vài byte ngẫu nhiên cuối tệp”. PKCS#1 v1.5 encryption là lược đồ cũ khác; phản hồi giải mã có thể tạo oracle nếu giao thức xử lý sai. OAEP cũng cần thư viện, cấu hình và xử lý lỗi đúng.

Giới hạn không thể bỏ qua
Theo RFC 8017, mLen≤k−2hLen−2 với OAEP; k là số byte modulus, hLen là số byte digest được dùng. RSA 2048 bit có k=256, với SHA-256 hLen=32 thì tối đa 190 byte. Tệp lớn cần mã hóa lai, không cắt tùy tiện rồi áp RSA riêng từng mảnh. Hai bên phải thống nhất hash OAEP, MGF1, label và định dạng.

Cú pháp thực hành hiện đại
openssl pkeyutl -encrypt -pubin -inkey public.pem -in key.bin -out key.enc -pkeyopt rsa_padding_mode:oaep -pkeyopt rsa_oaep_md:sha256 -pkeyopt rsa_mgf1_md:sha256 bảo vệ khóa dữ liệu nhỏ. Giải mã dùng -decrypt và khóa riêng. pkeyutl thay rsautl cũ trong ví dụ thực hành. Các lệnh chỉ có tính hướng dẫn trong web, không chạy thật; kiểm đủ điều kiện dữ liệu và khóa trước khi dùng ở môi trường riêng.
''','''
OAEP|Đệm mã hóa bất đối xứng tối ưu|Lược đồ mã hóa RSA có ngẫu nhiên và mask generation theo chuẩn.|Muốn RSA mã hóa khóa dữ liệu nhỏ với ngẫu nhiên.|Không phải lược đồ chữ ký.
PKCS#1 v1.5 encryption|Đệm mã hóa RSA v1.5|Lược đồ đệm mã hóa RSA cũ với định dạng xác định.|Phân tích nguy cơ phản hồi lỗi giải mã tạo oracle.|Không nhầm với PKCS#7 của CBC.
MGF1|Hàm sinh mặt nạ MGF1|Hàm tạo mặt nạ từ seed bằng hàm băm trong các lược đồ RSA.|Đọc tham số rsa_mgf1_md khi cấu hình OAEP/PSS.|Hai bên cần thống nhất cấu hình.
OAEP label|Nhãn OAEP|Dữ liệu ngữ cảnh tùy chọn được ràng buộc trong OAEP.|Giải mã cần label phù hợp với lúc mã hóa.|Không thay xác thực danh tính người gửi.
Message length bound|Giới hạn độ dài thông điệp|Ràng buộc kích thước đầu vào theo lược đồ và tham số.|Tính k−2hLen−2 cho RSA-OAEP.|Không dùng cả k byte cho bản rõ OAEP.
''','RSA 2048 bit, OAEP SHA-256 nhận khóa 32 byte hay file 240 byte? Tính giới hạn, sửa kiến trúc cho file 5 GiB; phân tích khác hash/MGF1/label và điều gì OAEP chưa chứng minh về người gửi.',[
'k=256,hLen=32 nên tối đa 190 byte. Khóa 32 byte phù hợp; 240 byte vượt giới hạn.',
'Sinh khóa dữ liệu phù hợp, mã hóa file bằng cơ chế đối xứng xác thực, RSA-OAEP chỉ bảo vệ khóa và định dạng metadata liên quan.',
'Phải thống nhất hash, MGF1 hash và label; cấu hình khác có thể giải mã thất bại, không tự động suy khóa đã sai/lộ.',
'Ai có khóa công khai cũng có thể mã hóa cho người nhận; OAEP không tự chứng minh người gửi là ai. Cần cơ chế xác thực phù hợp.'
])

add('pss','public','RSA-PSS: ký, kiểm chứng và byte được bảo vệ','Hai chữ ký khác nhau có thể cùng hợp lệ.','source-6',[34,35,36,37,38,39,40,46,47,48],['Thông điệp → Hash','PSS + Khóa riêng → Ký','Khóa công khai → Kiểm'],'''
Chữ ký theo lược đồ hoàn chỉnh
RSA-PSS kết hợp hàm băm, salt và quy tắc mã hóa thông điệp cho chữ ký RSA. Người ký dùng khóa riêng; người kiểm chứng dùng khóa công khai đã xác thực. Chữ ký không che thông điệp. Hai lần ký cùng thông điệp với ngẫu nhiên mới có thể cho hai chữ ký khác nhau nhưng cùng hợp lệ. Kiểm chứng là phép kiểm quy tắc lược đồ, không phải so chữ ký mới với chữ ký cũ.

Giữ thông điệp và tham số nhất quán
Cần thống nhất hash, MGF1 và quy tắc độ dài salt. Prehash là băm trước khi đưa vào API chấp nhận digest; nhiều API khác tự băm thông điệp. Băm hai lần do nhầm API có thể làm hai bên không khớp. Serialization xác định byte của cấu trúc dữ liệu: thứ tự trường, encoding và ranh giới phải rõ. “Ký JSON” mà không quy định byte hoặc chuẩn hóa có thể gây lỗi kiểm chứng.

Thực hành và kiểm nghiệm âm
Ví dụ openssl dgst -sha256 -sign private.pem -sigopt rsa_padding_mode:pss -sigopt rsa_pss_saltlen:digest -out signature.bin message.txt tạo chữ ký. Lệnh verify cần cùng cấu hình và khóa công khai đúng. Thử đổi một byte thông điệp, chữ ký hoặc khóa để xác minh trường hợp từ chối. Chữ ký đúng không tự bảo đảm giao dịch mới, quyền người ký hoặc sự thật của nội dung.
''','''
RSA-PSS|Lược đồ chữ ký RSA xác suất|Lược đồ ký RSA có hash và salt theo chuẩn.|Cùng thông điệp có hai chữ ký khác nhau cùng kiểm đúng.|Không dùng OAEP để ký.
Signature salt|Salt chữ ký|Giá trị đưa vào mã hóa thông điệp của lược đồ chữ ký như PSS.|Phân tích vì sao chữ ký PSS có thể thay đổi giữa hai lần.|Khác khóa bí mật và khác salt KDF dù cùng từ salt.
Prehash|Băm trước|Tính digest trước khi gọi API được thiết kế nhận digest.|Chọn đúng giữa API nhận thông điệp và API nhận hash.|Không băm thêm tùy ý rồi gọi API tự băm mà không đặc tả.
Serialization|Tuần tự hóa|Quy tắc biến cấu trúc dữ liệu thành chuỗi byte.|Hai bên phải ký/kiểm đúng cùng byte của hợp đồng.|Chuỗi hiển thị giống chưa chắc byte giống.
Signature verification failure|Kiểm chữ ký thất bại|Kết quả bằng chứng không hợp lệ với dữ liệu, khóa hoặc tham số được dùng.|Đổi một byte thông điệp rồi kiểm chữ ký cũ.|Không tự xác định chính xác nguyên nhân hay kẻ tấn công.
''','Hai máy ký cùng JSON bằng RSA-PSS cho chữ ký khác. Một máy chuẩn hóa JSON, máy kia dùng byte gốc, salt length khác; client kiểm chữ ký nhưng vẫn lặp thanh toán. Thiết kế quy trình đúng và bộ thử âm.',[
'PSS có ngẫu nhiên nên chữ ký khác có thể cùng hợp lệ; không so hai chữ ký để kết luận một máy sai.',
'Thống nhất serialization/byte, hash, MGF1, salt length và quy tắc prehash; chỉ chuẩn hóa theo đặc tả rõ.',
'Ràng buộc mã giao dịch, bên nhận, số tiền, phiên bản; chống replay bằng trạng thái đã dùng được cập nhật nguyên tử.',
'Thử sai byte, sai khóa, sai chữ ký, sai tham số, mã giao dịch lặp; kiểm phải từ chối và không làm thay đổi nghiệp vụ.'
])

add('protocols','public','SSH, TLS và xác thực giao dịch','Ghép công cụ đúng tầng và biết ranh giới của sự tin cậy.','source-6',[49,50,51,52,53,54,55,56,57,58],['Xác thực đối tác','Thiết lập bí mật phiên','Ràng buộc giao dịch'],'''
SSH có hai phía phải nhận diện
Public-key authentication trong SSH chứng minh client sở hữu khóa riêng tương ứng khóa được cho phép. authorized_keys ở server liệt kê các khóa công khai được cấp quyền cho tài khoản; không chứa khóa riêng client. known_hosts ở client lưu thông tin nhận diện khóa host để phát hiện thay đổi. Challenge–response cần thử thách mới và ràng buộc ngữ cảnh để tránh dùng lại bằng chứng. Đăng nhập bằng khóa không có nghĩa host bất kỳ đều đáng tin.

TLS bảo vệ phiên theo giao thức
TLS kết hợp thiết lập khóa, xác thực và mã hóa xác thực dữ liệu. HTTPS là HTTP qua TLS. Chứng chỉ cần kiểm tra chuỗi, tên máy chủ, thời hạn và chính sách thích hợp. Slide mô tả cả vận chuyển khóa RSA và ECDHE để minh họa; TLS 1.3 dùng các cơ chế thiết lập khóa và xác thực theo đặc tả riêng, không dùng RSA key transport. SSL là tên giao thức lịch sử, không dùng như từ đồng nghĩa chính xác của mọi phiên TLS hiện đại.

Chip và nội dung được ký
Trong mô hình thẻ chip của bài, thiết bị bảo vệ khóa riêng và cung cấp bằng chứng theo thử thách/giao dịch. Chữ ký phải ràng buộc nội dung quan trọng như số tiền, đơn vị tiền, bên nhận, thời điểm/nonce và ngữ cảnh phù hợp. Chứng minh thiết bị có khóa không tự chứng minh chủ thẻ chủ ý với một số tiền cụ thể. Tương tự, bảo vệ đường truyền chưa ngăn một tài khoản hợp lệ thao tác ngoài quyền: cần kiểm soát nghiệp vụ và dấu vết.
''','''
SSH|Secure Shell|Giao thức bảo vệ truy cập từ xa và xác thực theo cấu hình.|Client đăng nhập bằng khóa và kiểm tra khóa host.|Phải xét cả danh tính server và client.
authorized_keys|Danh sách khóa được phép|Tệp server chỉ định khóa công khai được chấp nhận cho tài khoản SSH.|Cấp quyền đăng nhập cho một khóa client.|Không sao chép khóa riêng client vào đây.
known_hosts|Danh sách khóa host đã biết|Dữ liệu client dùng ghi nhận và kiểm tra nhận diện host SSH.|Client phát hiện host key thay đổi so với lần đã biết.|Cần kiểm chứng thay đổi thay vì bỏ qua tự động.
Challenge–response|Thử thách–đáp ứng|Chứng minh bí mật qua phản hồi cho thử thách mới.|Server gửi dữ liệu mới để client tạo bằng chứng sở hữu khóa.|Thử thách lặp hoặc thiếu ràng buộc phiên có thể bị phát lại/chuyển tiếp.
TLS|Transport Layer Security|Giao thức bảo vệ truyền thông qua thiết lập khóa, xác thực và bảo vệ bản tin.|Thiết lập kênh có bảo vệ giữa trình duyệt và dịch vụ.|Không thay kiểm tra quyền ứng dụng.
HTTPS|HTTP qua TLS|Sử dụng HTTP bên trong kết nối được TLS bảo vệ.|Trình duyệt truy cập dịch vụ với kiểm chứng chứng chỉ và bảo vệ lưu lượng.|Biểu tượng khóa không chứng minh nội dung website trung thực.
SSL|Secure Sockets Layer|Họ giao thức tiền nhiệm lịch sử của TLS.|Đọc slide dùng từ TLS/SSL và xác định thuật ngữ lịch sử.|Không xem SSL cũ là lựa chọn triển khai mới.
Transaction binding|Ràng buộc giao dịch|Gắn bằng chứng xác thực với chính xác nội dung/ngữ cảnh giao dịch.|Chữ ký phải bao gồm số tiền và bên nhận chứ không chỉ chứng minh có thẻ.|Có bằng chứng sở hữu khóa chưa chứng minh chấp thuận mọi giao dịch.
''','Client SSH bỏ kiểm host, server đặt nhầm private key vào authorized_keys; website có TLS nhưng API bỏ quyền; thẻ ký nonce mà không ký số tiền. Phân tích mỗi lớp và thiết kế bằng chứng ràng buộc đúng.',[
'SSH cần kiểm host đúng và authorized_keys chỉ chứa khóa công khai client được cấp quyền; khóa riêng đã chép/lộ phải xử lý thay khóa theo phạm vi.',
'TLS bảo vệ kênh đến đối tác đã kiểm chứng, không cấp quyền cho mọi tài nguyên; API phải kiểm quyền trên từng yêu cầu.',
'Ký nonce chứng minh tham gia thử thách, không gắn số tiền/người nhận; cần ký ngữ cảnh, số tiền, đơn vị, bên nhận và định danh mới theo giao thức.',
'Thiết kế thử âm gồm host sai, tài khoản trái quyền, thay số tiền, phát lại nonce; không kết luận người dùng chủ ý chỉ từ việc thiết bị có khóa.'
])
