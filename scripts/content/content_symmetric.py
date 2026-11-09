# Executed by build_content.py with the shared authoring helpers.
add('caesar','symmetric','Caesar và cách đánh giá độ an toàn','Tự dịch bảng chữ cái, rồi thấy giới hạn của không gian khóa.','source-4',[3,4,5,6,7,8],['Chữ cái → số 0…25','C = (P + k) mod 26','26 ứng viên khóa'],'''
Phép dịch chỉ có 26 khả năng
Gán A=0,…,Z=25. Caesar dùng C=(P+k) mod 26 và P=(C−k) mod 26. Với k=3, CAT thành FDW. Dấu cách và dấu câu có thể giữ nguyên theo quy ước, làm lộ thêm cấu trúc. Tập khóa chỉ có 26 phép dịch, gồm cả phép không đổi. Có thể liệt kê hết rồi dùng ngôn ngữ để chọn. Ghép nhiều lần Caesar vẫn chỉ cho một phép dịch với tổng khóa modulo 26.

Hai cách tấn công
Brute force thử các khóa khả dĩ. Cryptanalysis tận dụng cấu trúc thuật toán, đặc điểm bản rõ hoặc cặp bản rõ–bản mã đã biết. Known-plaintext cho biết độ dịch Caesar từ một cặp chữ. Keyspace có 2^n giá trị khi khóa có n bit độc lập đồng đều; nhãn khóa n bit chưa chứng minh entropy thực tế nếu khóa sinh từ mật khẩu dễ đoán.

An toàn dưới giả định nào?
Computational security nghĩa là chi phí phá vượt nguồn lực hoặc thời gian có ích trong mô hình đã nêu. Unconditional security không dựa vào giới hạn tính toán đối thủ. Tăng độ dài khóa chỉ giúp khi thuật toán không có đường tắt và khóa được tạo đúng. Một thông điệp Caesar rất dài không làm 26 khóa trở nên khó vét cạn, ngược lại có thể cho thêm bằng chứng ngôn ngữ.
''','''
Caesar cipher|Mã Caesar|Mã thay thế dịch mỗi chữ theo một độ dịch modulo 26.|CAT với khóa 3 trở thành FDW.|Chỉ có 26 phép dịch nên không bảo vệ dữ liệu thật.
Cryptanalysis|Phân tích mật mã|Tận dụng cấu trúc thuật toán hoặc thông tin về bản rõ/bản mã để tấn công.|Dùng quy luật ngôn ngữ để suy ra khóa thay thế.|Không phải mọi tấn công đều cần thử hết khóa.
Brute-force attack|Vét cạn|Thử các khóa hoặc khả năng trong không gian tìm kiếm.|Liệt kê mọi độ dịch 0 đến 25.|Không gian nhỏ bị phá dù thông điệp dài.
Keyspace|Không gian khóa|Tập tất cả giá trị khóa có thể dùng trong hệ được xét.|Một khóa n bit đồng đều có 2 mũ n giá trị.|Mật khẩu yếu làm không gian hiệu dụng nhỏ hơn nhiều.
Known-plaintext attack|Tấn công biết bản rõ|Mô hình đối thủ có một số cặp bản rõ–bản mã.|Một tiêu đề mẫu đã biết giúp suy ra độ dịch.|Phải xét thông tin đối thủ có, không chỉ bản mã.
Computational security|An toàn tính toán|Chi phí phá vượt nguồn lực hoặc thời gian có ích trong giả định cụ thể.|Chi phí tìm khóa được so với vòng đời dữ liệu.|Không bảo đảm tuyệt đối trước mọi năng lực tương lai.
Unconditional security|An toàn vô điều kiện|An toàn không phụ thuộc giới hạn tính toán đối thủ trong mô hình.|Bí mật được bảo vệ cả trước đối thủ tính toán vô hạn.|Chỉ đúng khi mọi điều kiện của mô hình được giữ.
''','Hệ ghép ba lần Caesar với khóa độc lập quảng cáo 26^3 khóa. Chứng minh số biến đổi thực sự, tấn công khi biết một cặp chữ, tính số thử trung bình và so với tăng khóa AES.',[
'Ba phép dịch tương đương k=(k1+k2+k3) mod 26, chỉ 26 biến đổi phân biệt; số bộ khóa khác số phép biến đổi.',
'Một cặp P,C cho k=(C−P) mod 26; không suy ra duy nhất ba khóa thành phần.',
'Trung bình 13,5 thử trong thứ tự cố định nếu 26 khóa đồng đều và có cách nhận biết đúng; nêu rõ giả định.',
'AES không rút gọn như Caesar bởi lập luận này; tăng khóa chỉ có ý nghĩa khi cấu trúc, ngẫu nhiên và triển khai đúng.'
])

