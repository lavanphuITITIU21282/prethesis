guide('cia', [
(11, '''Khi phân tích Confidentiality, hãy ghi rõ chủ thể, thông tin và quyền truy cập: dữ liệu có thể được đọc bởi ai, ở trạng thái lưu, truyền hay xử lý? Quyền đọc của một bác sĩ không tự mở rộng sang mọi hồ sơ. Với Integrity, phải phân biệt dữ liệu đúng byte với dữ liệu đúng nghiệp vụ: một giao dịch được lưu nguyên vẹn vẫn có thể là giao dịch sai quyền.

Availability luôn gắn với người dùng hợp lệ và thời điểm cần dùng. Dịch vụ trả HTTP 200 nhưng không tra được hồ sơ vẫn có thể không đáp ứng mục tiêu. Ba mục tiêu có thể xung đột khi thiết kế: khóa tài khoản hàng loạt để chặn dò mật khẩu cũng có thể ngăn người dùng thật. Cần mô tả cả biện pháp và cách đo tác động.''',
'Phân tích một cổng bệnh án theo ba trục',[
'Lập danh sách dữ liệu: hồ sơ, khóa giải mã, nhật ký và bản sao dự phòng; mỗi loại có nhóm người được phép đọc khác nhau.',
'Xét Integrity: thay liều thuốc, gán nhầm bệnh nhân hoặc chạy phần mềm sai đều có hậu quả, dù tệp vẫn có checksum khớp với bản sai.',
'Xét Availability: đo khả năng tra đúng hồ sơ trong ca cấp cứu, không chỉ số phút máy chủ có kết nối mạng.'],
'Một hệ thống chỉ cho bác sĩ xem hồ sơ, nhưng nhân viên quản trị đổi được liều thuốc và dịch vụ ngừng mỗi tối. Mã hóa mạnh có giải quyết đủ CIA không?',
'Không. Mã hóa hỗ trợ Confidentiality theo mô hình khóa, nhưng quyền sửa và kiểm chứng thay đổi liên quan Integrity; vận hành, dự phòng và phục hồi liên quan Availability. Phải thử từng mục tiêu bằng tình huống cụ thể.'),
(12, '''DAD mô tả hậu quả nên cùng một sự cố có thể được gắn nhiều nhãn. Nếu đối thủ sao chép dữ liệu rồi mã hóa ổ đĩa, phải tách bằng chứng Disclosure khỏi bằng chứng Alteration và Destruction/gián đoạn. Không có log tải xuống không đủ kết luận không rò rỉ: log có thể chưa thu thập đúng hoặc đã bị sửa.

Phân biệt mục tiêu an toàn, sự kiện và nguyên nhân. Vulnerability có thể là quyền ghi quá rộng; Attack là thao tác khai thác quyền đó; Alteration là việc dữ liệu bị sửa. Khôi phục một bản backup có thể giải quyết khả năng sử dụng nhưng không thu hồi bản dữ liệu đã bị sao chép. Một biện pháp thành công ở một trục không đảo ngược mọi hậu quả.''',
'Dòng thời gian của sự cố ransomware',[
'08:00 đối thủ sao chép danh sách bệnh nhân: ghi Disclosure ngay cả khi hệ thống vẫn hoạt động.',
'08:10 đối thủ đổi kết quả xét nghiệm: ghi Alteration; tách nội dung sai khỏi việc mất kết nối.',
'08:20 dịch vụ không sử dụng được: ghi ảnh hưởng Availability; phục hồi dữ liệu từ mốc sạch nhưng vẫn xử lý dữ liệu đã lộ.'],
'Sau khi restore, mọi người truy cập lại bình thường. Vì sao chưa thể tuyên bố sự cố đã hết?',
'Restore không xóa bản sao đối thủ giữ, không bảo đảm dữ liệu phục hồi sạch và không sửa nguyên nhân xâm nhập. Cần kiểm chứng dữ liệu, thay bí mật bị lộ, đóng đường tấn công và theo dõi tái diễn.'),
(11, '''Data integrity nói về dữ liệu khỏi thay đổi trái phép; System integrity còn xét hệ thống thực hiện chức năng theo ý định, không bị điều khiển sai. Một chương trình tính thuế sai có thể tạo dữ liệu mới sai mà không cần ai sửa tệp sau đó. Vì thế chỉ giám sát hash tập tin là chưa đủ để chứng minh tính đúng của quy trình.

Privacy xem cả việc thu thập, mục đích sử dụng và chia sẻ dữ liệu cá nhân. Một kho dữ liệu được mã hóa và kiểm soát truy cập tốt vẫn có thể dùng thông tin cho mục đích vượt thỏa thuận. Reliability liên quan hoạt động nhất quán; dịch vụ đáng tin về vận hành chưa tự chứng minh không có hành vi đọc lén có chủ đích.''',
'Ba kết luận cần tránh khi đọc số liệu vận hành',[
'Uptime 99,9% chỉ mô tả một phép đo thời gian, không chứng minh kết quả giao dịch đúng.',
'Checksum khớp chứng minh cùng byte với giá trị tham chiếu, không chứng minh ai được phép tạo bản đó.',
'Mã hóa cơ sở dữ liệu không tự cho phép bán lịch sử cá nhân: phải xét thêm Privacy và mục đích xử lý.'],
'Dữ liệu bị ghi nhầm bởi phần mềm có chữ ký hợp lệ. Chữ ký có chứng minh dữ liệu đúng sự thật không?',
'Không. Chữ ký ràng buộc byte với khóa ký trong những giả định nhất định; nội dung đúng nghiệp vụ/sự thật là một mệnh đề khác. Cần kiểm tra quy trình tạo dữ liệu và quyền của người/hệ thống ký.')
])
extra('cia',2,'Data integrity','Bảo vệ dữ liệu khỏi thay đổi hoặc phá hủy không được phép trong bối cảnh xác định.','Một byte số tiền bị sửa sau khi giao dịch đã được phê duyệt.','So cùng byte không chứng minh dữ liệu ban đầu đúng nghiệp vụ.')
extra('cia',2,'System integrity','Bảo đảm hệ thống thực hiện chức năng theo ý định, không bị thao túng trái phép.','Chương trình bị thay logic để tự gán sai người nhận tiền.','Dữ liệu lưu đúng định dạng vẫn có thể được hệ thống sai tạo ra.')

