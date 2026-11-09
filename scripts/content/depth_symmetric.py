guide('caesar', [
(7, '''Quy ước A=0,…,Z=25 là một phần của thuật toán; đổi quy ước mà không đổi công thức sẽ cho kết quả khác. Khi cộng khóa vượt 25, giảm modulo 26 để quay vòng bảng chữ cái. Giải mã cần phép trừ cùng khóa và chuẩn hóa phần dư âm, chẳng hạn −1 mod 26 được biểu diễn là 25.

Độ dài thông điệp không tăng số phép dịch. Nếu dùng nhiều khóa liên tiếp, C=P+k1+k2+… mod 26 nên mọi tổ hợp vẫn rút về một độ dịch. Đây là ví dụ cho thấy số cách chọn tham số không luôn bằng số biến đổi khác nhau mà hệ tạo ra.''',
'Tự tính CAT với k=3 rồi đảo lại',[
'C=2 -> 5=F; A=0 -> 3=D; T=19 -> 22=W, nên CAT thành FDW.',
'Giải F: (5−3) mod 26=2=C. Với A và k=3, dùng (0−3) mod 26=23=X.',
'Hai lần dịch k1=20,k2=9 tương đương 29 mod 26=3; kết quả cuối vẫn FDW.'],
'Ba lần Caesar có 26³ bộ khóa. Có bao nhiêu phép biến đổi khác nhau và vì sao?',
'Chỉ 26 phép dịch vì chỉ tổng khóa modulo 26 quyết định kết quả. Nhiều bộ khóa cho cùng tổng; không được lấy 26³ làm số phép thử cần thiết.'),
(8, '''Brute force cần hai yếu tố: tập ứng viên và cách nhận biết ứng viên đúng. Với Caesar, thử 26 khóa rất dễ nhưng văn bản quá ngắn có thể còn nhiều bản rõ hợp ngôn ngữ. Known-plaintext có một cặp ký tự đúng vị trí cho ngay độ dịch, không cần vét hết.

Ciphertext-only attack chỉ có bản mã; Known-plaintext có cặp bản rõ–bản mã; Chosen-plaintext cho đối thủ chọn bản rõ và xem bản mã theo giao diện mô hình. Phải nêu khả năng đối thủ khi đánh giá, thay vì kết luận từ một bài thử thuận lợi. Một hệ hiện đại không nên dựa vào việc đối thủ không bao giờ biết định dạng hay tiêu đề dữ liệu.''',
'Suy khóa từ một ký tự đã biết',[
'Biết P=T=19 ở vị trí mà bản mã W=22: k=(22−19) mod26=3.',
'Dùng k=3 kiểm các vị trí còn lại; nếu không nhất quán, xem lại giả định vị trí hoặc hệ mã.',
'Nếu chỉ biết ký tự nhiều nhất trong văn bản rất ngắn, đó là giả thuyết tần suất, chưa phải cặp bản rõ chắc chắn.'],
'Một dịch vụ cho gửi chữ A rồi trả chữ H trong Caesar. Mô hình tấn công là gì và khóa bằng bao nhiêu?',
'Chosen-plaintext vì đối thủ tự chọn đầu vào; theo A=0,H=7 thì k=7. Việc có nhiều bản mã hơn không làm khóa khó hơn trong mô hình này.'),
(5, '''Computational security là mệnh đề gắn với nguồn lực, thời gian và giá trị thông tin. Với khóa n bit độc lập đồng đều, thử vét cạn thường cần cỡ 2^(n−1) thử trung bình khi có cách nhận biết khóa đúng; đó là ước lượng trong mô hình, không bao gồm mọi đường tấn công.

Unconditional security xét cả đối thủ không bị giới hạn tính toán nhưng vẫn theo các giả định của mô hình. OTP có thể đạt Perfect secrecy khi giữ đủ điều kiện; Caesar không đạt vì bản mã còn hạn chế tập bản rõ. “Khóa dài” và “thuật toán bí mật” đều không tự chứng minh một trong hai loại an toàn.''',
'Đọc một quảng cáo tăng khóa',[
'Nếu đổi từ 26 phép dịch sang mã hóa ba lần Caesar, chứng minh cấu trúc trước khi nhân số bộ khóa.',
'Nếu khóa sinh từ sáu chữ số đều nhau, chỉ có 10^6 đầu vào, xấp xỉ 19,93 bit entropy, dù hash thành 256 bit.',
'Xét thời gian bảo vệ cần thiết và đường tấn công rẻ nhất; không chỉ xem con số bit được in trên nhãn.'],
'Hệ dùng AES-256 nhưng mật khẩu chọn từ 1.000 từ công khai. Không gian bí mật thực tế tối đa bao nhiêu?',
'Tối đa 1.000 lựa chọn, xấp xỉ 9,97 bit nếu chọn đều và không có bí mật khác. Hash/KDF có thể tăng chi phí mỗi lần đoán, không tạo thêm entropy cho mật khẩu đã chọn.')
])
extra('caesar',1,'Ciphertext-only attack','Mô hình đối thủ chỉ quan sát bản mã khi tìm thông tin về bản rõ hoặc khóa.','Dùng phân bố ký tự của bản mã mà không có cặp bản rõ đã biết.','Phải xét thông tin ngữ cảnh công khai mà đối thủ còn có.')
extra('caesar',1,'Chosen-plaintext attack','Mô hình đối thủ chọn bản rõ và nhận kết quả mã hóa theo giao diện của mô hình.','Gửi chữ A vào dịch vụ Caesar để quan sát độ dịch.','Không được đánh giá một hệ chỉ trong mô hình yếu hơn khả năng thực tế của đối thủ.')

