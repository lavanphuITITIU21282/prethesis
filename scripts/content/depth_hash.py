guide('hash-properties', [
(6, '''Cryptographic hash nhận một chuỗi byte hữu hạn và trả digest theo kích thước lược đồ. Tính xác định nghĩa là cùng byte và cùng thuật toán cho cùng digest, không phụ thuộc tên tệp. Một bit khác, newline hoặc encoding khác đều tạo đầu vào khác; không kiểm “cùng nội dung nhìn thấy” thay cho kiểm byte.

Vì miền đầu vào lớn hơn miền digest, Pigeonhole principle bảo đảm có collision về mặt tồn tại. Yêu cầu bảo mật là khó tìm các đầu vào phù hợp trong mô hình, không phải tuyệt đối không có hai đầu vào cùng digest. Hash không mang khóa và không có API giải mã để lấy lại thông điệp gốc duy nhất.''',
'Đọc 256 bit dưới ba biểu diễn',[
'SHA-256 trả 32 byte digest nhị phân; mỗi byte cần hai ký tự hex nên hexdigest có 64 ký tự.',
'Chuỗi 64 ký tự hex là biểu diễn, không làm mức an toàn thành 512 bit. Base64 lại có độ dài biểu diễn khác.',
'Hash của abc và abc kèm newline khác nhau vì có 3 byte so với 4 byte đầu vào, không phải vì hash mất tính xác định.'],
'Có vô hạn đầu vào mà chỉ 2^256 digest. Vì sao vẫn có thể dùng hash mật mã?',
'Vì yêu cầu là khó tính toán các bài toán tấn công liên quan, không đòi ánh xạ một-một. Phải xét thuật toán cụ thể, loại tấn công và số lượng dữ liệu, không chỉ nguyên lý đếm.'),
(6, '''Preimage: đã có y, tìm M sao cho H(M)=y. Second-preimage: đã có M1, tìm M2 khác M1 với cùng digest. Collision: được chọn cả M1 và M2 khác nhau. Ba bài toán khác về quyền chọn đầu vào; biết tấn công collision không tự có thuật toán đảo mọi digest.

Với hash lý tưởng n bit, mốc công việc tổng quát cho preimage xấp xỉ 2^n, còn collision cỡ 2^(n/2) do birthday. Với q giá trị độc lập gần đều, xác suất collision xấp xỉ 1−exp(−q(q−1)/2^(n+1)); xấp xỉ q(q−1)/2^(n+1) chỉ tốt khi xác suất còn nhỏ.''',
'Tính birthday cho digest đồ chơi 16 bit',[
'Miền digest có 65.536 giá trị, nên mốc birthday nằm ở vài trăm mẫu, không cần 65.536 mẫu để collision trở nên đáng kể.',
'Với q=300, số cặp là 44.850; số collision kỳ vọng xấp xỉ 44.850/65.536=0,684.',
'Xác suất có ít nhất một collision xấp xỉ 1−exp(−0,684)=49,6%; đừng nhầm kỳ vọng 0,684 với xác suất 68,4%.'],
'Tìm hai hợp đồng tùy chọn cùng hash khác gì thay một hợp đồng đã được ký sẵn?',
'Được chọn cả hai là collision; phải khớp một tài liệu cố định đã có là second-preimage. Khả năng thay đổi tiền tố/hậu tố và việc người ký chấp nhận byte nào quyết định mô hình thực tế.'),
(20, '''Avalanche effect mô tả sự thay đổi lớn ở đầu ra khi sửa nhỏ đầu vào theo tiêu chí cụ thể. Thấy một ví dụ khoảng n/2 bit khác là quan sát hữu ích, không phải chứng minh preimage/collision resistance. Một hàm cố ý yếu vẫn có thể làm một số ví dụ nhìn ngẫu nhiên.

Kiểm bit khác cần so cùng biểu diễn: đổi mỗi chữ hex không tương ứng đổi đúng một bit. Một nibble có 4 bit, nên phải XOR digest nhị phân hoặc đổi hex thành bit rồi đếm. Hai thông điệp ngẫu nhiên khác nhau cũng không buộc đúng 128 bit khác trong SHA-256; đó là biến ngẫu nhiên quanh kỳ vọng khi giả định thích hợp.''',
'Đếm khoảng cách digest đúng đơn vị',[
'Băm hai chuỗi chỉ khác một byte, giữ encoding và newline cố định.',
'XOR hai digest 32 byte rồi đếm bit 1 để đo Hamming distance; so số ký tự hex khác chỉ là phép đo khác.',
'Lặp nhiều đầu vào để quan sát phân bố, nhưng không đổi tên phép thử thống kê thành chứng minh an toàn của thuật toán.'],
'Hai digest SHA-256 chỉ khác 119 bit thay vì 128 có chứng minh thuật toán lỗi không?',
'Không. 128 là kỳ vọng trong mô hình độc lập/đều, không là yêu cầu mọi cặp. Cần tiêu chí thống kê và kiểm chức năng bằng test vector; một cặp không chứng minh hay bác bỏ an toàn.')
])
extra('hash-properties',0,'Pigeonhole principle','Nếu số đối tượng lớn hơn số ngăn thì có ít nhất một ngăn chứa nhiều đối tượng.','Miền thông điệp lớn hơn miền digest nên collision phải tồn tại.','Sự tồn tại không cho ngay thuật toán tìm collision hiệu quả.')