guide('aaa', [
(13, '''Hãy đi theo một yêu cầu cụ thể: tên đăng nhập là lời khai Identification; bằng chứng như mật khẩu hoặc chữ ký thử thách được kiểm ở Authentication; quyền xem hồ sơ 123 cần Authorization độc lập. Quyền phải xét tài nguyên, hành động và ngữ cảnh, không chỉ vai trò ghi trong giao diện. Đổi URL từ hồ sơ 123 sang 124 là phép thử đơn giản để phát hiện kiểm quyền thiếu.

Least privilege yêu cầu cấp đủ quyền cho công việc trong phạm vi cần thiết. Quyền mặc định quá rộng, tài khoản dùng chung và token không hết hạn làm khó giới hạn thiệt hại. Token hợp lệ chỉ chứng minh một số điều do cơ chế phát hành/kiểm token quy định; hệ thống vẫn phải xét thu hồi, hết hạn, quyền tài nguyên và thay đổi vai trò.''',
'Theo dấu yêu cầu GET /records/124',[
'Đọc định danh và bằng chứng từ yêu cầu; kiểm tính hợp lệ trước khi coi người gửi là một chủ thể đã xác thực.',
'Tra quyền đối với hồ sơ 124 ở máy chủ. Không lấy việc người dùng từng mở trang 123 làm bằng chứng cho quyền với 124.',
'Ghi kết quả cho phép/từ chối và mã yêu cầu để phục vụ đối soát; tránh đưa token/mật khẩu vào log.'],
'Một API trả 403 khi nút bị ẩn nhưng trả 200 nếu tự gọi URL bằng token thường. Sai ở bước nào?',
'Authorization phía máy chủ chưa đủ. Ẩn nút chỉ là cách trình bày; cần kiểm quyền trên mỗi thao tác và tài nguyên bằng danh tính đã xác thực.'),
(13, '''Một sự kiện Auditing hữu ích thường cần chủ thể, thao tác, đối tượng, thời gian, kết quả và mã liên kết. Kết quả không nên chỉ là mã HTTP: một yêu cầu có thể trả 200 nhưng nghiệp vụ bên trong thất bại. Log đăng nhập không thay log tải dữ liệu, sửa quyền hoặc phê duyệt giao dịch.

Accountability phụ thuộc khả năng gắn hành động với chủ thể và tin cậy bằng chứng. Đồng bộ thời gian giúp nối sự kiện; bảo vệ quyền ghi/xóa giúp tránh tự xóa dấu vết. Tài khoản chung chỉ quy được tới tài khoản, chưa đủ quy cho cá nhân cụ thể. Lưu càng nhiều cũng không tự tốt: log chứa mật khẩu hoặc dữ liệu cá nhân có thể trở thành một nguồn Disclosure mới.''',
'Thiết kế một bản ghi audit',[
'Ghi actor=doctor-17, action=read, resource=record-124, decision=deny, request_id=r82 và thời gian theo cùng quy ước.',
'Đối với thao tác sửa, lưu thông tin thay đổi phù hợp để kiểm chứng mà không nhân bản dữ liệu nhạy cảm không cần thiết.',
'Thử một người dùng có quyền đọc dữ liệu nhưng không có quyền sửa log; kiểm thử quy trình xem và khôi phục log.'],
'Hai người dùng chung tài khoản trực ca; log có đầy đủ thời gian và IP. Có thể chắc chắn ai đã sửa dữ liệu không?',
'Chưa. Thời gian/IP giúp điều tra nhưng không tự chứng minh cá nhân cầm tài khoản vào thời điểm đó. Cần định danh riêng và liên kết bằng chứng đáng tin; nêu rõ giới hạn khi quy trách nhiệm.'),
(21, '''Peer entity authentication kiểm thực thể tham gia phiên; Data origin authentication kiểm nguồn của một thông điệp. Chúng không đồng nghĩa với Freshness: kẻ tấn công có thể phát lại nguyên một thông điệp đã được xác thực. Vì vậy cần ràng buộc bằng chứng với thử thách mới, số thứ tự hoặc trạng thái giao dịch, tùy giao thức.

Một nonce mới cần được kiểm cả giá trị, ngữ cảnh và việc đã dùng. Nếu hai yêu cầu đồng thời đều đọc trạng thái “chưa dùng” trước khi cập nhật, kiểm tra riêng rẽ có thể vẫn xử lý hai lần. Hãy xem xác thực mật mã và quy tắc xử lý nguyên tử như hai lớp phối hợp, không coi một chữ ký đúng là toàn bộ giao thức.''',
'Ngăn phát lại lệnh chuyển tiền đã ký',[
'Định dạng thông điệp gồm người gửi, bên nhận, số tiền, đơn vị tiền, định danh giao dịch và nonce.',
'Kiểm khóa/danh tính, chữ ký và quy tắc cấp quyền; kiểm nonce thuộc đúng người và đúng ngữ cảnh.',
'Đánh dấu giao dịch đã xử lý trong cùng thao tác nguyên tử với ghi nhận chuyển tiền để yêu cầu đồng thời không được chi hai lần.'],
'MAC đúng nhưng bản tin được ghi lại từ hôm qua. Bên nhận đã có bằng chứng gì và còn thiếu gì?',
'Có bằng chứng phù hợp với khóa MAC trong mô hình các bên giữ khóa; chưa có bằng chứng bản tin mới hoặc chưa từng xử lý. Cần kiểm freshness và trạng thái chống phát lại.')
])
extra('aaa',0,'Least privilege','Chỉ cấp quyền cần thiết cho công việc trong phạm vi và thời gian phù hợp.','Tài khoản đọc báo cáo không được quyền sửa quyền quản trị.','Quyền thấp vẫn có thể gây hại với dữ liệu mà tài khoản được phép đọc.')
extra('aaa',2,'Freshness','Thuộc tính bản tin/bằng chứng còn mới trong ngữ cảnh của giao thức.','Bên nhận kiểm nonce chưa dùng trước khi chấp nhận yêu cầu đã ký.','Chữ ký hay MAC đúng tự nó không chứng minh bản tin mới.')