guide('substitution', [
(9, '''Một khóa đơn bảng phải là hoán vị đủ 26 chữ nếu muốn đảo duy nhất trên bảng chữ cái đó. Ánh xạ a->x và b->x làm mất khả năng phân biệt a/b. Có 26! hoán vị nhưng một hoán vị cố định giữ mẫu bằng nhau: hai chữ bản rõ bằng nhau vẫn tạo hai chữ bản mã bằng nhau.

Histogram của bản mã là histogram bản rõ đổi nhãn. Vì ngôn ngữ có cấu trúc, đối thủ không cần thử toàn bộ 26! khóa; họ kết hợp tần suất với mẫu từ và ngữ cảnh. Chỉ số tần suất không phải chứng minh: văn bản chuyên ngành, tên riêng và độ dài ngắn có thể lệch nhiều so với phân bố trung bình.''',
'Kiểm một bảng thay thế trước khi dùng tr',[
'Đếm đủ 26 ký tự đích và kiểm không trùng; đối chiếu theo vị trí với a-z.',
'Mã hóa một chuỗi thử chứa mọi chữ; đảo hai bảng để giải mã rồi so lại byte nguồn.',
'Với từ có mẫu ABBA, bản mã vẫn có mẫu XYYX. Ghi nhận cấu trúc này ngay cả khi chưa biết X/Y là chữ gì.'],
'Tại sao tăng số khóa từ 26 lên 26! vẫn chưa đủ kết luận thay thế đơn bảng an toàn?',
'Vì độ khó phụ thuộc đường tấn công tốt nhất. Đơn bảng giữ tần suất và mẫu lặp, cho phép phân tích cấu trúc thay vì vét mọi khóa.'),
(24, '''Quy trình giải cần phân biệt dữ liệu gốc, bản đã chuẩn hóa và giả thuyết ánh xạ. Chuẩn hóa giúp đếm nhưng có thể xóa manh mối khoảng trắng/chữ hoa hoặc làm mất ký tự. Hãy giữ bản gốc để kiểm lại, và ghi rõ có đếm theo ký tự, byte hay từ.

Mỗi lần đoán THE từ một trigram, áp ánh xạ đó lên toàn văn và tìm mâu thuẫn: cùng ký tự mã có bị gán hai chữ rõ không? Hai ký tự mã khác nhau có bị gán cùng chữ trong một hoán vị không? Một giả thuyết tốt phải giải thích nhiều vị trí, không chỉ một từ đẹp mắt.''',
'Bảng giả thuyết thay vì một lần đoán',[
'Thống kê ký tự và các bigram/trigram; lưu ba giả thuyết cạnh tranh cho mẫu thường gặp.',
'Thử ánh xạ một phần, để ký tự chưa biết nguyên dạng hoặc đánh dấu rõ; kiểm mọi lần xuất hiện.',
'Nếu một giả thuyết khiến hai bảng không còn một-một, rút lại và ghi lý do; không sửa âm thầm cho từng vị trí.'],
'Ký tự nhiều nhất là x. Khi nào có thể kết luận x chắc chắn tương ứng E?',
'Không thể chỉ từ tần suất. Cần thêm bằng chứng và kiểm nhất quán; thậm chí nhiều bản rõ vẫn có thể phù hợp nếu dữ liệu quá ngắn.'),
(27, '''Playfair xử lý cặp chữ nên thay vì chỉ nhìn từng chữ phải xét cấu trúc digram. Vigenère dùng các độ dịch theo vị trí khóa, khóa lặp có thể lộ chu kỳ. Hill dùng phép nhân ma trận modulo; điều kiện khả nghịch của ma trận là điều kiện có thể giải ngược, không là bằng chứng chống tấn công.

Transposition giữ giá trị ký tự nhưng đổi vị trí. Rail fence đơn giản chia ký tự theo đường đi rồi đọc theo hàng. Khi phân tích, histogram không đổi là một manh mối, còn mẫu kề nhau thay đổi. Các kỹ thuật này có giá trị học cấu trúc; không dùng chúng như thay thế mật mã hiện đại.''',
'Tính một khối Hill hai chữ',[
'Chọn K=[[3,3],[2,5]], cột P=(H,I)=(7,8). K×P=(45,54) -> (19,2)=TC modulo26.',
'det(K)=15−6=9; gcd(9,26)=1 nên K có nghịch đảo modulo26. Ma trận có định thức 2 sẽ không khả nghịch theo modulus này.',
'Ví dụ rail fence 2 hàng với ABCDEF: hàng 1 ACE, hàng 2 BDF, đọc thành ACEBDF; số lần xuất hiện từng chữ vẫn giữ.'],
'Hill có ma trận khả nghịch thì đã chống Known-plaintext chưa?',
'Chưa. Khả nghịch chỉ bảo đảm giải mã theo khóa. Các cặp khối đủ điều kiện có thể cho phương trình tuyến tính để suy khóa; cần tách tính đúng chức năng và tính an toàn.')
])
extra('substitution',0,'Permutation','Ánh xạ một-một từ một tập hữu hạn lên chính tập đó.','Bảng khóa thay thế gồm đủ 26 chữ và không có chữ trùng.','Nhiều permutation không tự xóa cấu trúc tần suất của bản rõ.')