add('substitution','symmetric','Thay thế đơn bảng và dấu vết ngôn ngữ','Từ 26! khóa đến cách nhận ra mẫu chữ lặp.','source-4',[9,11,12,13,15,16,17,18,20,21,24,25,26,27,29],['Ánh xạ cố định','Tần suất · Cặp · Bộ ba','Đoán → Kiểm tra → Sửa'],'''
Nhiều khóa vẫn có thể lộ cấu trúc
Monoalphabetic substitution dùng một hoán vị cố định: mỗi chữ luôn được thay cùng một chữ. Có 26! hoán vị, nhưng vẫn giữ mẫu lặp. Frequency analysis đo tần suất ký tự và mẫu từ. Bigram là cặp liên tiếp, trigram là bộ ba, n-gram là chuỗi n phần tử. Mẫu phổ biến của ngôn ngữ là giả thuyết cần kiểm tra, không phải luật chắc chắn, đặc biệt khi văn bản ngắn.

Từ phỏng đoán tới bằng chứng
Làm sạch dữ liệu giúp đếm nhưng có thể làm mất chữ hoa, dấu câu hoặc khoảng trắng. Thử ánh xạ, kiểm tra mọi vị trí, giữ bảng giả thuyết và sửa nếu mâu thuẫn. Một bộ ba thường gặp có thể là THE, nhưng cần kiểm tra những từ bao quanh. Một từ khớp chưa đủ chứng minh cả khóa đúng. Dùng lệnh tr để thay thử không làm suy đoán trở thành kết luận.

Các cách thay đổi cấu trúc
Polyalphabetic substitution dùng nhiều bảng; Vigenère dùng chuỗi độ dịch, thường theo khóa lặp. Playfair mã hóa cặp chữ. Hill dùng ma trận trên khối trong số học modulo và cần ma trận khả nghịch. Transposition đổi vị trí thay vì giá trị ký tự, như rail fence. Các mã cổ điển này giúp hiểu nguyên lý nhưng không thay thế mật mã hiện đại.
''','''
Monoalphabetic substitution|Thay thế đơn bảng|Ánh xạ cố định mỗi chữ bản rõ sang một chữ bản mã.|Mọi chữ a đều thành cùng ký tự trong toàn văn.|26! khóa không xóa mẫu tần suất.
Frequency analysis|Phân tích tần suất|Khai thác phân bố ký tự và mẫu lặp để suy bản rõ/khóa.|Đếm ký tự rồi kiểm tra giả thuyết ngôn ngữ.|Văn bản ngắn có thể lệch tần suất trung bình.
Bigram|Bộ hai|Hai phần tử liên tiếp được xét như một mẫu.|Đếm TH và HE trong văn bản tiếng Anh.|Cặp tần suất cao không xác định duy nhất ánh xạ.
Trigram|Bộ ba|Ba phần tử liên tiếp được xét như một mẫu.|Thử một mẫu ba ký tự có tương ứng THE không.|Cần kiểm chứng trên nhiều vị trí.
N-gram|Mẫu n phần tử|Chuỗi n phần tử liên tiếp để phân tích cấu trúc.|Tổng quát hóa cặp và bộ ba thành độ dài n.|Phải định rõ phần tử là ký tự, byte hay từ.
Polyalphabetic substitution|Thay thế đa bảng|Nhiều bảng thay thế theo vị trí hoặc quy luật khóa.|Cùng chữ bản rõ thành ký tự khác khi vị trí đổi.|Khóa lặp có thể để lộ chu kỳ.
Vigenère cipher|Mã Vigenère|Mã dịch theo chuỗi khóa chữ thường lặp lại.|Dịch vị trí theo độ dịch của một từ khóa lặp.|Không tương đương one-time pad.
Playfair cipher|Mã Playfair|Mã cổ điển biến đổi từng cặp chữ qua bảng khóa.|Xử lý hai ký tự mỗi bước thay cho từng chữ.|Vẫn có thể phân tích cấu trúc.
Hill cipher|Mã Hill|Mã cổ điển dùng ma trận trên khối trong số học modulo.|Khối chữ được nhân ma trận khóa khả nghịch modulo 26.|Ma trận không khả nghịch không giải mã duy nhất.
Transposition|Hoán vị vị trí|Đổi thứ tự phần tử mà không thay giá trị.|Rail fence sắp xếp lại vị trí các chữ.|Giữ nguyên số lần xuất hiện mỗi chữ.
''','Bản mã 80 ký tự có mẫu lặp. Một người khẳng định ký tự nhiều nhất chắc chắn là E. Phản biện, lập quy trình kiểm chứng; phân biệt hoán vị với thay thế và tìm điều kiện khả nghịch của Hill modulo 26.',[
'80 ký tự có sai lệch lấy mẫu; phổ biến nhất không buộc là E. Không gian khóa lớn không chứng minh kháng phân tích cấu trúc.',
'Đo phân bố, n-gram, mẫu từ; giữ giả thuyết cạnh tranh và kiểm tra nhất quán trên nhiều vị trí.',
'Đơn bảng đổi nhãn ký tự nhưng giữ mẫu lặp; hoán vị giữ histogram và đổi vị trí. Xét khả năng kết hợp.',
'Ma trận Hill cần gcd(định thức,26)=1 để khả nghịch; nếu không có thể nhiều bản rõ chung ảnh hoặc không giải ngược được.'
])