guide('risk', [
(15, '''Bắt đầu từ Asset thay vì từ tên công cụ. Với một cổng nộp bài, tài sản gồm bản nộp, quyền truy cập, khóa, lịch sử nộp và khả năng tiếp nhận đúng hạn. Threat model ghi rõ đối thủ có thể thấy hoặc thay gì: chỉ ở ngoài mạng, có tài khoản thường, có quyền nội bộ hay đã chiếm một máy chủ. Kết luận an toàn phải gắn với mô hình đó.

Attack surface là các điểm hệ thống tiếp nhận tác động: API, tệp nhập, cấu hình, tài khoản, dịch vụ mạng và quy trình con người. Một lỗi chưa có đường khai thác trong bối cảnh này có thể trở thành rủi ro khi kết nối hoặc quyền thay đổi. Cần nối chuỗi Asset -> Vulnerability -> hành động tấn công -> hậu quả, tránh nhảy thẳng từ “có cổng mở” sang “đã bị xâm nhập”.''',
'Lập một chuỗi rủi ro có thể kiểm tra',[
'Asset: bài thi chưa công bố; Vulnerability: API chỉ kiểm đã đăng nhập, không kiểm quyền lớp.',
'Adversary: sinh viên có tài khoản thường; Attack: đổi mã lớp trong URL để yêu cầu tài liệu.',
'Hậu quả: Disclosure; kiểm chứng bằng tài khoản thử ở lớp khác, không chỉ xem cấu hình firewall.'],
'Một lỗ hổng có điểm kỹ thuật cao nhưng máy không nối mạng có chắc không có rủi ro không?',
'Không thể kết luận chỉ từ việc không nối mạng. Phải xét đường đưa dữ liệu, người dùng nội bộ, thiết bị lưu trữ và giá trị tài sản. Mô hình truy cập khác làm thay đổi khả năng khai thác, không tự xóa rủi ro.'),
(17, '''Passive/Active mô tả hành vi; Insider/Outsider mô tả vị trí hoặc quyền tương đối với biên bảo vệ. Hai trục độc lập: người nội bộ có thể nghe lén thụ động, người ngoài có thể chèn thông điệp chủ động. Không nên gán “đáng tin” chỉ vì có mặt trong LAN hoặc có tài khoản do tổ chức cấp.

Passive attack khó phát hiện trực tiếp vì có thể không sửa dữ liệu. Mã hóa đường truyền giúp hạn chế nội dung bị đọc, nhưng kích thước và thời điểm lưu lượng vẫn có thể bộc lộ thông tin. Active attack đòi kiểm tính toàn vẹn, nguồn và trạng thái ngoài việc che nội dung. Không có một nhãn tấn công duy nhất kéo theo một biện pháp hoàn chỉnh.''',
'Phân loại ba hành vi độc lập',[
'Người ngoài ghi lại gói tin để đọc sau: Outsider + Passive ở bước thu thập; xét riêng khả năng giải mã.',
'Nhân viên sửa tài khoản nhận tiền: Insider + Active, dù tài khoản của họ đăng nhập hợp lệ.',
'Máy bị chiếm trong LAN gửi gói giả: vị trí mạng không đủ xác định đối thủ thuộc tổ chức; mô tả rõ biên và quyền đã bị chiếm.'],
'Mọi gói tin đã mã hóa thì Active attack có còn đáng xét không?',
'Có. Đối thủ còn có thể sửa, phát lại, bỏ gói hoặc làm cạn tài nguyên. Cần xét xác thực/toàn vẹn, freshness và Availability; mã hóa không tự xử lý những việc này.'),
(18, '''Risk là đánh giá theo khả năng và tác động trong bối cảnh, có bất định. Mô hình Threat × Vulnerability trong slide giúp đặt câu hỏi nhưng không biến hai nhãn định tính thành tiền thiệt hại chính xác. Khi dùng số, phải nêu đơn vị, giả định và cách ước lượng; tác động có thể gồm thời gian ngừng, dữ liệu mất và hậu quả nghiệp vụ.

Countermeasure gồm Prevention, Detection và Recovery. Một lớp phòng ngừa có thể thất bại nên cần khả năng phát hiện và phục hồi đã thử thật. Residual risk là phần còn lại sau biện pháp, cần được theo dõi và xử lý theo trách nhiệm đã xác định. Security policy phải đủ cụ thể để chuyển thành quyền, quy trình và phép thử; “hệ thống phải an toàn” chưa phải quy tắc kiểm chứng được.''',
'So hai lựa chọn xử lý rủi ro',[
'Phương án A giảm khả năng xâm nhập nhưng không có backup; phương án B vừa giới hạn quyền vừa có phục hồi kiểm thử. Liệt kê rủi ro còn lại của từng phương án.',
'Nếu ước lượng minh họa xác suất sự cố trong năm là 0,1 và tổn thất mỗi sự cố là 100 triệu, tích 10 triệu/năm là giá trị kỳ vọng theo mô hình, không là dự đoán chắc chắn.',
'Ghi giả định và xem xét các thiệt hại không quy thành tiền; kiểm lại khi thay tài sản, mối đe dọa hoặc hạ tầng.'],
'Sau khi vá mọi lỗi đã biết, vì sao residual risk chưa bằng 0?',
'Vẫn có lỗi chưa biết, cấu hình sai, tài khoản bị lộ, lỗi vận hành và giới hạn mô hình. Kiểm soát rủi ro là quy trình đánh giá/kiểm chứng liên tục, không chỉ danh sách bản vá.')
])
extra('risk',0,'Threat model','Mô tả tài sản, đối thủ, năng lực và giả định dùng khi phân tích an toàn.','Đánh giá riêng đối thủ chỉ nghe lén và đối thủ sửa được máy chủ.','Một kết luận không tự mở rộng sang đối thủ mạnh hơn mô hình đã nêu.')
extra('risk',0,'Attack surface','Tập các điểm và đường hệ thống có thể nhận tác động để bị tấn công.','Rà API, tệp nhập, tài khoản và quy trình cấp khóa.','Ẩn một cổng mạng chưa xử lý các đường nhập dữ liệu khác.')