guide('otp', [
(28, '''XOR là cộng modulo 2 trên từng bit, không có carry giữa vị trí. Tính giao hoán/kết hợp và K⊕K=0 cho phép triệt khóa khi giải mã. Khi viết ví dụ, phải giữ đúng độ dài bit và căn vị trí; số 0110 có 4 bit dù giá trị số nguyên là 6.

Phân biệt dữ liệu là byte với biểu diễn chữ 0/1. Chuỗi ASCII "1010" gồm bốn byte, không phải tự động một nibble. Một phép XOR thực hành phải nói rõ đang thao tác trên bit của dữ liệu hay trên chuỗi ký tự. Cũng không lấy việc đầu ra trông ngẫu nhiên làm bằng chứng bí mật.''',
'XOR và tính đảo theo đúng vị trí',[
'M=1010, K=0110. Từng cặp bit cho C=1100.',
'C⊕K=1100⊕0110=1010, lấy lại M mà không cần một phép toán giải mã khác.',
'Nếu biết M và C ở một đoạn, tính K=M⊕C tại đúng đoạn đó; không tự biết các bit khóa độc lập ngoài đoạn.'],
'Biết 8 bit bản rõ và bản mã OTP có suy được toàn bộ khóa 1 MiB không?',
'Chỉ suy được 8 bit tương ứng nếu khóa thật sự độc lập theo điều kiện OTP. Không suy các bit chưa biết; tái dùng chính đoạn khóa vừa suy ở bản tin khác lại làm lộ đoạn tương ứng.'),
(28, '''Perfect secrecy yêu cầu khóa có phân bố phù hợp, độc lập với bản rõ, bí mật, đủ dài và không tái sử dụng trong mô hình OTP. Với một bản mã cố định, mỗi bản rõ cùng độ dài xác định đúng một khóa tương ứng; nếu mọi khóa đều khả dĩ ngang nhau thì quan sát bản mã không thiên vị một bản rõ hơn.

Một CSPRNG từ seed ngắn tạo ra tập dòng khóa nhỏ hơn tập mọi chuỗi dài tương ứng; an toàn khi đó là theo giả định tính toán chứ không phải chứng minh OTP thông tin học. Khó khăn thực tế còn ở phân phối, lưu trữ và bảo đảm dùng đúng một lần; đó là lý do không thể chỉ lấy công thức XOR rồi tuyên bố Perfect secrecy.''',
'Đếm khả năng trong ví dụ 2 bit',[
'Cho C=10. Với M=00 cần K=10; M=01 cần K=11; M=10 cần K=00; M=11 cần K=01.',
'Nếu K chọn đều trong 00,01,10,11 thì mọi bản rõ vẫn có khóa tương ứng; cần xét cả phân bố bản rõ ban đầu.',
'Nếu K luôn 00, C=M; tính đảo vẫn đúng nhưng điều kiện bí mật hoàn toàn thất bại.'],
'Khóa dài bằng thông điệp nhưng được tạo bằng lặp từ SECRET có phải OTP không?',
'Không. Độ dài biểu diễn không tạo độc lập/ngẫu nhiên. Khóa lặp có cấu trúc và entropy thấp; thiếu điều kiện của chứng minh Perfect secrecy.'),
(28, '''Tái dùng khóa cho C1=M1⊕K và C2=M2⊕K cho C1⊕C2=M1⊕M2. Đối thủ đã loại được K mà không biết K; cấu trúc ngôn ngữ hoặc một bản rõ đã biết có thể giúp suy bản còn lại. Tình huống này còn xuất hiện khi stream cipher/CTR tái dùng cùng dòng khóa.

Malleability là vấn đề riêng: sửa C thành C⊕Δ làm bản rõ thành M⊕Δ. OTP giữ bí mật trong điều kiện chuẩn nhưng không tự xác thực tính nguyên vẹn. Một bit trạng thái có vị trí đã biết có thể bị đảo mà đối thủ không cần biết toàn bộ thông điệp; cần cơ chế xác thực/giao thức phù hợp.''',
'Hai lỗi độc lập trên một ví dụ 4 bit',[
'M1=1010, M2=0011, K=0110 -> C1=1100, C2=0101; C1⊕C2=1001=M1⊕M2.',
'Nếu biết M1 thì suy K=0110 rồi giải M2. Không gọi đây là đảo một hàm băm.',
'Với một bản tin, đổi C1 bằng XOR 0001 -> 1101; giải bằng K cho 1011, tức bit cuối của M1 đã bị đảo.'],
'Một hệ không tái dùng khóa nhưng không có tag xác thực. Vì sao vẫn có thể chấp nhận dữ liệu bị sửa?',
'Vì tránh tái dùng dòng khóa bảo vệ một điều kiện bí mật, không ngăn phép biến đổi có chủ đích lên bản mã. Bên nhận cần xác thực trước khi tin/sử dụng dữ liệu.')
])
extra('otp',2,'Malleability','Khả năng biến đổi bản mã để tạo thay đổi có quan hệ ở bản rõ mà không cần biết khóa.','XOR một delta vào bản mã OTP làm cùng delta tác động lên bản rõ.','Bí mật thông tin không đồng nghĩa chống sửa đổi chủ động.')