add('otp','symmetric','XOR và điều kiện của one-time pad','Tính theo từng bit và thấy hậu quả của tái dùng dòng khóa.','source-4',[28,29],['M ⊕ K = C','Khóa ngẫu nhiên · dài đủ','Chỉ dùng một lần'],'''
Phép XOR theo từng bit
XOR cho 1 khi hai bit khác nhau: 0⊕0=0, 0⊕1=1, 1⊕0=1, 1⊕1=0. Vì X⊕K⊕K=X nên mã hóa và giải mã có thể cùng dùng XOR. Với M=1010, K=0110 thì C=1100. Phép toán tự nó không tạo an toàn: nếu K=0000 thì bản mã chính là bản rõ. Chất lượng và cách sử dụng khóa quyết định lời bảo đảm.

Perfect secrecy có đủ điều kiện
One-time pad cần khóa ngẫu nhiên thật, đồng đều, độc lập, dài ít nhất bằng thông điệp được mã hóa, bí mật và chỉ dùng một lần. Khi đó bản mã không thay đổi phân bố xác suất của bản rõ trong mô hình. Một chuỗi từ bộ sinh giả ngẫu nhiên với seed ngắn không có bảo đảm vô điều kiện tương đương. Phân phối và cất giữ lượng khóa dài là trở ngại thực tế.

Hai lỗi cần tách biệt
Nếu C1=M1⊕K và C2=M2⊕K thì C1⊕C2=M1⊕M2. Biết M1 sẽ suy được K và M2 trong đoạn tái dùng. Ngoài ra, đảo bit bản mã sẽ đảo bit bản rõ tương ứng kể cả khi khóa dùng một lần. Perfect secrecy nói về bí mật, không tự cung cấp toàn vẹn. Phải thêm cơ chế xác thực phù hợp khi đối thủ có thể sửa thông điệp.
''','''
XOR|Hoặc loại trừ|Phép bit trả 1 khi hai bit khác nhau.|Đảo phép M XOR K bằng XOR lại K.|Không tự tạo an toàn nếu khóa sai.
One-time pad|Mã khóa một lần|XOR với khóa bí mật ngẫu nhiên đều, độc lập, đủ dài và không tái dùng.|Mã hóa bằng chuỗi ngẫu nhiên thật dài bằng thông điệp.|Thiếu một điều kiện có thể mất bảo đảm hoàn hảo.
Perfect secrecy|Bí mật hoàn hảo|Bản mã không làm thay đổi phân bố xác suất bản rõ.|Đối thủ vô hạn tính toán không có thêm thông tin từ OTP đúng.|Không cung cấp xác thực/toàn vẹn.
Keystream|Dòng khóa|Chuỗi bit dùng kết hợp với dữ liệu trong cơ chế dòng.|Thông điệp XOR với chuỗi sinh theo khóa và tham số.|Tái dùng làm lộ quan hệ bản rõ.
Key reuse|Tái dùng khóa hoặc dòng khóa|Dùng lại bí mật ở phạm vi mà lược đồ đòi duy nhất.|Hai bản OTP dùng cùng chuỗi khóa.|Phải xét yêu cầu của từng lược đồ cụ thể.
Entropy|Lượng bất định|Thước đo độ không chắc chắn theo phân bố của biến ngẫu nhiên.|Chuỗi dài nhưng rất dễ đoán chứa ít bất định.|Độ dài byte chưa bằng lượng bất định.
''','C1=11001010, C2=10110101 dùng cùng dòng khóa; M1=01100001. Tìm K, M2 và quan hệ bản mã. Đảo bit cuối M2 mà không biết K; đánh giá bí mật và toàn vẹn riêng.',[
'K=C1 XOR M1=10101011; M2=C2 XOR K=00011110.',
'C1 XOR C2=M1 XOR M2=01111111 vì K XOR K=0; biết một bản rõ đọc được bản kia trong đoạn trùng.',
'C2 XOR 00000001=10110100; bản rõ thành 00011111 mà không cần biết K.',
'Tái dùng phá bí mật; dễ sửa bit làm thiếu toàn vẹn cả khi khóa dùng một lần. Cần xác thực và vòng đời khóa đúng.'
])