guide('hash-algorithms', [
(11, '''Các tên MD và SHA là họ/thuật toán khác nhau, không phải mức độ của cùng một phép đổi tên. MD5 có digest 128 bit, SHA-1 160 bit, SHA-256 256 bit và SHA-512 512 bit. Các điểm yếu collision của MD5/SHA-1 cần được phân biệt với bài toán preimage; không dùng việc “chưa đảo mọi hash” để biện hộ cho hệ cần chống collision.

SHA-224/SHA-256 thuộc SHA-2, cũng như SHA-384/SHA-512; SHA-3 dùng cấu trúc khác. Kích thước block đầu vào nội bộ khác kích thước digest: SHA-256 xử lý block 64 byte nhưng trả digest 32 byte. Tên thuật toán, kích thước digest và tham số phải được ghi đúng trong định dạng/giao thức.''',
'So cột digest với cột block',[
'MD5: digest 16 byte; SHA-1:20; SHA-256:32; SHA-512:64.',
'SHA-256 có block nội bộ 64 byte, SHA-512 có block 128 byte; đó không phải giới hạn kích thước thông điệp chỉ được băm một block.',
'Khi thấy digest 64 ký tự hex, chưa kết luận duy nhất SHA-256: cần định danh thuật toán, vì nhiều thuật toán có thể có cùng độ dài đầu ra.'],
'Thay nhãn MD5 thành SHA-256 trong metadata mà giữ nguyên code hash có sửa được điểm yếu không?',
'Không. Cần thay thuật toán thật và toàn bộ nơi tạo/kiểm, xem lại định dạng/độ dài và các dữ liệu đã có. Nhãn chỉ giúp diễn giải; nó không thay phép tính.'),
(13, '''Merkle–Damgård chia thông điệp đã padding thành block rồi cập nhật chaining state bằng compression function. Với các hash có cấu trúc phù hợp và digest bộc lộ đủ state, biết digest và độ dài có thể tiếp tục hash từ state đó. Đây là nền của length extension đối với cách dùng sai secret-prefix MAC, không phải giải mã phần bí mật.

Sponge chia trạng thái thành rate và capacity: absorb đưa dữ liệu vào rồi áp permutation; squeeze lấy đầu ra. Không lấy nguyên lập luận length extension của Merkle–Damgård áp cho mọi hash. Trong thực hành, dùng API và lược đồ chuẩn; việc hiểu cấu trúc giúp biết những phép ghép nào chưa có lời bảo đảm.''',
'Theo dấu một phép hash theo block',[
'Gọi state ban đầu là IV_hash; sau block M1 có h1=f(IV_hash,M1), sau M2 có h2=f(h1,M2). IV_hash không phải IV của CBC.',
'Padding có quy tắc và thường chứa độ dài trong họ Merkle–Damgård được xét; thay byte hoặc độ dài có thể đổi các block cuối.',
'Phân biệt compression function mật mã với nén ZIP: hàm cập nhật state không có mục tiêu khôi phục toàn bộ thông điệp từ digest.'],
'update(A); update(B) có thường tương đương H(H(A)||B) không?',
'Không. API hash tuần tự cập nhật trạng thái của cùng thông điệp nên tương đương H(A||B). Gọi digest rồi đưa digest vào một đối tượng hash mới là phép tính khác.'),
(16, '''Một quy trình đối chiếu hash cần thống nhất byte và định dạng manifest. GNU sha256sum thường in digest và tên tệp theo quy ước công cụ; openssl dgst mặc định in kiểu mô tả khác. Lệnh kiểm manifest cần đúng cú pháp đầu vào mà nó hỗ trợ; không suy hai dòng có cùng digest là tương thích hoàn toàn.

Trong Python, hashlib nhận bytes-like data. Với văn bản, chọn encode rõ ràng; với tệp, đọc binary theo chunk giúp không nạp toàn bộ vào RAM. digest() trả bytes, hexdigest() trả chuỗi hex. Không lẫn byte digest với byte ký tự biểu diễn hex khi truyền sang MAC/chữ ký/giao thức khác.''',
'Băm abc theo API chuẩn',[
"Tạo h=hashlib.sha256(), gọi h.update(b'abc'), lấy h.hexdigest(); không có newline tự thêm vào đầu vào.",
'Kết quả phải là ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad, dài 64 ký tự hex.',
'Thử update(b\'a\') rồi update(b\'bc\') trong cùng đối tượng để kiểm kết quả giống băm abc một lần.'],
'Hai máy hiển thị cùng chữ có dấu nhưng hash khác. Cần kiểm gì trước khi nghi thuật toán hash?',
'Kiểm byte thực tế, encoding, Unicode normalization, newline và cách đọc tệp text/binary. Hình chữ giống nhau không bảo đảm chuỗi byte giống nhau.')
])
extra('hash-algorithms',0,'Hash block size','Số byte mỗi block đầu vào được cấu trúc hash xử lý nội bộ.','SHA-256 có block 64 byte dù digest dài 32 byte.','Không nhầm với digest size hoặc giới hạn tệp được băm.')