guide('aes', [
(31, '''Block cipher là họ permutation trên khối theo khóa. AES xử lý 128 bit mỗi khối; dữ liệu nhiều khối cần mode và quy tắc tham số. Stream cipher sinh dòng khóa theo trạng thái/nonce để kết hợp dữ liệu. Dùng AES trong CTR không đổi kích thước khối nội tại AES, mà dùng kết quả AES để tạo dòng khóa.

Ở mức bổ sung, AES sắp 16 byte thành state và thực hiện các phép thay thế, dịch hàng, trộn cột, cộng khóa vòng. SubBytes cung cấp bước phi tuyến; các bước khuếch tán phân phối ảnh hưởng giữa byte. Vòng cuối bỏ MixColumns. Không tự triển khai từ mô tả tóm tắt để bảo vệ dữ liệu; phần này giúp đọc sơ đồ và phân biệt round với mode.''',
'Đọc tên AES-256-CBC đúng từng con số',[
'256 là độ dài key theo bit; state/khối vẫn là 128 bit =16 byte.',
'AES-128/192/256 dùng lần lượt 10/12/14 round theo FIPS 197; số round khác số vòng PBKDF2.',
'CBC nói về cách kết hợp nhiều khối; nó không đổi AES thành khối 256 bit.'],
'Một lệnh có AES-256 và -iter 200000. Có phải AES chạy 200.000 round trên mỗi khối?',
'Không. -iter ở ví dụ enc PBKDF2 điều chỉnh KDF từ mật khẩu; AES-256 có 14 round nội tại. Hai chi phí ở hai tầng khác nhau.'),
(32, '''DES có khối 64 bit và 56 bit khóa hiệu dụng; các bit parity trong biểu diễn khóa không tự tăng không gian bí mật lên 64 bit. Triple-DES áp phép biến đổi DES theo cấu trúc nhiều khóa, nhưng mức an toàn không bằng cách cộng cơ học độ dài danh nghĩa các khóa.

Meet-in-the-middle minh họa vì sao ghép cipher có thể bị tấn công tốt hơn vét mọi cặp khóa. Với double encryption, đối thủ có thể tính một phía từ bản rõ và một phía từ bản mã rồi tìm trạng thái trung gian trùng, đánh đổi bộ nhớ và thời gian. Đừng nhầm tên này với Man-in-the-middle là đối thủ xen giữa liên lạc.''',
'Bảng kích thước phải tách theo cột',[
'DES: khối 64 bit, key hiệu dụng 56 bit; AES: khối 128 bit, key 128/192/256 bit.',
'Khối 64 bit chỉ có 2^64 giá trị; hiện tượng lặp theo quy mô birthday là một vấn đề khác vét khóa.',
'Mật khẩu và cách dẫn xuất key có thể yếu hơn nhãn cipher, nên luôn ghi cả nguồn key và mode khi đánh giá.'],
'Tại sao “hai khóa 56 bit nên chắc chắn cần 2^112 thử” là một lập luận thiếu?',
'Nó bỏ qua cấu trúc ghép và tấn công meet-in-the-middle. Số bộ khóa chỉ là một yếu tố; cần đánh giá thuật toán ghép, mô hình dữ liệu biết và đánh đổi tài nguyên.'),
(34, '''Entropy của nguồn khóa, cách dùng nonce/IV và xác thực ảnh hưởng trực tiếp đến an toàn thực tế. Một khóa sinh từ mật khẩu yếu có thể bị đoán offline nếu đối thủ có cách kiểm mỗi ứng viên. KDF tăng chi phí đoán nhưng không làm mật khẩu thành một bí mật đồng đều 256 bit.

Key schedule dẫn xuất round key từ khóa gốc theo quy tắc thuật toán. Round key không phải khóa độc lập do người dùng nhập cho mỗi round; việc thu đủ bí mật nội bộ có thể làm mất an toàn ngay cả khi dữ liệu công khai chỉ chứa ciphertext. Quản lý khóa, giới hạn sử dụng và bảo vệ đầu cuối là phần của thiết kế tổng thể.''',
'Một quy trình đánh giá tránh nhìn mỗi số bit',[
'Kiểm key được sinh từ đâu và đối thủ phải đoán những gì; phân biệt random key với password-derived key.',
'Kiểm mode, quy tắc nonce/IV, giới hạn dữ liệu và cơ chế xác thực; thử thay đổi/cắt bản mã.',
'Kiểm vòng đời khóa, quyền truy cập và quá trình phục hồi. Không suy an toàn ứng dụng từ một test vector AES đúng.'],
'Một thư viện AES khớp toàn bộ test vector có chứng minh hệ lưu tệp của bạn an toàn chưa?',
'Chưa. Test vector kiểm tính đúng của primitive cho một số đầu vào, không chứng minh mode, KDF, nonce, định dạng, kiểm tag hay quyền quản lý khóa của ứng dụng đúng.')
])
extra('aes',0,'SubBytes','Bước thay thế phi tuyến từng byte state trong AES theo S-box xác định.','Đọc sơ đồ một round AES để tìm nơi thay giá trị byte.','Không phải phép đổi vị trí byte như ShiftRows.')
extra('aes',2,'Key schedule','Quy tắc dẫn xuất các round key từ khóa đầu vào của cipher.','AES tạo vật liệu khóa cho các round từ khóa gốc.','Round key không phải nhiều khóa độc lập người dùng nhập tùy ý.')
extra('aes',2,'Round key','Phần vật liệu khóa được dùng trong một bước/vòng của thuật toán mã khối.','Phân biệt AddRoundKey với mật khẩu dùng để dẫn xuất khóa AES.','Số round key và số vòng password KDF thuộc các tầng khác nhau.')