add('aes','symmetric','DES, AES và hai loại kích thước','Đừng nhầm độ dài khóa với kích thước khối.','source-4',[30,31,32,33,34,35,36],['Khóa 128 / 192 / 256','AES: khối 128 bit','Mode xử lý nhiều khối'],'''
Thuật toán cơ sở và mode
Block cipher biến đổi khối cố định theo khóa; dữ liệu dài cần mode of operation. Stream cipher sinh dòng khóa để kết hợp dữ liệu theo chuỗi. Một mode như CTR có thể dùng block cipher để hoạt động giống cơ chế dòng. Vì vậy AES là thuật toán khối, còn AES-CTR là cách dùng nó để xử lý thông điệp. Cần mô tả cả thuật toán, mode và tham số.

Các con số dễ đọc sai
DES có khóa hiệu dụng 56 bit và khối 64 bit, là thuật toán lịch sử. Triple-DES áp DES nhiều lần; ba khóa có độ dài danh nghĩa 168 bit nhưng không đạt mức an toàn đơn giản bằng 168 bit do cấu trúc và các tấn công như meet-in-the-middle. AES có khóa 128,192,256 bit; khối luôn 128 bit, tương đương 16 byte. aes-256-cbc nghĩa là khóa 256 bit, mode CBC.

Số bit chưa đủ cho kết luận
AES-256 sinh khóa từ mật khẩu sáu chữ số vẫn chỉ có tối đa một triệu mật khẩu để thử nếu phân bố đều. Hash thành 256 bit không tăng entropy đầu vào. Khóa công khai và khóa đối xứng không so cùng số bit vì bài toán tấn công khác nhau. Còn phải xét IV/nonce, xác thực, vòng đời khóa và lỗi triển khai trước khi kết luận an toàn.
''','''
Block cipher|Mật mã khối|Phép biến đổi có khóa trên khối cố định.|AES cần mode để xử lý tập tin dài.|Không tự đặc tả toàn bộ định dạng mã hóa.
Stream cipher|Mật mã dòng|Cơ chế kết hợp dữ liệu với dòng khóa theo chuỗi.|Xử lý dữ liệu dần mà không chờ đủ khối bản rõ.|Phải tránh tái dùng dòng khóa.
DES|Chuẩn DES|Mật mã khối lịch sử, khối 64 bit, khóa hiệu dụng 56 bit.|Phân tích giới hạn khóa 56 bit.|Khối 64 bit không có nghĩa khóa 64 bit hiệu dụng.
Triple-DES|DES ba lần|Cấu trúc áp dụng DES nhiều lần với khóa thành phần.|Xét ba khóa 56 bit trong lược đồ cũ.|168 bit danh nghĩa không bằng an toàn 168 bit.
AES|Chuẩn AES|Mật mã khối 128 bit với khóa 128,192 hoặc 256 bit.|Dùng khóa 256 bit nhưng chia dữ liệu thành khối 16 byte.|Khối không tăng theo cỡ khóa.
Block size|Kích thước khối|Số bit của khối được thuật toán cơ sở xử lý.|Cả ba cỡ khóa AES đều xử lý khối 128 bit.|Khác với độ dài khóa.
Key size|Độ dài khóa|Số bit biểu diễn khóa theo tham số thuật toán.|AES-128 và AES-256 khác số bit khóa.|Không tự đo chất lượng ngẫu nhiên của khóa.
Mode of operation|Chế độ vận hành|Quy tắc dùng cipher khối cho chuỗi dữ liệu.|Chọn CBC hay CTR cho thông điệp nhiều khối.|Bảo vệ bí mật chưa chắc có xác thực.
''','Thiết kế chọn AES-256 vì “khối 256 bit”, Triple-DES vì “an toàn 168 bit” và SHA-256(mật khẩu 6 chữ số) làm khóa. Sửa ba lập luận, tính không gian mật khẩu và liệt kê tham số còn thiếu.',[
'AES luôn có khối 128 bit; khóa 256 bit khác kích thước khối.',
'Triple-DES danh nghĩa 168 bit không suy ra mức an toàn đó; cần xét cấu trúc/tấn công thay vì đếm đơn giản.',
'Mật khẩu có tối đa 10^6 khả năng, xấp xỉ 19,93 bit nếu đều; băm không tăng entropy.',
'Cần KDF phù hợp, salt, mode, IV/nonce, xác thực và quản lý khóa; thuật toán tốt không bù được cách dùng sai.'
])