guide('services', [
(20, '''Security service mô tả điều cần được bảo đảm; Security mechanism mô tả cách thực hiện. “Mã hóa bằng AES” là một cơ chế, còn “người ngoài không đọc được hồ sơ truyền trên kênh này” là mục tiêu dịch vụ theo phạm vi. Một cơ chế có thể phục vụ nhiều mục tiêu, nhưng phải phân tích cụ thể các giả định về khóa, người dùng và dữ liệu.

Lập ma trận yêu cầu giúp tránh bỏ sót: mỗi tài nguyên/hành động cần dịch vụ gì, cơ chế nào cung cấp, và phép thử nào xác nhận? Access control phải gắn với quyền trên tài nguyên; xác thực đầu kết nối không thay thế quyền đọc/sửa. Đặc biệt, một giao thức bảo vệ kênh không tự sửa lỗ hổng logic của ứng dụng ở hai đầu kênh.''',
'Ma trận ba yêu cầu của hệ thống nộp bài',[
'Yêu cầu bí mật khi truyền: dùng kênh được xác thực và mã hóa; thử trường hợp lấy nhầm khóa hoặc tên dịch vụ.',
'Yêu cầu sinh viên chỉ sửa bài của mình: kiểm quyền ở máy chủ trên mã bản nộp; thử tài khoản khác.',
'Yêu cầu có thể khôi phục: lưu bản sao và kiểm khôi phục đầy đủ dữ liệu lẫn khóa; không chỉ kiểm đã tạo file backup.'],
'Website có TLS nên sinh viên đổi được ID trong URL để xem bài người khác có còn là lỗi bảo mật không?',
'Có. TLS bảo vệ đường truyền trong phạm vi giao thức; Authorization của ứng dụng vẫn phải chặn truy cập tài nguyên không thuộc quyền người dùng.'),
(21, '''Hash không khóa, MAC và chữ ký có các tập người kiểm chứng khác nhau. Ai cũng có thể tính lại hash; người biết khóa chung có thể tạo MAC; chữ ký cho phép kiểm bằng khóa công khai đã xác thực. Vì thế “digest khớp” không tự chứng minh nguồn và “MAC đúng” không phân biệt hai bên cùng giữ khóa ai đã tạo thông điệp.

Nonrepudiation là yêu cầu về bằng chứng và quy trình: cần xét khóa thuộc ai, ai có quyền dùng khóa, cách lưu bằng chứng, thời gian và quy định áp dụng. Một chữ ký có thể là thành phần kỹ thuật quan trọng nhưng không tự giải quyết toàn bộ tranh chấp. Hãy giới hạn kết luận ở điều đã kiểm: byte nào, khóa nào, danh tính được xác thực thế nào.''',
'Đánh giá một biên nhận giao dịch',[
'Nếu chỉ lưu H(message), người sửa được kho có thể thay cả message và digest.',
'Nếu dùng MAC với khóa chung của hai bên, mỗi bên đều có khả năng tạo tag; không lấy tag làm bằng chứng kỹ thuật duy nhất phân biệt người tạo.',
'Nếu dùng chữ ký, lưu cả byte được ký, chữ ký, thông tin khóa/chứng chỉ và ngữ cảnh kiểm chứng cần thiết.'],
'Một chữ ký hợp lệ có chứng minh người cầm khóa đã đọc và đồng ý toàn bộ nội dung hiển thị trên màn hình không?',
'Chưa. Cần chứng minh dữ liệu được ký tương ứng nội dung/ý định cần xác nhận và quy trình sử dụng khóa. Kiểm chứng mật mã chỉ giải quyết một phần của chuỗi bằng chứng.'),
(23, '''Defense in depth kết hợp các lớp có tác dụng khác nhau: giới hạn quyền giảm khả năng/tác động, nhật ký hỗ trợ phát hiện, backup và kế hoạch vận hành hỗ trợ phục hồi. Nếu các lớp cùng phụ thuộc một tài khoản quản trị hoặc một ổ đĩa, một lỗi chung có thể làm tất cả cùng mất tác dụng.

Với DoS, phân biệt tắc đường truyền, cạn kết nối, cạn CPU do kiểm mật mã và quá tải cơ sở dữ liệu. Mỗi dạng cần phép đo và biện pháp tương ứng. Rate limit có thể giúp giới hạn một nguồn yêu cầu nhưng cũng có thể ảnh hưởng người dùng thật sau cùng địa chỉ NAT; kiểm tính sẵn sàng từ góc nhìn người dùng thay vì chỉ xem máy có chạy.''',
'Một bài kiểm thử phục hồi có ý nghĩa',[
'Giả lập mất máy chủ chính trong môi trường thử; đo thời gian dựng lại dịch vụ và độ mới dữ liệu.',
'Thử khôi phục khi người vận hành thường ngày vắng mặt và khi khóa mã hóa cần lấy từ quy trình dự phòng.',
'Kiểm nội dung sau phục hồi, quyền truy cập và khả năng tiếp nhận yêu cầu thật; ghi điểm còn phụ thuộc một tài khoản duy nhất.'],
'Có ba bản backup nhưng tất cả trên cùng ổ và cùng tài khoản xóa được. Có phải ba lớp phục hồi độc lập không?',
'Không. Có điểm hỏng chung là ổ đĩa và quyền xóa. Cần đánh giá tính độc lập, bảo vệ bản sao và thử phục hồi từ các tình huống mất tài nguyên tương ứng.')
])
extra('services',2,'Defense in depth','Kết hợp nhiều lớp kiểm soát để một lớp thất bại không làm mất mọi bảo vệ.','Phân quyền, nhật ký bảo vệ và backup độc lập cùng hỗ trợ hệ thống.','Nhiều lớp cùng chung một điểm hỏng chưa tạo tính độc lập.')