guide('hash-apps', [
(21, '''Kiểm toàn vẹn tệp tải về có ba đối tượng: tệp, digest tham chiếu và nguồn xác thực digest. Nếu đối thủ thay được cả tệp và trang công bố checksum, so khớp chỉ chứng minh hai thứ đồng thuận. Chữ ký manifest hoặc kênh tham chiếu đã xác thực có thể giải quyết một phần niềm tin nguồn, tùy mô hình.

Hash không phát hiện ngữ nghĩa xấu: một phần mềm độc hại có thể có digest đúng với bản do kẻ xấu công bố. Với bản phát hành gồm nhiều tệp, manifest cần ràng buộc tên, đường dẫn/quy tắc chuẩn hóa, phiên bản và tập tệp cần có để tránh ghép các tệp hợp lệ ở các phiên bản khác nhau.''',
'Kiểm package.bin có căn cứ',[
'Lấy manifest từ nguồn đã xác thực theo mô hình và kiểm chữ ký nếu định dạng/phân phối có dùng.',
'Dùng đúng công cụ/định dạng để kiểm tệp hiện có; kiểm đúng tên, phiên bản và mã thoát.',
'Tách kết luận “đúng byte bản phát hành đã xác thực” khỏi kết luận “phần mềm không có lỗ hổng hoặc mã độc”.'],
'Tải tệp và MD5 từ cùng đường HTTP bị thay được. Digest khớp có loại trừ MITM không?',
'Không. Đối thủ có thể thay cả tệp và giá trị hash. Vấn đề nguồn tham chiếu tồn tại ngay cả nếu đổi MD5 sang SHA-256.'),
(22, '''Commitment cần Hiding để người xem chưa biết bí mật trước khi mở và Binding để người cam kết khó mở sang nội dung khác. H(n) với n chỉ từ 0 tới 9 có thể bị vét hết ngay cả khi hash rất mạnh. Salt/randomness bí mật trong giai đoạn commit có thể mở rộng miền đoán nếu tạo và dùng đúng.

Định dạng commit phải không nhập nhằng, chẳng hạn encode rõ game ID, người chơi, lựa chọn và nonce ngẫu nhiên. Khi reveal, công bố đúng dữ liệu để mọi người tính lại. Trusted timestamp có thể chứng minh một dấu thời gian/chứng cứ theo quy trình của bên được tin; nó không tự chứng minh ai là tác giả duy nhất hoặc nội dung thật.''',
'Sửa trò đoán số trong slide',[
'Mỗi bên chọn n và nonce ngẫu nhiên đủ bí mật, công bố H(encode(game_id,player_id,n,nonce)) trước hạn.',
'Sau khi tất cả đã commit, reveal n và nonce, kiểm hash theo cùng encoding và quy tắc xử lý người không reveal.',
'Nêu rõ giới hạn: đối thủ có thể từ chối reveal; commitment không tự giải quyết mọi vấn đề công bằng của trò chơi.'],
'Nếu nonce được công bố ngay lúc commit và n chỉ có 10 giá trị, Hiding còn được bảo đảm bằng nonce đó không?',
'Không chống vét miền nhỏ theo cách này: đối thủ thử cả 10 giá trị với nonce đã biết. Randomness phải được giữ cho giai đoạn reveal theo thiết kế commitment đang xét.'),
(23, '''Password verifier lưu dữ liệu đủ để kiểm mật khẩu mà không cần lưu bản rõ, nhưng dữ liệu bị lấy có thể cho phép Offline guessing. Password hashing/KDF cần work factor theo chính sách phù hợp; hash nhanh như SHA-256 trực tiếp không cố ý làm mỗi lần thử tốn công như password KDF.

Salt thường công khai và khác nhau giữa bản ghi, giúp tránh cùng mật khẩu có cùng verifier và giảm lợi ích của bảng tính sẵn dùng chung. Nó không chặn thử từng mật khẩu cho một bản ghi. Chuỗi $6$ trong ví dụ shadow là định dạng SHA-512-crypt, không phải chỉ sha512(password) dạng hex; cần đọc cả định danh lược đồ, tham số và salt.''',
'Đọc một bản ghi password theo tầng',[
'Tách định danh lược đồ, work factor/tham số, salt và verifier thay vì coi cả chuỗi là một hash thô.',
'Khi kiểm, dùng lược đồ/tham số của bản ghi để tính ứng viên và so theo API phù hợp.',
'Nếu cơ sở dữ liệu bị lấy, giả định đối thủ có thể đoán offline; rate limit đăng nhập online không áp trực tiếp lên máy của họ.'],
'Hai tài khoản cùng mật khẩu nhưng salt khác có loại trừ việc đối thủ đoán cùng một từ cho cả hai không?',
'Không. Đối thủ phải tính theo từng salt nhưng vẫn có thể thử cùng mật khẩu. Salt giảm tái sử dụng kết quả; độ mạnh mật khẩu và chi phí KDF vẫn quan trọng.')
])
extra('hash-apps',2,'Work factor','Tham số điều chỉnh lượng công việc cần để dẫn xuất/kiểm một ứng viên mật khẩu trong lược đồ.','Tăng chi phí mỗi lần đoán bằng tham số password KDF.','Không tạo thêm entropy cho một mật khẩu đã chọn từ miền nhỏ.')