add('cbc','symmetric','ECB, CBC, IV và padding','Hiểu vì sao bản mã vẫn có thể lộ hình ảnh hoặc bị sửa bit.','source-4',[37,39,40,41,42],['ECB: giống → giống','CBC: trộn khối trước','IV + Padding + Xác thực'],'''
ECB giữ quan hệ bằng nhau
ECB dùng Ci=E_K(Pi) độc lập cho từng khối. Hai khối bản rõ giống dưới cùng khóa cho bản mã giống, nên ảnh có vùng lặp có thể giữ hình dáng dù không đọc được từng pixel. Đổi khóa giữa tập tin không sửa mẫu bên trong một tập tin. Ví dụ BMP trong slide giữ header để trình xem mở được ảnh mã hóa; đây là minh họa, không là một định dạng mã hóa tiêu chuẩn.

CBC liên kết khối
Đặt C0=IV: Ci=E_K(Pi⊕C(i−1)), Pi=D_K(Ci)⊕C(i−1). IV CBC phải phù hợp và không dự đoán trước trong mô hình thông thường. IV có thể công khai nhưng cần bảo vệ khỏi sửa đổi cùng thông điệp xác thực. Đổi một bit IV làm đổi bit tương ứng P1. CBC tự nó không phát hiện giả mạo; sự phụ thuộc khối không thay thế xác thực.

Đệm và kênh báo lỗi
PKCS#7 thêm n byte có giá trị n để đủ khối. Dữ liệu đã đủ khối vẫn thêm một khối: với AES và 32 byte đầu vào, thêm 16 byte 0x10. Padding oracle là phản hồi tiết lộ đệm hợp lệ hay không, có thể giúp đối thủ suy bản rõ. Đồng nhất thông báo lỗi chưa chắc loại bỏ kênh thời gian. Cần thiết kế xác thực phù hợp trước khi dùng dữ liệu giải mã không tin cậy.
''','''
ECB|Electronic Codebook|Mode mã hóa độc lập và giữ quan hệ khối giống nhau dưới cùng khóa.|Ảnh mã hóa còn các mảng lặp.|Không phù hợp che cấu trúc nhiều khối.
CBC|Cipher Block Chaining|XOR bản rõ với bản mã trước rồi mã hóa, bắt đầu bằng IV.|Giải thích Ci=E_K(Pi XOR C trước).|Không tự chống sửa bit.
IV|Vector khởi tạo|Giá trị khởi động mode với yêu cầu cụ thể theo mode.|CBC cần điểm bắt đầu phù hợp giữa các lần mã hóa.|Công khai không có nghĩa được sửa tùy ý; quy tắc khác theo mode.
Padding|Phần đệm|Dữ liệu thêm để đáp ứng kích thước hoặc định dạng yêu cầu.|Thông điệp CBC thiếu vài byte để đủ khối.|Không phải cơ chế xác thực.
PKCS#7|Đệm PKCS#7|Thêm n byte giá trị n, kể cả nguyên khối khi đã đủ.|32 byte đầu vào AES-CBC cần thêm 16 byte 0x10.|Không bỏ thêm đệm khi dữ liệu đủ khối.
Padding oracle|Kênh báo tính hợp lệ đệm|Phản hồi lộ padding hợp lệ và có thể bị dùng suy thông tin.|API phân biệt lỗi đệm với lỗi khác trên bản mã bị sửa.|Phải xét cả thông báo và thời gian.
''','Token CBC có role=user ở P1; IV không được MAC, API phân biệt lỗi đệm, dữ liệu dài 32 byte. Tính đệm, tác động sửa IV/C1 và thiết kế thứ tự xác thực–giải mã.',[
'AES khối 16 byte: thêm 16 byte 0x10, thành 48 byte trước mã hóa.',
'IV XOR Δ làm P1 XOR Δ. Sửa C1 làm P1 thay khó dự đoán và P2 đổi bit tương ứng; các khối sau không đổi theo CBC.',
'IV thiếu xác thực cho phép sửa bản rõ đầu; phản hồi đệm tạo oracle. Cần bảo vệ cả IV, bản mã và metadata.',
'Dùng cấu trúc mã hóa xác thực phù hợp; với encrypt-then-MAC, kiểm MAC trước giải mã/xử lý, không rò rỉ lỗi hoặc thời gian.'
])