guide('keys', [
(5, '''Viết mô hình C=E_K(P), P=D_K(C) để thấy thuật toán, khóa và dữ liệu là các đối tượng khác nhau. Điều kiện đúng chức năng là D_K(E_K(P))=P với đầu vào hợp lệ; điều kiện này chưa nói gì về khả năng đối thủ đoán P hoặc K. Một phép XOR với khóa toàn số 0 vẫn đảo được nhưng không che gì.

Encoding thay biểu diễn để truyền/lưu; Encryption nhằm bảo vệ bí mật theo khóa và mô hình đối thủ. Base64 thường làm dữ liệu trông khó đọc nhưng không có bí mật cần biết để đảo. Cùng một thông điệp Unicode có thể được biểu diễn bằng byte khác nhau; trước khi mã hóa/ký/băm cần biết rõ encoding và ranh giới dữ liệu.''',
'Theo dấu một chuỗi qua ba lớp',[
'Chuyển văn bản sang UTF-8 để có byte; ghi rõ có newline hay không.',
'Mã hóa các byte bằng thuật toán, khóa và tham số đã chọn để tạo bản mã.',
'Nếu cần đưa bản mã vào JSON, dùng Base64 như lớp biểu diễn ngoài. Giải Base64 mới chỉ lấy lại bản mã, chưa giải mã.'],
'Một token chỉ chứa Base64(username:password). Vì sao đổi tên trường thành encryptedToken không tạo an toàn?',
'Tên trường không thay phép biến đổi. Base64 đảo được theo quy tắc công khai; nếu ai đọc token thì cũng lấy lại được thông tin. Phải phân biệt cơ chế thật với tên gọi.'),
(11, '''Trong Symmetric encryption, hai phía cần thống nhất khóa bí mật cùng tham số; việc giữ bí mật phải áp dụng cho mọi bản sao của khóa. Trong Asymmetric encryption, cặp khóa có chức năng liên quan nhưng vai trò khác nhau. Hệ hỗ trợ mã hóa thường mã hóa cho người nhận bằng khóa công khai của họ; người nhận dùng khóa riêng để giải mã.

Không phải mọi public-key algorithm đều cung cấp mã hóa, thỏa thuận khóa và chữ ký cùng lúc. DH là thỏa thuận khóa; RSA có các lược đồ mã hóa/chữ ký riêng; một hệ chữ ký như Ed25519 không được dùng như phép mã hóa. Khi đọc một API, cần xác định primitive/lược đồ và kiểu đối tượng khóa trước khi suy từ “có hai khóa” ra thao tác.''',
'Gửi riêng một tệp cho Bob',[
'Alice xác minh khóa công khai của Bob; không lấy khóa công khai của Alice để bảo vệ thông điệp cho Bob.',
'Dùng cơ chế mã hóa lai: khóa dữ liệu ngẫu nhiên bảo vệ tệp, cơ chế công khai bảo vệ/thiết lập khóa đó.',
'Nếu cần chứng minh Alice là người gửi, bổ sung xác thực/chữ ký theo thiết kế; ai có khóa công khai Bob cũng có thể gửi bản mã cho Bob.'],
'Bản mã chỉ Bob giải mã được có chứng minh Alice tạo nó không?',
'Không. Khóa mã hóa công khai cho phép nhiều người tạo bản mã cho Bob. Bí mật với người nhận và xác thực người gửi là hai yêu cầu khác nhau.'),
(6, '''Key distribution, lưu trữ, sử dụng, thay và hủy khóa là cả một vòng đời. CSPRNG phục vụ sinh bí mật phải phù hợp mục đích mật mã; một hàm random dùng cho mô phỏng hoặc xáo bài không đủ để mặc định tạo khóa thật. Độ dài đầu ra không bù được seed dễ đoán.

Key rotation phải xác định thời điểm, phiên bản khóa và cách xử lý dữ liệu cũ. Lộ khóa yêu cầu đánh giá những bản mã đã được đối thủ ghi giữ; đổi khóa cho dữ liệu mới không tự che lại lịch sử. Mất khóa cũng có thể làm dữ liệu mã hóa và backup không đọc được, nên phục hồi khóa phải được thiết kế cùng phục hồi dữ liệu.''',
'Thiết kế metadata tối thiểu cho tệp mã hóa',[
'Lưu phiên bản định dạng, định danh thuật toán, key ID và tham số công khai cần giải mã; không đưa khóa bí mật vào metadata công khai.',
'Khi đổi khóa, ghi nhận dữ liệu nào còn dùng khóa cũ và ai được quyền giải mã; kiểm một tệp cũ sau khi đổi.',
'Thử mất một bản khóa và phục hồi theo chính sách. Kiểm quyền truy cập khóa, không chỉ quyền đọc bản mã.'],
'Lưu một tệp mã hóa và khóa trong hai thư mục cùng tài khoản đọc được có đủ bảo vệ khi tài khoản bị chiếm không?',
'Không theo mô hình đối thủ có quyền đọc cả hai thư mục. Tách vị trí vật lý/tên thư mục chưa đồng nghĩa tách quyền hay miền tin cậy.')
])
extra('keys',2,'CSPRNG','Bộ sinh số giả ngẫu nhiên có tính chất phù hợp cho mục đích mật mã theo giả định của thiết kế.','Sinh khóa dữ liệu mới bằng nguồn ngẫu nhiên mật mã của hệ điều hành.','Không suy một hàm random thông thường là CSPRNG chỉ vì kết quả trông ngẫu nhiên.')
extra('keys',2,'Key rotation','Quy trình thay khóa theo phiên bản, thời điểm và chính sách xử lý dữ liệu liên quan.','Tạo key ID mới và kiểm việc đọc dữ liệu còn dùng khóa trước.','Đổi khóa tương lai không thu hồi dữ liệu mà người khác đã giải mã.')