guide('cbc', [
(41, '''ECB mã hóa Ci=E_K(Pi) độc lập nên cùng khối bản rõ dưới cùng key cho cùng khối bản mã. Nó giữ quan hệ bằng nhau và mẫu vị trí, không cần đối thủ giải ngược AES để nhận ra vùng lặp trong dữ liệu. Ví dụ ảnh BMP chỉ là một cách làm quan hệ đó dễ nhìn; cùng vấn đề có thể xuất hiện trong bản ghi định dạng cố định.

Thử ghép header BMP với ciphertext là thí nghiệm hiển thị, không phải định dạng mã hóa ảnh chuẩn. Giả định header luôn dài 54 byte có thể sai; OpenSSL enc cũng có thể có header/salt trong đầu ra. Nếu cắt sai offset, hình hỏng không chứng minh cipher mạnh hơn.''',
'Bốn khối lặp dưới ECB',[
'Cho P=[A,B,A,A] và key cố định. Đầu ra có dạng [X,Y,X,X], với X=E_K(A),Y=E_K(B).',
'Đối thủ biết khối 1,3,4 bằng nhau dù chưa biết A; nếu có thể mã hóa ứng viên, họ còn so trực tiếp.',
'Giữ riêng byte nguồn và cách cắt khối; đánh giá mẫu lặp trên đúng biên khối chứ không chỉ nhìn hình.'],
'Đổi key mới cho mỗi tệp nhưng dùng ECB bên trong có làm mất mọi mẫu lặp của từng tệp không?',
'Không. Dưới cùng key của một tệp, các khối bằng nhau vẫn tạo các ciphertext block bằng nhau. Đổi key giữa tệp không xóa quan hệ bên trong tệp đó.'),
(42, '''CBC đặt C0=IV, Ci=E_K(Pi⊕C(i−1)); giải Pi=D_K(Ci)⊕C(i−1). Bản mã trước tham gia đầu vào nên cùng Pi ở hai vị trí chưa chắc cho cùng Ci. IV không cần bí mật, nhưng CBC cần IV đáp ứng yêu cầu không đoán trước trong bối cảnh sử dụng; IV và dữ liệu liên quan phải được bảo vệ tính toàn vẹn theo thiết kế.

Đảo một bit trong C(i−1) đảo đúng bit tương ứng ở Pi, đồng thời làm hỏng khối trước đó theo cơ chế giải mã. Đảo bit IV có thể chỉnh khối bản rõ đầu mà không có một plaintext block trước trong thông điệp. Đây là lý do CBC không xác thực chưa đủ chống người sửa bản mã.''',
'Theo dấu một bit lỗi trong CBC',[
'Viết Pi=D_K(Ci)⊕C(i−1) để xác định rõ tác động trực tiếp từ khối bản mã trước.',
'Thay C(i−1) bằng C(i−1)⊕Δ: Pi thành Pi⊕Δ, nếu các khối khác giữ nguyên.',
'Kiểm cả tác động lên P(i−1); không tuyên bố có thể đổi mọi trường tùy ý mà không gây dữ liệu lỗi ở nơi khác.'],
'IV chỉ cần gửi công khai, vậy người sửa được IV có vô hại không?',
'Không. IV công khai không có nghĩa được phép thay mà không phát hiện. Trong CBC, thay IV tác động có cấu trúc lên khối bản rõ đầu; cần bảo vệ toàn vẹn/xác thực phù hợp.'),
(39, '''PKCS#7 padding với khối b byte thêm p byte có cùng giá trị p, với p=b−(mLen mod b). Nếu thông điệp đã vừa khối thì thêm cả khối đệm để bên nhận phân biệt ranh giới. Giá trị byte đệm là số byte cần bỏ, không phải ký tự chữ số trong ASCII.

Padding oracle xuất hiện khi hành vi lỗi để lộ thông tin về đệm qua nhiều truy vấn được chọn. Thông báo lỗi khác nhau chỉ là một dạng kênh; thời gian hoặc hành vi giao thức cũng có thể làm lộ. Đệm hợp lệ không xác thực nội dung, vì vậy không dùng “giải mã không báo lỗi” làm tiêu chí tin dữ liệu.''',
'Tính độ dài với AES-CBC và PKCS#7',[
'Thông điệp 30 byte, block 16: p=2, thêm 02 02 -> 32 byte trước mã hóa.',
'Thông điệp 32 byte: p=16, thêm 16 byte 0x10 -> 48 byte; không bỏ đệm vì đã chia hết.',
'Các con số này chưa gồm header/salt/IV/metadata ngoài ciphertext; đọc định dạng tệp trước khi so kích thước.'],
'Tệp giải mã xong có padding hợp lệ nhưng nội dung sai. Điều đó có mâu thuẫn với CBC không?',
'Không. Padding chỉ có quy tắc hình thức ở cuối dữ liệu; bản mã sai hoặc bị sửa vẫn có thể tình cờ có đệm hợp lệ. Cần kiểm xác thực và không để lộ oracle qua xử lý lỗi.')
])
extra('cbc',1,'Bit-flipping attack','Thay các bit bản mã để tạo thay đổi có quan hệ trong bản rõ của một cơ chế có tính malleable.','Sửa IV của CBC chưa xác thực để đảo bit ở plaintext block đầu.','Phải xét cả lỗi lan truyền và khả năng dữ liệu bị cơ chế xác thực từ chối.')