add('ctr','symmetric','CFB, OFB và CTR: theo dấu dòng khóa','So sánh phản hồi, tính song song và quy tắc nonce.','source-4',[43,44,45],['Khóa + Trạng thái','Sinh dòng khóa S','C = P ⊕ S'],'''
Ba cách tạo dòng khóa
CFB mã hóa trạng thái, XOR đầu ra với bản rõ rồi phản hồi bản mã; có các biến thể kích thước đoạn. OFB phản hồi đầu ra cipher để tạo dòng khóa, độc lập với bản rõ. CTR mã hóa các counter block: Si=E_K(counter_i), Ci=Pi⊕Si. Giải mã CTR dùng lại cùng dòng khóa và XOR. Biết chính xác đầu vào phản hồi giúp phân tích khác biệt về lỗi và đồng bộ.

Phụ thuộc và tính song song
CTR tính độc lập dòng khóa từng vị trí nên có thể song song và truy cập ngẫu nhiên. CBC mã hóa phải chờ bản mã trước; giải mã có thể tính D_K(Ci) độc lập khi đã có khối cần XOR. Đây là phụ thuộc dữ liệu, không là hệ số tốc độ cố định trên mọi máy. CFB cần nêu kích thước đoạn khi nói lỗi lan truyền; OFB cần giữ đồng bộ trạng thái.

Không được tạo trùng đầu vào
CTR yêu cầu mọi counter block dưới cùng khóa không lặp. Thường nonce phân biệt thông điệp và counter phân biệt khối; phải xét tràn và nhiều thiết bị cùng khóa. Nonce ngẫu nhiên không đồng nghĩa chắc chắn không va chạm. CFB/OFB/CTR được mô tả ở đây không xác thực. AEAD kết hợp bí mật và xác thực, có thể bảo vệ metadata công khai gọi là AAD; vẫn cần tuân thủ quy tắc nonce và chống phát lại ở giao thức.
''','''
CFB|Cipher Feedback|Mode phản hồi bản mã vào trạng thái để tạo chuỗi kết hợp dữ liệu.|Bản mã ảnh hưởng trạng thái tiếp theo.|Cần nêu kích thước đoạn khi phân tích lỗi.
OFB|Output Feedback|Mode phản hồi đầu ra cipher để sinh dòng khóa.|Trạng thái tiếp theo phụ thuộc đầu ra trước, không phụ thuộc bản mã.|Lặp khởi tạo dưới cùng khóa có thể lặp dòng khóa.
CTR|Counter mode|Mã hóa counter block để tạo dòng khóa.|Tính dòng khóa cho một khối bất kỳ độc lập.|Counter block dưới cùng khóa phải duy nhất.
Nonce|Giá trị một lần trong phạm vi quy định|Giá trị phân biệt lần dùng theo yêu cầu lược đồ, thường công khai.|Nhiều thiết bị cùng khóa cần giá trị không trùng.|Ngẫu nhiên không bảo đảm tuyệt đối không va chạm.
Counter|Bộ đếm|Phần trạng thái tăng để phân biệt khối.|Các khối CTR tăng chỉ số và tránh tràn.|Phải kiểm toàn counter block chứ không riêng nonce.
AEAD|Mã hóa xác thực có dữ liệu liên kết|Cơ chế bảo vệ bí mật payload và xác thực metadata liên kết.|Che payload nhưng bảo vệ số phiên công khai.|Không miễn quy tắc khóa/nonce hay tự chặn replay.
AAD|Dữ liệu liên kết xác thực|Metadata được xác thực nhưng không mã hóa trong AEAD.|Số thứ tự công khai cần chống sửa đổi.|Xác thực không có nghĩa giữ bí mật.
''','10 thiết bị chung khóa CTR bắt đầu nonce=0 sau reboot; counter 16 bit, mỗi phiên 70.000 khối. Phân tích hai nguồn trùng, sửa bit và thiết kế chuyển AEAD có chống replay.',[
'Trùng nonce giữa thiết bị/sau reboot tạo dòng khóa lặp; counter 16 bit chỉ có 65.536 giá trị nên tràn trước 70.000 khối.',
'Dòng khóa trùng cho C1 XOR C2=P1 XOR P2; sửa bit bản mã CTR đổi bit bản rõ khi thiếu xác thực.',
'Phân tách miền khóa/thiết bị, cấp nonce duy nhất có trạng thái bền qua reboot, chặn trước tràn; có giới hạn dữ liệu và đổi khóa.',
'AEAD xác thực AAD và tag trước dùng bản rõ; thêm số thứ tự/trạng thái chống replay; chọn lược đồ và tuân thủ nonce riêng.'
])