guide('hybrid', [
(14, '''Trong mã hóa lai, tách data plane khỏi cơ chế bảo vệ khóa. Một khóa dữ liệu ngẫu nhiên bảo vệ nội dung lớn bằng mật mã đối xứng; public-key mechanism giải quyết thiết lập hoặc vận chuyển vật liệu khóa. RSA-OAEP vận chuyển một bí mật nhỏ là một cách; ECDHE tạo bí mật chung là cách khác, không phải cùng một thao tác.

Envelope encryption là cách tổ chức lưu trữ: dữ liệu dùng data key, data key được bảo vệ bởi khóa khác và lưu cùng metadata cần thiết. Thay khóa bọc có thể không đòi mã hóa lại toàn bộ dữ liệu nếu mô hình cho phép, nhưng phải xét ai từng biết data key. Cần xác thực cả nội dung và metadata quan trọng để không tráo key ID hoặc ngữ cảnh.''',
'Tệp 1 GiB và khóa dữ liệu 32 byte',[
'Sinh data key mới và dùng một cơ chế mã hóa xác thực phù hợp cho dữ liệu; đặc tả nonce và metadata được xác thực.',
'Bảo vệ data key cho người nhận, chẳng hạn RSA-OAEP với tham số tương thích và kích thước đầu vào cho phép.',
'Lưu bản mã, khóa đã bọc và metadata thành một định dạng kiểm chứng được. Giải mã theo thứ tự kiểm điều kiện, khôi phục khóa rồi xác thực dữ liệu.'],
'Vì sao không chia tệp thành các khối nhỏ rồi RSA-encrypt từng khối độc lập?',
'Chi phí cao và việc chia độc lập chưa ràng buộc thứ tự, số lượng hay phiên bản khối; cần một lược đồ hoàn chỉnh. Mã hóa lai giải quyết dữ liệu lớn bằng cơ chế đối xứng được thiết kế cho mục đích đó.'),
(18, '''Một Certificate chứa thông tin ràng buộc khóa công khai với danh tính/thuộc tính theo cấu trúc được issuer ký. Bộ kiểm chứng cần xây chuỗi tới Trust anchor đã tin và kiểm các điều kiện thích hợp. Tự ký một certificate không tự khiến mọi client tin; đó mới là một đối tượng có thể kiểm chữ ký bằng chính khóa tương ứng.

Fingerprint phụ thuộc byte/định dạng khóa được băm. Hai biểu diễn khác nhau của cùng thành phần toán học có thể có fingerprint khác nếu phép tính dùng byte khác. Xác nhận fingerprint qua một kênh độc lập giúp chống thay khóa; đọc fingerprint do chính kẻ thay khóa đưa qua cùng kênh không bổ sung niềm tin.''',
'Kiểm khóa cho một máy chủ được chỉ định',[
'Xác định tên dịch vụ mong muốn từ ngữ cảnh đáng tin, không lấy tên do certificate bất kỳ tự quảng cáo làm mục tiêu.',
'Kiểm chuỗi, chữ ký và điều kiện dùng certificate; chữ ký hợp lệ của một certificate cho tên khác không đáp ứng yêu cầu.',
'Nếu dùng fingerprint thủ công, thống nhất dạng khóa/hash và xác nhận qua kênh đã tin trước.'],
'Certificate có chữ ký đúng nhưng mang tên máy chủ khác. Có được bỏ qua vì public key vẫn “hợp lệ” không?',
'Không. Phép kiểm toán học và ràng buộc danh tính dịch vụ là hai điều phải cùng thỏa. Nếu mục tiêu tên sai, client chưa xác thực được đúng máy chủ mong muốn.'),
(16, '''MITM thành công khi thay khóa hoặc thông tin thiết lập mà hai bên không phát hiện. Việc trao đổi bản mã sau đó vẫn có thể chạy rất trơn tru vì đối thủ giữ hai phiên riêng và chuyển tiếp dữ liệu. Đừng dùng việc “giải mã được” làm chứng cứ duy nhất rằng đã nói chuyện đúng người.

Niềm tin cần điểm khởi đầu: một khóa đã pin, fingerprint xác nhận qua kênh độc lập, hay tập trust anchor đã cấu hình. Khi thay khóa phải có chính sách kiểm lại; bấm chấp nhận mọi cảnh báo làm mất ý nghĩa kiểm. PKI/Key ring hỗ trợ quản lý nhưng không loại bỏ mọi quyết định tin cậy và trách nhiệm bảo vệ khóa riêng.''',
'So mô hình khóa bị thay ở ba vị trí',[
'Danh bạ công khai bị thay: người gửi có thể mã hóa cho đối thủ; cần xác thực kết quả tra cứu.',
'Kho trust anchor bị thêm khóa lạ: nhiều certificate do khóa đó ký có thể được chấp nhận theo cấu hình sai.',
'Máy người nhận bị chiếm sau giải mã: bảo vệ đường truyền không tự che bản rõ đang ở đầu cuối đó.'],
'Hai đầu nhìn thấy biểu tượng khóa và dữ liệu được mã hóa. Vì sao vẫn phải hỏi “khóa của ai”?',
'Mã hóa tới khóa do đối thủ cung cấp có thể giữ bí mật với người ngoài nhưng trao bản rõ cho chính đối thủ. Xác thực khóa và danh tính là phần thiết yếu của thiết kế.')
])
extra('hybrid',0,'Envelope encryption','Tổ chức mã hóa dữ liệu bằng data key và bảo vệ data key bằng một khóa/cơ chế khác.','Bản mã tệp lưu cùng data key đã bọc và key ID.','Metadata và quyền giải bọc vẫn cần kiểm soát, không chỉ tệp dữ liệu.')
extra('hybrid',1,'Certificate chain','Chuỗi chứng chỉ nối khóa chủ thể qua các issuer tới điểm tin cậy đã cấu hình.','Client dựng đường kiểm chứng certificate của dịch vụ tới trust anchor.','Có chuỗi chữ ký toán học đúng chưa đủ nếu tên hoặc điều kiện dùng không khớp.')