guide('ctr', [
(43, '''Ở CFB kích thước đầy khối, sinh Si=E_K(C(i−1)) với C0=IV rồi Ci=Pi⊕Si. OFB sinh Oi=E_K(O(i−1)) với O0=IV rồi Ci=Pi⊕Oi. CTR sinh Si=E_K(counter_i) rồi XOR với Pi. Điểm khác then chốt là cái gì được phản hồi hoặc đưa vào cipher ở vòng tiếp.

CFB/OFB/CTR dùng phép mã hóa E_K để sinh dòng khóa ngay cả khi phía nhận đang giải dữ liệu; không thay E_K bằng D_K một cách máy móc. Các mode kiểu dòng có thể xử lý phần cuối theo quy tắc của biến thể mà không cần PKCS#7 như CBC. Với CFB phải nói rõ kích thước segment.''',
'Đánh dấu đầu vào của AES ở bước thứ hai',[
'CFB đầy khối: đầu vào bước 2 là C1, tức ciphertext vừa tạo/nhận.',
'OFB: đầu vào bước 2 là O1, là đầu ra cipher, không phải C1.',
'CTR: đầu vào bước 2 là counter block thứ hai đã cấp; không cần Pi hay Ci của bước trước để tính Si.'],
'Vì sao không thể chỉ nói cả ba mode đều “XOR với AES” rồi coi tương đương?',
'Chúng khác cách tạo và cập nhật dòng khóa, nên khác phụ thuộc dữ liệu, song song, đồng bộ và lỗi lan truyền. XOR cuối cùng giống nhau không làm toàn cơ chế giống nhau.'),
(44, '''CTR tạo dòng khóa từng vị trí độc lập khi biết key và counter block nên có thể tính song song/truy cập ngẫu nhiên. CBC mã hóa phải chờ ciphertext trước, còn giải CBC có thể tính D_K(Ci) độc lập rồi XOR với khối trước đã có. Phân tích phụ thuộc là chính xác hơn tuyên bố một hệ số tốc độ cố định.

Trong OFB và CTR, đảo một bit ciphertext làm đảo bit plaintext tương ứng, nhưng mất/chèn byte có thể gây lệch đồng bộ ở tầng ghép vị trí. CFB đầy khối có lỗi lan truyền hữu hạn trong điều kiện mô hình, còn CFB segment nhỏ phải xét riêng. Khả năng tự đồng bộ không tự tạo Integrity.''',
'Một bit truyền sai ở khối Ci',[
'CTR/OFB: Si không phụ thuộc ciphertext, nên ở vị trí giữ đồng bộ, Pi bị đảo đúng bit lỗi.',
'CFB đầy khối: Pi bị đảo bit tương ứng; C_i sai còn làm dòng khóa khối kế tiếp sai, sau đó trạng thái có thể đồng bộ lại theo biến thể.',
'CBC: Pi chịu biến đổi khó dự đoán qua D_K; P(i+1) bị đảo bit tương ứng. So sánh luôn nêu cùng loại lỗi và kích thước khối.'],
'Một mode không lan lỗi có phải luôn tốt hơn không?',
'Không. Ít lan lỗi có thể hữu ích cho truyền dữ liệu, nhưng cũng làm sửa bit có chủ đích dễ mô tả nếu thiếu xác thực. Chọn cơ chế phải xét yêu cầu bí mật, toàn vẹn và giao thức.'),
(45, '''Điều kiện cốt lõi của CTR là không lặp bất kỳ đầu vào counter block nào dưới cùng key. Nonce thường phân biệt thông điệp, counter phân biệt khối trong thông điệp. Phải xét tràn counter, reset sau reboot, nhiều thiết bị chung key và việc chia miền giá trị; chỉ đếm số nonce không đủ nếu counter block vẫn chồng nhau.

AEAD cung cấp mã hóa xác thực theo giao diện lược đồ, bảo vệ ciphertext và AAD công khai được đưa vào phép kiểm. Nó không tự làm dữ liệu mới: vẫn phải thiết kế số thứ tự/nonce và chống replay. Bên nhận chỉ dùng nội dung sau khi tag hợp lệ theo API; không hiển thị bản rõ tạm thời rồi mới báo tag sai.''',
'Giới hạn counter 32 bit trong một cấu hình học',[
'Nếu counter phần thấp có 32 bit và mỗi block 16 byte, tối đa 2^32 block khác nhau trong miền nonce đó, tương ứng 2^36 byte =64 GiB về mặt không gian counter.',
'Đó không phải giới hạn an toàn tổng quát cho mọi AEAD/CTR; lược đồ có thể quy định thấp hơn. Phải dừng trước khi lặp và tuân đặc tả.',
'Hai thiết bị cùng key/nonce và cùng bắt đầu counter=0 tạo trùng dòng khóa ngay từ block đầu, dù mỗi thiết bị chưa gần tràn.'],
'Nonce ngẫu nhiên 96 bit có cho xác suất lặp bằng 0 không?',
'Không. Ngẫu nhiên có xác suất va chạm tăng theo số lần sinh; còn cơ chế cấp số đảm bảo không lặp cần trạng thái/miền đúng. Phải tuân quy tắc cụ thể của lược đồ, không suy ngẫu nhiên là duy nhất tuyệt đối.')
])
extra('ctr',2,'Counter wraparound','Counter vượt miền giá trị rồi quay lại giá trị đã dùng.','Bộ đếm khối 32 bit chạy quá 2^32 giá trị dưới cùng miền nonce/key.','Phải xét miền counter của lược đồ, không chỉ kiểu số nguyên trong mã.')