add('shell','symmetric','Đọc lệnh theo ngữ cảnh','Biết lệnh nhận gì, làm gì và ghi đi đâu trước khi chạy.','source-4',[11,12,13,14,15,16,38,39],['stdin / Tệp vào','Lệnh + Tham số','stdout / Tệp ra'],'''
Lệnh là chuỗi biến đổi dữ liệu
Trong shell POSIX, stdin là đầu vào chuẩn, stdout là kết quả chuẩn, stderr là thông báo lỗi. Dấu < lấy tệp vào stdin; > ghi stdout vào tệp và có thể ghi đè; >> nối thêm; | nối stdout lệnh trước với stdin lệnh sau. Shell xử lý các ký hiệu này, không phải tr. Ví dụ tr/head/tail dùng Bash trên Linux hoặc WSL; không mặc định chạy cùng cách trong PowerShell.

Đọc tr và dấu nháy
tr '[:upper:]' '[:lower:]' đổi chữ hoa sang thường theo locale. tr -cd 'a-z\\n ' giữ tập ký tự được nêu: -c lấy phần bù và -d xóa. Cách lọc ASCII này có thể làm mất chữ tiếng Việt. Dấu nháy giữ đối số khỏi bị shell tách hoặc mở rộng ký tự mẫu. tr ánh xạ từng ký tự theo vị trí, không thay cả từ. Không chuyển hướng đầu vào và đầu ra cùng một tệp.

Đọc ví dụ OpenSSL có giới hạn
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 200000 -in plain.txt -out plain.enc là bài thực hành CBC dựa trên mật khẩu, được hỏi tương tác. PBKDF2 dẫn xuất khóa; salt không phải IV; số vòng không tạo entropy mới. enc không cung cấp xác thực dữ liệu. Web giải thích từng token trong lệnh và đặt câu hỏi tình huống; không thực thi shell trên máy chủ. Dùng tab “Cú pháp” để đọc kết quả và sai lầm thường gặp.
''','''
stdin|Luồng vào chuẩn|Luồng mặc định để chương trình đọc dữ liệu.|Dấu < đưa tệp vào đầu đọc của tr.|Không phải mọi chương trình tự đọc luồng này.
stdout|Luồng ra chuẩn|Luồng mặc định chứa kết quả thông thường.|Dấu > đưa kết quả xử lý vào tệp.|Thông báo lỗi có thể ở luồng khác.
stderr|Luồng lỗi chuẩn|Luồng tách biệt cho lỗi và chẩn đoán.|Lỗi vẫn hiện dù stdout chuyển sang tệp.|Pipe thông thường không tự bao gồm stderr.
Pipe|Đường ống shell|Nối stdout lệnh trước vào stdin lệnh sau.|printf gửi byte trực tiếp cho sha256sum qua dấu dọc.|Không phải cơ chế bảo vệ bí mật.
Redirection|Chuyển hướng luồng|Shell đổi nơi đọc/ghi qua ký hiệu như < hoặc >.|Đọc từ tệp A rồi ghi ra tệp B.|Dấu > có thể cắt rỗng tệp đích trước khi chạy lệnh.
PBKDF2|Dẫn xuất khóa từ mật khẩu|Dùng mật khẩu, salt và số vòng để dẫn xuất khóa.|enc cần chuyển mật khẩu thành khóa/IV theo cấu hình.|Không phải mode và không tăng entropy mật khẩu.
Salt|Muối dẫn xuất|Giá trị không bí mật phân biệt lần dẫn xuất.|Hai lần dẫn xuất cùng mật khẩu có muối khác.|Không thay nonce hay IV.
Locale|Môi trường ngôn ngữ|Cấu hình chi phối diễn giải và phân loại ký tự.|Lớp ký tự tr có thể phụ thuộc môi trường.|a-z không bao phủ chữ tiếng Việt.
''','Phân tích tr -cd \'a-z\\n \' < raw.txt > raw.txt. Dự đoán ghi đè/mất Unicode, thiết kế pipeline kiểm chứng được và giải thích vì sao -pbkdf2 không biến CBC thành AEAD.',[
'tr xử lý ký tự; -c lấy phần bù, -d xóa; tập cho phép a-z, newline, space; < và > là chuyển hướng do shell.',
'Shell mở/cắt tệp đầu ra trước nên raw.txt có thể rỗng trước đọc; lọc ASCII làm mất chữ ngoài tập.',
'Ghi tệp mới, giữ bản gốc và kiểm tra mẫu/số dòng; chọn công cụ Unicode theo mục tiêu làm sạch.',
'PBKDF2 dẫn xuất khóa, không tạo tag; CBC vẫn thiếu xác thực nếu không có cơ chế bổ sung đúng.'
])