guide('sign-intro', [
(19, '''Hãy so ba giao diện: H(M) không cần bí mật; MAC(K,M) cần khóa chung; Sign(sk,M) dùng khóa riêng và Verify(pk,M,S) dùng khóa công khai. Phần kiểm chứng của chữ ký không có nghĩa khôi phục bản rõ từ mọi thuật toán ký. Thông điệp thường vẫn được gửi công khai cùng chữ ký nên đừng nhầm chữ ký với Confidentiality.

Ai được tạo và ai được kiểm là câu hỏi thiết kế quan trọng. Bên nào giữ khóa MAC cũng có thể tạo tag, còn public key cho phép nhiều bên kiểm chữ ký mà không cấp cho họ khả năng ký. Với cả hai, khóa phải được gắn đúng đối tượng và dữ liệu đầu vào phải được đặc tả chính xác.''',
'Chọn công cụ cho ba nhu cầu',[
'Phát hiện tệp tải sai khi đã có digest tin cậy: hash có thể phù hợp với yêu cầu này.',
'Hai hệ thống cùng bí mật chung cần kiểm bản tin: MAC là thành phần phù hợp, kèm chống phát lại theo giao thức.',
'Nhiều người cần kiểm bản phát hành mà không được ký thay nhà phát hành: chữ ký công khai phù hợp hơn khóa MAC chia sẻ cho tất cả.'],
'Công bố khóa MAC để ai cũng kiểm được tag có biến MAC thành chữ ký không?',
'Không. Khi khóa MAC công khai, ai cũng tạo được tag. Chữ ký cần cấu trúc phân biệt năng lực tạo bằng khóa riêng và năng lực kiểm bằng khóa công khai.'),
(19, '''Cách nói “mã hóa bằng private key” chỉ gợi trực giác cho phép toán RSA thô, không phải định nghĩa chữ ký số. Lược đồ ký thực tế xử lý hash, encoding, salt/tham số và kiểm tra nghiêm ngặt. Dùng nhầm padding mã hóa cho ký hoặc tự ghép hash với phép lũy thừa không tạo thành một lược đồ chữ ký an toàn.

Verification trả một quyết định hợp lệ/không hợp lệ đối với byte, chữ ký, khóa và tham số đã đưa vào. Quyết định đó chưa chứng minh danh tính nếu public key được lấy từ nguồn tùy ý. Nó cũng không chứng minh nội dung là sự thật, người ký có quyền phê duyệt hay giao dịch vẫn mới.''',
'Theo dấu chữ ký trên một tài liệu',[
'Xác định byte gốc, hàm băm và lược đồ ký, chẳng hạn RSASSA-PSS; không tự chọn cách ghép dữ liệu.',
'Dùng private key để ký; giữ public key/chứng chỉ để bên nhận xác thực nguồn khóa và kiểm.',
'Thay một byte tài liệu, dùng sai khóa và thay tham số để thử trường hợp từ chối, không chỉ thử một ca thành công.'],
'Hai chữ ký khác nhau trên cùng tài liệu có nhất thiết một bản giả không?',
'Không. Lược đồ ngẫu nhiên như PSS có thể tạo nhiều chữ ký hợp lệ cho cùng byte. Phải chạy Verify theo tham số đúng thay vì so chữ ký với một mẫu duy nhất.'),
(21, '''Chữ ký cần ràng buộc ngữ cảnh: cùng số tiền nhưng khác tài khoản nhận là giao dịch khác. Domain separation giúp ngăn cùng byte bị diễn giải như bằng chứng cho hai mục đích khác nhau bằng cách phân biệt mục đích/miền sử dụng theo giao thức. Serialization phải xác định ranh giới trường để tránh hai cấu trúc cùng tạo một chuỗi ghép.

Chống Replay attack cần dữ liệu mới và trạng thái kiểm. Một timestamp chỉ hữu ích khi có quy tắc cửa sổ thời gian, đồng hồ và phát hiện dùng lại phù hợp; một nonce chỉ hữu ích khi được gắn đúng đối tượng và kiểm đã dùng. Ký một chuỗi không nhập nhằng là cần thiết nhưng vẫn chưa thay thế Authorization và xử lý nguyên tử ở máy chủ.''',
'Thông điệp ký có cấu trúc',[
'Định nghĩa mục đích transfer-v1, người gửi, người nhận, amount, currency, transaction ID và nonce theo một encoding rõ ràng.',
'Ký toàn bộ cấu trúc byte và kiểm cùng cấu trúc ở bên nhận; không chỉ ký chuỗi số tiền hiển thị.',
'Sau Verify, kiểm quyền và trạng thái chưa xử lý; chỉ hoàn thành khi cả kiểm mật mã lẫn nghiệp vụ đều đạt.'],
'Ghép hai trường bằng phép nối không có độ dài: (ab,c) và (a,bc). Vấn đề nằm ở hash hay ở định dạng?',
'Cả hai ghép thành abc trước khi hash, nên không cần tìm collision của hash. Lỗi nằm ở serialization không phân biệt ranh giới trường; phải dùng encoding có cấu trúc hoặc độ dài rõ ràng.')
])
extra('sign-intro',2,'Domain separation','Phân biệt mục đích/ngữ cảnh dùng dữ liệu hoặc khóa để tránh dùng chéo bằng chứng giữa các miền.','Gắn loại giao dịch và phiên bản vào thông điệp được ký.','Một tiền tố tùy tiện chưa thay thế đặc tả định dạng và giao thức đầy đủ.')