guide('shell', [
(11, '''Shell thiết lập luồng trước khi chương trình xử lý: < lấy tệp làm stdin, > chuyển stdout sang tệp và thường cắt tệp đích ngay khi mở, | nối stdout của lệnh trái với stdin của lệnh phải. stderr là luồng riêng, nên thông báo lỗi vẫn có thể xuất hiện trên màn hình dù đã chuyển stdout.

Exit status giúp script biết thành công/thất bại theo quy ước công cụ, nhưng phải hiểu lệnh nào được kiểm trong pipeline. Một pipeline có thể tạo tệp rỗng vì lệnh đầu lỗi trong khi lệnh cuối kết thúc bình thường. Khi đối chiếu kết quả, kiểm cả nội dung, thông báo và mã thoát phù hợp.''',
'Đọc lệnh tr từ ngoài vào trong',[
'Trong tr ... < article.txt > lowercase.txt, shell mở input/output; tr chỉ đọc stdin và ghi stdout, không tự biết tên hai tệp.',
'Nếu đặt cùng tên cho input và output, shell có thể cắt rỗng tệp trước khi tr đọc xong. Dùng tệp đích khác.',
'Trong printf ... | sha256sum, chỉ byte stdout của printf đi vào hash; chữ mô tả ở stderr không tự được nối vào đó.'],
'Đã chuyển stdout ra tệp nhưng lỗi vẫn hiện. Có phải redirection thất bại không?',
'Chưa chắc. Công cụ có thể ghi lỗi ở stderr, là luồng khác. Cần đọc rõ redirection được áp dụng cho file descriptor nào và kiểm exit status.'),
(12, '''Dấu nháy bảo vệ đối số khỏi một số phép mở rộng của shell, không làm dữ liệu được mã hóa. Với tr, hai tập ký tự xác định ánh xạ theo vị trí; -d chuyển sang xóa, -c lấy phần bù. Kết hợp -cd nghĩa là xóa những ký tự ngoài tập được cho phép.

Lớp [:upper:] và [:lower:] phụ thuộc môi trường locale/công cụ. Bộ lọc chỉ giữ a-z là chủ đích ASCII cho lab tiếng Anh, có thể làm mất tiếng Việt và thay cấu trúc ngôn ngữ. Tệp đã chuẩn hóa phải có tên khác để giữ nguyên bản gốc phục vụ kiểm chứng.''',
'Tách nghĩa ví dụ lọc ASCII',[
"tr -cd 'a-z\\n ' giữ chữ thường ASCII, newline và dấu cách: -c chọn phần ngoài tập, -d xóa phần đã chọn.",
'Dấu < cung cấp nguồn; > ghi kết quả. Đặt nháy quanh tập để shell không diễn giải nó như glob ngoài ý muốn.',
'Thử với A,é,7 và dấu cách để thấy bộ lọc không tương đương một phép chuẩn hóa Unicode tổng quát.'],
'Vì sao số lượng byte giảm sau tr không chứng minh đã giải mã được gì?',
'tr có thể chỉ xóa các ký tự không thuộc tập, làm mất dữ liệu một chiều theo cấu hình. Giảm byte và có chữ nhìn được không phải bằng chứng khôi phục bản rõ theo khóa.'),
(38, '''OpenSSL enc ghép nhiều tầng: mật khẩu -> KDF có salt/tham số -> vật liệu key/IV -> cipher mode -> định dạng tệp. -iter điều chỉnh công việc dẫn xuất khóa, còn -aes-256-cbc chọn primitive/mode. Salt công khai chống nhiều tài khoản dùng cùng mật khẩu có cùng kết quả dẫn xuất theo cùng điều kiện; salt không phải bí mật thay mật khẩu.

Ghi đầy đủ tham số và định dạng để giải lại: thuật toán, KDF, số vòng, digest khi liên quan và cách nhận salt. Đừng lấy một lần chạy thành công làm cấu hình sản xuất hoàn chỉnh: enc CBC trong bài không thêm tag xác thực và không bảo vệ toàn bộ metadata theo một giao thức lưu trữ đầy đủ.''',
'Kiểm một vòng mã hóa/giải mã lab',[
'Dùng tệp thử không nhạy cảm và mật khẩu nhập tương tác; ghi lại KDF/iterations/mode đã dùng.',
'Giải sang tên tệp mới với cùng tham số; so byte với nguồn và thử trường hợp sai mật khẩu/tham số.',
'Thử sửa bản mã để quan sát giới hạn: không dùng việc không báo lỗi padding làm bằng chứng tệp xác thực.'],
'PBKDF2 với salt có bảo đảm không thể dò mật khẩu offline không?',
'Không. Salt ngăn một số cách tái sử dụng công việc giữa các bản ghi; work factor tăng chi phí từng đoán. Đối thủ vẫn có thể thử các mật khẩu khả dĩ nếu có dữ liệu và phép kiểm offline.')
])
extra('shell',0,'Exit status','Giá trị kết thúc của tiến trình mà shell dùng để kiểm kết quả theo quy ước công cụ.','Script kiểm mã thoát sau lệnh kiểm checksum.','Có stdout không đồng nghĩa lệnh thành công; pipeline còn có quy tắc riêng.')