guide('hmac', [
(26, '''MAC được tạo và kiểm bằng bí mật chung. Tag ràng buộc thông điệp theo lược đồ, key và định dạng, nhưng thông điệp vẫn có thể đọc được nếu không mã hóa. Cần định nghĩa byte nào thuộc thông điệp: bỏ sót trường quan trọng sẽ để trường đó ngoài lời bảo đảm.

Không tự gọi H(K||M) là HMAC. Một phép ghép trông hợp lý có thể lộ tính chất của cấu trúc hash, va chạm cách mã hóa trường hoặc cách sử dụng key. API MAC chuẩn giúp tránh tự thiết kế primitive, nhưng ứng dụng vẫn phải đưa đúng dữ liệu/ngữ cảnh và giữ key bí mật.''',
'Một tag cho đơn hàng',[
'M=encode(order_id,recipient,amount,currency,expiry,nonce), không chỉ amount.',
'Tạo/kiểm tag bằng key thuộc đúng miền sử dụng; không dùng public hash thay vì MAC khi cần bằng chứng nguồn từ người giữ key.',
'Sau kiểm tag, kiểm quyền, hạn và nonce; tag đúng của đơn hàng đã xử lý vẫn có thể là bản phát lại.'],
'Kẻ tấn công không sửa amount nhưng đổi recipient ở ngoài phần tính MAC. Tag có bắt được không?',
'Không nếu recipient không được ràng buộc qua dữ liệu MAC hoặc ngữ cảnh đã xác thực khác. Cần ký/MAC cấu trúc đầy đủ theo giao thức.'),
(28, '''Với secret-prefix MAC dựa trên hash có length extension phù hợp, đối thủ biết tag H(K||M) có thể tính tag cho K||M||glue_padding||T nếu đoán đúng độ dài tổng cần padding. Đối thủ không cần biết byte K; họ lợi dụng state và quy tắc tiếp tục hash.

Tấn công chỉ hữu ích khi ứng dụng chấp nhận thông điệp đã mở rộng và diễn giải nó theo cách có lợi. Glue padding có byte đặc biệt; định dạng/parser có thể ảnh hưởng khả năng khai thác. Đừng biến một thí nghiệm cho phép nối byte thành kết luận mọi API hay mọi hash đều chịu cùng tấn công.''',
'Tách điều biết và điều đoán',[
'Biết: M, tag và thuật toán. Chưa biết: K; có thể thử các ứng viên độ dài K trong một khoảng.',
'Tính padding cho độ dài K||M, nối phần T rồi tiếp tục trạng thái theo cấu trúc hash trong mô hình.',
'Kiểm xem thông điệp mở rộng có qua parser/logic ứng dụng không; sửa thiết kế bằng MAC chuẩn, không chỉ giấu độ dài key.'],
'Length extension có tìm ra key hoặc đảo hash không?',
'Không. Nó tính một tag mở rộng nhờ cấu trúc hash và độ dài, không khôi phục khóa bí mật hay bản rõ tổng quát từ digest. Đây là lý do phân biệt các loại bài toán.'),
(31, '''HMAC dùng hai lớp hash với key đã xử lý theo block size của hash. Với SHA-256, block là 64 byte: key dài hơn block được hash, sau đó điều chỉnh thành K0 theo quy tắc lược đồ. Công thức là H((K0⊕opad)||H((K0⊕ipad)||M)); ipad/opad là các mẫu byte xác định, không phải nonce ngẫu nhiên mỗi bản tin.

Khi kiểm tag, dùng phép so phù hợp để tránh lộ prefix qua thời gian; xử lý đúng kiểu bytes và độ dài theo giao thức. Tag truncation nếu được lược đồ/giao thức cho phép giảm không gian đoán tag, nên phải tính cả số lần thử và giới hạn. HMAC không tự cung cấp Confidentiality hay chống replay.''',
'Đọc hai vòng trong HMAC',[
'Chuẩn bị K0 theo block size; không nhầm block 64 byte của SHA-256 với digest 32 byte.',
'Tính inner hash từ K0⊕ipad và M, rồi dùng kết quả digest nhị phân trong outer hash với K0⊕opad.',
'Dùng API HMAC chuẩn và kiểm cả trường hợp thông điệp/khóa/tag sai. Không đưa chuỗi hex vào chỗ digest bytes nếu đặc tả không yêu cầu.'],
'Giữ 32 bit đầu của tag HMAC có mức chống đoán giống giữ 128 bit không?',
'Không. Với tag lý tưởng t bit, một lần đoán độc lập đúng có xác suất 2^(−t), nhiều lần thử làm tăng rủi ro. Độ dài tag phải theo giao thức và giới hạn truy vấn, không tùy ý cắt cho đẹp.')
])
extra('hmac',1,'Secret-prefix MAC','Cách thử tạo MAC bằng hash khóa bí mật nối trước thông điệp.','Thiết kế H(K||M) được phân tích về khả năng length extension.','Không đồng nghĩa HMAC và không nên tự chế làm lược đồ xác thực.')
extra('hmac',2,'Tag truncation','Giữ một phần tag theo độ dài được giao thức/lược đồ quy định.','Bên tạo và kiểm cùng dùng độ dài tag xác định trong định dạng.','Tag ngắn làm tăng xác suất đoán trúng và cần xét số lần thử.')

guide('blockchain', [
(35, '''Hash chain liên kết mỗi bản ghi với digest bản trước; sửa bản ghi làm đứt quan hệ đối với điểm neo mà người kiểm đã tin. Nếu đối thủ được thay cả chuỗi và điểm neo, họ có thể tính lại mọi hash. Vì vậy tính chống sửa của toàn hệ không đến từ phép nối hash một mình.

Blockchain kết hợp quy tắc định dạng, giao dịch, liên kết, chọn lịch sử và cơ chế đồng thuận. Cần tách “dữ liệu đã gắn hash”, “block có proof hợp lệ” và “block thuộc lịch sử được chấp nhận”. Mỗi mệnh đề cần một phép kiểm khác; không được lấy một hash hợp lệ làm thay toàn bộ xác thực giao dịch.''',
'Sửa khối giữa một chuỗi ba khối',[
'B0 có hash h0; B1 lưu h0 và dữ liệu D1; B2 lưu hash B1. Sửa D1 làm hash B1 đổi.',
'Nếu giữ B2 cũ, quan hệ hash bị đứt và người kiểm phát hiện. Nếu đối thủ tính lại B2, cần điểm neo/đồng thuận để nhận ra lịch sử thay thế.',
'Ghi rõ người kiểm tin hash nào từ trước và đối thủ có quyền tính lại/thay những phần nào.'],
'Một chuỗi hash nằm trong file mà cùng tài khoản sửa được toàn bộ. Có tự phát hiện mọi sửa đổi của tài khoản đó không?',
'Không nếu không có điểm neo hoặc bằng chứng ngoài miền bị sửa. Đối thủ có thể xây chuỗi mới nhất quán; phải phân tích mô hình tin cậy.'),
(36, '''Proof of work yêu cầu tìm đầu vào sao cho hash thỏa target, ví dụ nhỏ hơn một ngưỡng hoặc có một số bit đầu bằng 0 trong mô hình học. Một lần thử không có bảo đảm tiến gần đáp án; với phân bố lý tưởng và yêu cầu d bit 0, xác suất mỗi lần là 2^(−d), số thử kỳ vọng là 2^d.

Mining nonce là một trường được thay để tạo ứng viên; khi không gian một trường cạn, giao thức có thể cho phép thay những dữ liệu khác theo quy tắc. Fork là khi có nhiều nhánh ứng viên. Quy tắc đồng thuận/chọn nhánh mới quyết định lịch sử chấp nhận; một block có hash thỏa target vẫn có thể chứa giao dịch không hợp lệ.''',
'Ước lượng công việc không nhầm với đếm chắc chắn',[
'Với d=20 bit 0, kỳ vọng khoảng 1.048.576 thử; không phải thử đúng lần đó mới thành công.',
'Tăng d thêm 1 chia đôi xác suất mỗi thử, làm kỳ vọng gấp đôi theo mô hình.',
'Bên kiểm chỉ cần tính hash và kiểm target theo dữ liệu đúng định dạng, nhưng vẫn phải kiểm nội dung giao dịch và quy tắc chuỗi.'],
'Một block có proof of work hợp lệ có cho phép chi một khoản tiền không thuộc người ký không?',
'Không. PoW không thay quyền chi tiêu và xác thực giao dịch. Tính hợp lệ của block là tập nhiều điều kiện, không chỉ bài toán hash.'),
(44, '''Collision attack chọn hai đầu vào khác nhau có cùng digest; chosen-prefix collision còn cho phép bắt đầu từ các tiền tố đã chọn rồi tìm phần bù phù hợp theo khả năng thuật toán. Tác động tới chương trình/chứng chỉ/chữ ký phụ thuộc quyền chọn byte trước khi người tin cậy băm hoặc ký.

Trong thí nghiệm MD5, hai tệp kết thúc ở trạng thái băm/độ dài phù hợp có thể giữ quan hệ collision khi nối cùng hậu tố theo điều kiện cấu trúc. Không suy rằng mọi cặp thông điệp bất kỳ có cùng digest đều cho cùng hash dưới mọi cách nối/đệm hay mọi hash; cần nêu rõ điều kiện và thuật toán thí nghiệm.''',
'Diễn giải đúng thí nghiệm nối hậu tố',[
'Giữ out1.bin và out2.bin khác nhau, tính MD5 và so digest để xác nhận collision thực tế.',
'Nối cùng một suffix vào hai tệp theo điều kiện lab; tính lại MD5, đồng thời kiểm các byte/tổng độ dài liên quan.',
'Thử SHA-256 để phân biệt “cùng MD5” với “cùng mọi hash”. Không diễn giải collision đã chọn thành đảo digest của một tệp cố định.'],
'Người ký ký digest của một tệp do đối thủ chuẩn bị. Vì sao collision có thể nguy hiểm dù key ký không bị lộ?',
'Nếu đối thủ chuẩn bị được hai tệp đúng mô hình cùng hash, chữ ký trên digest tệp lành có thể kiểm khớp tệp độc hại. Vấn đề nằm ở ràng buộc hash và quyền chọn tài liệu, không nhất thiết ở việc lấy private key.')
])
extra('blockchain',1,'Target threshold','Ngưỡng mà giá trị hash ứng viên phải thỏa trong bài toán proof of work.','Kiểm hash nhỏ hơn target quy định của block.','Hash thỏa target không tự làm giao dịch bên trong hợp lệ.')
extra('blockchain',1,'Fork','Tình huống tồn tại nhiều nhánh lịch sử ứng viên từ một điểm chung.','Hai block cùng nối một block trước tạo hai nhánh cần quy tắc lựa chọn.','Liên kết hash không tự quyết định nhánh nào được mạng chấp nhận.')
