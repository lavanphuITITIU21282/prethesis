"""Rebuild the authored Vietnamese course, diagrams and selected source slides.
Runtime needs only Node; Python + PyMuPDF is needed only to regenerate content.
"""
import json
from pathlib import Path
from html import escape
import pymupdf

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'public/data'
ASSETS = ROOT / 'public/assets'
DATA.mkdir(parents=True, exist_ok=True)
(ASSETS / 'diagrams').mkdir(parents=True, exist_ok=True)
(ASSETS / 'slides').mkdir(parents=True, exist_ok=True)
modules = [
 {'id':'foundation','number':'01','title':'Nền tảng an toàn thông tin','subtitle':'Hiểu mình bảo vệ điều gì','color':'teal','icon':'shield'},
 {'id':'applied','number':'02','title':'Mật mã trong thực tế','subtitle':'Từ chiếc khóa đến niềm tin','color':'blue','icon':'key'},
 {'id':'symmetric','number':'03','title':'Mã hóa khóa bí mật','subtitle':'Nhìn thấy cách dữ liệu biến đổi','color':'amber','icon':'lock'},
 {'id':'hash','number':'04','title':'Hàm băm & xác thực','subtitle':'Dấu vân tay của dữ liệu','color':'purple','icon':'fingerprint'},
 {'id':'public','number':'05','title':'Mật mã khóa công khai','subtitle':'Toán học, chữ ký và giao thức','color':'rose','icon':'network'}
]
lessons=[]
terms=[]
def add(id, module, title, summary, source, pages, flow, sections, rows, challenge, solution):
    local=[]
    for line in rows.strip().splitlines():
        parts=line.replace('||','∥').split('|')
        assert len(parts)==5,(id,line)
        name, vi, definition, scenario, pitfall = parts
        tid=f'{id}-t{len(local)+1}'
        terms.append(dict(id=tid,lesson=id,module=module,name=name,vi=vi,definition=definition,scenario=scenario,pitfall=pitfall))
        local.append(tid)
    blocks=[]
    for block in sections.strip().split('\n\n'):
        heading,body=block.split('\n',1)
        blocks.append(dict(title=heading,body=body))
    points=[3,3,2,2]
    rubric=[dict(text=v,points=points[i]) for i,v in enumerate(solution)]
    lessons.append(dict(id=id,module=module,title=title,summary=summary,minutes=8+len(blocks),source=source,pages=pages,terms=local,sections=blocks,flow=flow,challenge=dict(id=id+'-boss',title='Thử thách chuyên sâu',prompt=challenge,rubric=rubric),diagram=f'/assets/diagrams/{id}.svg',slide=f'/assets/slides/{id}.webp',slidePage=pages[0]))

add('cia','foundation','Ba mục tiêu, sáu kiểu mất mát','Phân loại một sự cố bằng CIA và DAD, thay vì gọi chung là “bị hack”.','source-2',[9,10,11,12],['Dữ liệu của bạn','Bí mật · Toàn vẹn','Sẵn sàng'],'''
CIA: ba câu hỏi trước mọi giải pháp
Confidentiality hỏi ai được phép đọc. Integrity hỏi dữ liệu và hệ thống có còn đúng như được cho phép hay không. Availability hỏi người có quyền có sử dụng được dịch vụ đúng lúc hay không. Một hồ sơ bệnh án cần cả ba: che thông tin với người lạ, giữ đúng liều thuốc và truy cập được trong ca cấp cứu. Mã hóa tập tin hỗ trợ bí mật nhưng không tự tạo bản sao dự phòng hay ngăn người có quyền sửa sai.

DAD: nhìn sự cố qua hậu quả
Disclosure là lộ dữ liệu, đối ứng với bí mật. Alteration là thay đổi trái phép hoặc ngoài ý muốn, đối ứng với toàn vẹn. Destruction là phá hủy hoặc làm tài nguyên không dùng được, đối ứng với sẵn sàng. Một sự cố có thể thuộc nhiều nhóm: ransomware vừa làm ngừng dịch vụ, vừa sửa dữ liệu và có thể đánh cắp bản sao. Hãy liệt kê bằng chứng cho từng hậu quả thay vì ép sự cố vào một nhãn duy nhất.

Ví dụ có ranh giới rõ ràng
Máy chủ vẫn trả lời HTTP 200 nhưng xuất số dư sai: tính sẵn sàng về kết nối còn đó, toàn vẹn nghiệp vụ đã mất. Nhân viên được quyền đọc hồ sơ nhưng công khai chúng lên mạng gây mất bí mật. Privacy liên quan việc sử dụng dữ liệu cá nhân đúng mục đích; một hệ thống có kiểm soát truy cập vẫn có thể xử lý dữ liệu vượt mục đích. Reliability là độ tin cậy khi vận hành, liên quan nhưng không thay thế ba mục tiêu CIA.
''','''
Confidentiality|Tính bí mật|Chỉ chủ thể được phép mới được tiếp cận thông tin.|Hồ sơ vẫn tồn tại nhưng người ngoài đọc được bản sao.|Mã hóa không ngăn một tài khoản hợp lệ cố tình làm lộ dữ liệu.
Integrity|Tính toàn vẹn|Giữ dữ liệu và hoạt động hệ thống khỏi sửa đổi hoặc phá hủy không được phép.|Số tài khoản nhận tiền bị đổi dù website vẫn hoạt động.|Một bản băm không có nguồn đáng tin chưa chứng minh tính xác thực.
Availability|Tính sẵn sàng|Bảo đảm người được phép truy cập và sử dụng tài nguyên kịp thời.|Người dùng hợp lệ không truy cập được lịch khám đúng lúc.|Có dữ liệu mã hóa chưa đồng nghĩa có thể phục hồi khi mất khóa.
Disclosure|Sự tiết lộ|Sự kiện thông tin bị thực thể không có quyền tiếp cận.|Một bản sao cơ sở dữ liệu bị đăng công khai.|Không cần thay đổi tập tin vẫn gây sự cố bảo mật.
Alteration|Sự sửa đổi|Thay đổi dữ liệu trái phép hoặc ngoài ý muốn.|Một lỗi phần mềm thay liều thuốc trong hồ sơ.|Lỗi vô ý vẫn có thể làm mất toàn vẹn.
Destruction|Sự phá hủy|Làm hỏng hoặc khiến tài nguyên không còn sử dụng được.|Ổ lưu trữ duy nhất bị xóa và không có bản phục hồi.|Đánh giá ảnh hưởng cả thời gian ngừng hoạt động.
Privacy|Quyền riêng tư|Kiểm soát việc thu thập và sử dụng thông tin cá nhân theo mục đích phù hợp.|Ứng dụng chia sẻ lịch sử cá nhân vượt mục đích đã thỏa thuận.|Giữ kín dữ liệu không tự bảo đảm sử dụng dữ liệu đúng mục đích.
Reliability|Độ tin cậy|Khả năng hệ thống hoạt động nhất quán và đúng như mong đợi.|Dịch vụ liên tục trả kết quả không ổn định qua các lần gọi.|Độ tin cậy và tính sẵn sàng có liên quan nhưng không đồng nhất.
''','Một bệnh viện mã hóa hồ sơ, lưu khóa cùng ổ đĩa, có backup mỗi 24 giờ. Kẻ tấn công lấy khóa, sửa liều thuốc rồi khóa máy chủ 6 giờ. Phân loại từng tổn thất theo CIA/DAD, xác định giới hạn của mã hóa, đề xuất thứ tự phục hồi và chỉ số kiểm chứng.',[
'Lộ khóa và đọc hồ sơ: confidentiality/disclosure; sửa liều: integrity/alteration; khóa dịch vụ: availability/destruction hoặc gián đoạn. Một sự cố có nhiều hậu quả.',
'Mã hóa không ngăn sửa đổi, lộ khóa hoặc mất dịch vụ. Tách quản lý khóa, phân quyền và xác thực toàn vẹn bản sao; khóa bị lộ cần thay và điều tra dữ liệu đã lộ.',
'Ưu tiên quy trình khám an toàn và nguồn hồ sơ đã kiểm chứng; cách ly máy bị xâm nhập, phục hồi từ mốc sạch và kiểm tra trước khi mở lại.',
'Đo thời gian phục hồi, mất dữ liệu tối đa 24 giờ theo lịch backup, kiểm thử khôi phục và đối chiếu hồ sơ; không suy ra backup chắc chắn sạch chỉ vì có mã hóa.'
])

add('aaa','foundation','Danh tính, quyền và trách nhiệm','Tách việc “bạn là ai” khỏi việc “bạn được làm gì”.','source-2',[13,21],['Khai danh tính','Chứng minh · Cấp quyền','Nhật ký · Truy vết'],'''
Năm bước dễ bị trộn lẫn
Identification là khai danh tính, như nhập tên tài khoản. Authentication là chứng minh lời khai bằng mật khẩu, khóa riêng hoặc yếu tố khác. Authorization quyết định danh tính đã xác thực được truy cập tài nguyên nào, với hành động nào. Đăng nhập thành công không có nghĩa được đọc mọi hồ sơ. Một yêu cầu phải được kiểm tra quyền ở máy chủ tại thời điểm truy cập, kể cả khi nút bấm đã bị ẩn trên giao diện.

Nhật ký có ích khi gắn với hành động
Auditing ghi sự kiện: ai yêu cầu gì, lúc nào, kết quả ra sao và trên tài nguyên nào. Accounting/accountability dùng bằng chứng để đối soát và quy trách nhiệm. Tài khoản chung làm mất khả năng gắn hành động với cá nhân. Nhật ký cũng cần đồng bộ thời gian, giới hạn người được sửa và kiểm soát dữ liệu nhạy cảm. Chỉ ghi “login OK” không giải thích được ai đã tải một nghìn hồ sơ.

Xác thực đúng đối tượng
Peer entity authentication xác thực thực thể đang tham gia kết nối. Data origin authentication xác thực nguồn của một thông điệp. Một thông điệp có MAC hợp lệ có thể là bản tin cũ; cần thêm số thứ tự hoặc thử thách mới để phát hiện phát lại. Với nhiều người dùng, cấp quyền tối thiểu cần thiết và rà soát quyền khi vai trò thay đổi. Các quá trình này hỗ trợ nhau nhưng không thay thế nhau.
''','''
Identification|Định danh|Khai báo một danh tính muốn sử dụng trong hệ thống.|Người dùng nhập tên tài khoản vào biểu mẫu.|Nhập đúng tên chưa chứng minh quyền sở hữu tài khoản.
Authentication|Xác thực|Kiểm chứng chủ thể đúng là danh tính đang khai báo.|Máy chủ kiểm tra bằng chứng sở hữu khóa riêng của tài khoản.|Xác thực thành công chưa cấp mọi quyền.
Authorization|Cấp quyền|Quyết định hành động nào được cho phép trên tài nguyên cụ thể.|Bác sĩ đăng nhập được nhưng chỉ được đọc hồ sơ được phân công.|Ẩn nút trên giao diện không thay kiểm tra quyền ở máy chủ.
Auditing|Ghi nhận kiểm toán|Ghi lại sự kiện và hành động liên quan đến hệ thống.|Nhật ký lưu người tải hồ sơ, thời điểm và kết quả.|Nhật ký có thể bị sửa nếu thiếu bảo vệ.
Accountability|Khả năng quy trách nhiệm|Dùng bằng chứng để gắn hành động với chủ thể và kiểm tra tuân thủ.|Đối soát nhật ký để xác định tài khoản đã phê duyệt giao dịch.|Tài khoản dùng chung làm yếu bằng chứng cá nhân.
Peer entity authentication|Xác thực thực thể ngang hàng|Xác minh danh tính thực thể tham gia phiên giao tiếp.|Một đầu kết nối chứng minh danh tính trong lúc thiết lập phiên.|Không tự bảo đảm mọi thông điệp mới và chưa bị phát lại.
Data origin authentication|Xác thực nguồn dữ liệu|Bảo đảm thông điệp đến từ nguồn được xác nhận.|Bên nhận kiểm tra bằng chứng nguồn gốc của một bản tin.|Chứng minh nguồn chưa chứng minh tính mới của thông điệp.
''','Một API có token hợp lệ, chỉ ẩn nút admin trên UI, dùng chung tài khoản trực ca và log chỉ ghi HTTP 200. Thiết kế lại năm bước kiểm soát; giải thích điều gì vẫn không thể kết luận từ log và cách chặn phát lại yêu cầu chuyển tiền.',[
'Token thuộc authentication, quyền trên từng tài nguyên thuộc authorization; kiểm tra phía máy chủ trên mọi yêu cầu và từ chối mặc định khi thiếu quyền.',
'Định danh cá nhân, tránh tài khoản chung; log chủ thể, tài nguyên, hành động, kết quả, thời điểm, mã yêu cầu; bảo vệ log và tránh ghi token bí mật.',
'HTTP 200 không chứng minh đúng người hay đúng nghiệp vụ; muốn quy trách nhiệm phải có danh tính, liên kết sự kiện và bằng chứng log nguyên vẹn.',
'Gắn nonce hoặc số thứ tự với nội dung đã xác thực; lưu trạng thái đã dùng và kiểm tra nguyên tử để ngăn phát lại, kể cả khi chữ ký/token còn hợp lệ.'
])

add('risk','foundation','Tài sản, mối đe dọa và rủi ro','Lập luận từ điểm yếu đến tác động và rủi ro còn lại.','source-2',[15,16,17,18],['Tài sản + Điểm yếu','Mối đe dọa → Tấn công','Biện pháp → Rủi ro còn'],'''
Từ vật cần bảo vệ đến hành vi gây hại
Asset có thể là dữ liệu, băng thông, thiết bị, phần mềm hoặc khả năng phục vụ. Vulnerability là điểm yếu có thể bị khai thác. Threat là khả năng gây hại; attack là hành vi hiện thực hóa mối đe dọa. Adversary là đối tượng gây hoặc có khả năng gây tấn công. Một cổng mở chỉ là quan sát kỹ thuật: muốn kết luận rủi ro cần biết dịch vụ, quyền truy cập, dữ liệu và hậu quả.

Phân loại tấn công theo hai trục
Passive attack tìm hiểu thông tin mà không thay đổi tài nguyên, ví dụ nghe lén. Active attack sửa đổi hoặc gây ảnh hưởng hoạt động, ví dụ chèn bản tin hay làm nghẽn dịch vụ. Insider/outsider mô tả nguồn phát sinh tương đối với biên bảo vệ, không mô tả mức độ nguy hiểm. Một người nội bộ có thể thực hiện cả hành vi chủ động và thụ động. “Bên trong LAN” không đủ làm bằng chứng được tin tưởng.

Rủi ro và giới hạn của biện pháp
Risk phụ thuộc khả năng xảy ra và mức tác động trong bối cảnh cụ thể. Biểu thức Threat × Vulnerability trong slide là mô hình khái quát, không phải công thức đo tiền mất chính xác. Countermeasure có thể phòng ngừa, phát hiện hoặc phục hồi. Sau khi triển khai vẫn còn residual risk do sai cấu hình, giới hạn kỹ thuật hoặc phần chưa xử lý. Security policy mô tả quy tắc cần tuân thủ; security violation là hành vi/sự kiện vi phạm quy tắc đó.
''','''
Asset|Tài sản|Tài nguyên có giá trị cần được bảo vệ.|Băng thông và khả năng nhận lịch khám cũng cần được giữ.|Tài sản không chỉ là tập tin hay phần cứng.
Vulnerability|Lỗ hổng hoặc điểm yếu|Yếu điểm có thể bị khai thác để thực hiện hành động không được phép.|Một API bỏ qua kiểm tra quyền trên hồ sơ.|Điểm yếu khác với hành vi khai thác điểm yếu.
Threat|Mối đe dọa|Khả năng gây hại cho tài sản bằng việc khai thác điểm yếu.|Nguy cơ có người lợi dụng tài khoản đã lộ.|Mối đe dọa có thể tồn tại trước khi tấn công xảy ra.
Attack|Cuộc tấn công|Hành vi thực hiện mối đe dọa lên tài sản hoặc hệ thống.|Một người thực sự gửi yêu cầu trái quyền để lấy dữ liệu.|Không đồng nghĩa với rủi ro dự kiến.
Adversary|Đối tượng đối kháng|Thực thể tấn công hoặc đe dọa hệ thống.|Người chủ động tìm cách chiếm quyền tài khoản.|Không suy ra danh tính thật chỉ từ địa chỉ IP.
Passive attack|Tấn công thụ động|Thu thập hoặc sử dụng thông tin mà không làm thay đổi tài nguyên hệ thống.|Nghe lén lưu lượng để suy ra thời gian hoạt động.|Không sửa dữ liệu vẫn có thể làm lộ bí mật.
Active attack|Tấn công chủ động|Thay đổi tài nguyên hoặc gây ảnh hưởng hoạt động hệ thống.|Chèn bản tin hoặc làm nghẽn dịch vụ.|Mã hóa đơn thuần không loại bỏ loại tấn công này.
Insider|Nguồn nội bộ|Chủ thể phát sinh từ bên trong biên bảo vệ được xét.|Tài khoản nhân viên lạm dụng quyền đang có.|Ở nội bộ không đồng nghĩa đáng tin tuyệt đối.
Outsider|Nguồn bên ngoài|Chủ thể phát sinh từ ngoài biên bảo vệ được xét.|Một máy bên ngoài tổ chức gửi yêu cầu tấn công.|Phân loại phụ thuộc biên hệ thống đang xét.
Risk|Rủi ro|Mức tổn thất dự kiến gắn với khả năng xảy ra và tác động trong bối cảnh.|Ưu tiên vá theo xác suất khai thác và thiệt hại nghiệp vụ.|Không thể tính chính xác chỉ từ số lỗ hổng.
Countermeasure|Biện pháp đối phó|Kiểm soát dùng để phòng ngừa, phát hiện hoặc phục hồi sau sự cố.|Backup có kiểm thử hỗ trợ khôi phục sau xóa dữ liệu.|Bản thân biện pháp có thể tạo thêm điểm yếu.
Residual risk|Rủi ro còn lại|Rủi ro vẫn tồn tại sau khi đã áp dụng kiểm soát.|Sau khi vá vẫn còn nguy cơ lỗi cấu hình và đánh cắp quyền.|Có kiểm soát không có nghĩa rủi ro bằng không.
Security policy|Chính sách an toàn|Tập quy tắc bảo vệ tài nguyên và cung cấp dịch vụ an toàn.|Tổ chức quy định vai trò nào được xuất dữ liệu.|Chính sách cần cơ chế thực thi và kiểm tra.
Security violation|Vi phạm an toàn|Hành vi hoặc sự kiện không tuân thủ chính sách an toàn.|Một tài khoản xuất dữ liệu ngoài phạm vi được quy định.|Vi phạm có thể do vô ý hoặc cố ý.
''','Một nhóm chỉ đủ ngân sách xử lý hai trong bốn vấn đề: API thiếu quyền, backup chưa thử, máy chủ chậm, khóa quản trị dùng chung. Xây mô hình ưu tiên có giả định, phân loại hai kiểu tấn công, đề xuất biện pháp và rủi ro còn lại. Không được dùng “vá hết” làm đáp án.',[
'Xác định tài sản, dữ liệu, người dùng, điểm yếu và tác động của từng vấn đề; nêu giả định về khả năng khai thác và thời gian gián đoạn.',
'Chọn ưu tiên có lập luận theo xác suất × tác động và phụ thuộc; thiếu dữ liệu có thể chọn đánh giá nhanh trước, không gán điểm giả làm đo lường thực.',
'Phân loại nghe lén là thụ động, sửa yêu cầu/DoS là chủ động; phân biệt nguồn nội bộ/ngoại bộ độc lập với hai loại trên.',
'Ghép phòng ngừa, phát hiện, phục hồi và nêu rủi ro còn lại, chủ sở hữu, thời hạn; backup chỉ hữu ích khi phục hồi kiểm chứng được.'
])

add('services','foundation','Dịch vụ và cơ chế bảo vệ','Chọn công cụ theo bảo đảm cần đạt, rồi kiểm tra phần còn thiếu.','source-2',[19,20,21,22,23],['Mục tiêu bảo vệ','Dịch vụ cần có','Cơ chế + Kiểm chứng'],'''
Dịch vụ trả lời “cần được bảo đảm gì”
Security service là bảo đảm an toàn cung cấp cho hệ thống hoặc trao đổi thông tin. Các ví dụ gồm xác thực, kiểm soát truy cập, bí mật dữ liệu, toàn vẹn dữ liệu, chống chối bỏ và sẵn sàng. Security mechanism là cách thực hiện: kiểm tra chữ ký, mã hóa, luật truy cập, nhật ký, backup. Một cơ chế có thể hỗ trợ nhiều dịch vụ, một dịch vụ có thể cần nhiều cơ chế.

Đừng suy rộng lời bảo đảm
Hash không khóa chỉ giúp phát hiện thay đổi khi giá trị đối chiếu đáng tin. MAC bổ sung xác thực giữa các bên có chung khóa, nhưng bên nào giữ khóa cũng có thể tạo MAC. Chữ ký có thể được kiểm chứng bằng khóa công khai; cần ràng buộc khóa với danh tính và bảo vệ khóa riêng. Nonrepudiation còn phụ thuộc chứng cứ, quy trình và ngữ cảnh, không tự xuất hiện chỉ vì có một chuỗi chữ ký.

Ghép cơ chế theo tình huống
Một cổng nộp bài cần mã hóa khi truyền, xác thực sinh viên, phân quyền lớp học, ghi thời gian và kiểm tra toàn vẹn bản nộp. Muốn tránh tranh chấp cần biên nhận và cách kiểm chứng bằng chứng. Muốn hệ thống hoạt động khi hỏng ổ đĩa cần dự phòng và quy trình khôi phục. Mỗi lựa chọn nên kèm một thử nghiệm cụ thể, như thử tải bản nộp bằng tài khoản lớp khác hoặc khôi phục một bản sao.
''','''
Security service|Dịch vụ an toàn|Bảo đảm an toàn cần cung cấp cho hệ thống hoặc giao tiếp.|Đặc tả yêu cầu dữ liệu truyền đến không bị sửa trái phép.|Không phải tên của một phần mềm cụ thể.
Security mechanism|Cơ chế an toàn|Quá trình hoặc thiết bị dùng để thực hiện dịch vụ an toàn.|Dùng kiểm tra MAC để thực hiện bảo đảm nguồn và toàn vẹn.|Một cơ chế không tự bao phủ mọi mục tiêu.
Access control|Kiểm soát truy cập|Giới hạn ai được thực hiện hành động gì trên tài nguyên.|Máy chủ từ chối sinh viên đọc bài nộp của lớp khác.|Kiểm tra ở phía trình duyệt là chưa đủ.
Nonrepudiation|Chống chối bỏ|Hỗ trợ bằng chứng để chủ thể khó phủ nhận hành vi hoặc thông điệp.|Hệ thống giữ bằng chứng chữ ký và biên nhận cho một giao dịch.|Cần bảo vệ khóa, danh tính và quy trình chứng cứ.
DoS|Từ chối dịch vụ|Làm suy giảm hoặc ngăn người hợp lệ sử dụng dịch vụ.|Tài nguyên xử lý cạn khiến lịch khám không truy cập được.|Không cần đọc được dữ liệu vẫn gây thiệt hại.
Prevention|Phòng ngừa|Giảm khả năng sự cố xảy ra trước khi nó diễn ra.|Kiểm tra quyền trước khi trả hồ sơ.|Không thay thế theo dõi phát hiện và phục hồi.
Detection|Phát hiện|Nhận biết hành vi hoặc trạng thái bất thường để xử lý.|Cảnh báo tải lượng lớn hồ sơ vào giờ bất thường.|Có cảnh báo không đồng nghĩa đã chặn sự cố.
Recovery|Phục hồi|Đưa dữ liệu và dịch vụ về trạng thái có thể sử dụng sau sự cố.|Khôi phục bản sao sạch và kiểm tra tính đúng trước khi mở dịch vụ.|Khôi phục nhanh nhưng dữ liệu sai vẫn chưa đạt mục tiêu.
''','Thiết kế cổng thi trực tuyến: bài nộp phải bí mật trước giờ mở, không sửa được sau hạn, có chứng cứ đã nộp và sống sót khi máy chủ hỏng. Lập bảng dịch vụ–cơ chế–giới hạn–phép thử; phân tích trường hợp quản trị viên gian lận.',[
'Bí mật: mã hóa và quản lý khóa theo thời điểm; toàn vẹn: hash có nguồn tin cậy/chữ ký; quyền: kiểm tra phía máy chủ. Chỉ hash công khai không bảo vệ nội dung.',
'Biên nhận ràng buộc danh tính, digest, thời gian và mã bài; chống chối bỏ cần khóa, thời gian đáng tin và chứng cứ lưu được ngoài máy chủ đang xét.',
'Dự phòng và backup kiểm thử; đo khả năng khôi phục và dữ liệu mất tối đa. Dịch vụ sẵn sàng cần kiểm thử hỏng thật trong môi trường kiểm soát.',
'Quản trị viên có thể thay log/khóa/thời gian nếu toàn quyền; phân tách trách nhiệm, lưu chứng cứ độc lập và mô tả mô hình tin cậy còn lại.'
])

add('keys','applied','Bản rõ, bản mã và hai họ khóa','Theo đường đi của dữ liệu để biết đúng khóa cần dùng.','source-3',[3,4,5,6,8,10,11],['Bản rõ + Khóa','Thuật toán mã hóa','Bản mã → Giải mã'],'''
Một phép mã hóa gồm những gì?
Plaintext là dữ liệu trước mã hóa, ciphertext là dữ liệu sau biến đổi. Encryption dùng thuật toán và khóa để tạo bản mã; decryption dùng khóa thích hợp để khôi phục bản rõ. Thuật toán được biết công khai không làm hệ thống mất an toàn nếu thiết kế mật mã vững và khóa được bảo vệ. Encoding như Base64 chỉ đổi biểu diễn; ai biết quy tắc đều đảo lại được, nên không tạo bí mật.

Khóa đối xứng và khóa bất đối xứng
Symmetric encryption dùng bí mật chung để mã hóa và giải mã, phù hợp xử lý dữ liệu lớn. Asymmetric encryption dùng cặp khóa có quan hệ toán học. Để gửi riêng cho Bob, Alice dùng khóa công khai của Bob; Bob giải mã bằng khóa riêng của mình. Đây là hướng dùng trong hệ mã công khai hỗ trợ mã hóa; không phải mọi hệ chữ ký đều dùng được để mã hóa.

Vấn đề nằm ở phân phối và vòng đời
Nếu gửi khóa đối xứng cùng bản mã qua cùng kênh bị nghe lén, bảo mật bị mất. Nếu lấy nhầm khóa công khai do kẻ giả mạo cung cấp, Alice sẽ mã hóa cho kẻ giả mạo. Cần tạo khóa bằng nguồn ngẫu nhiên phù hợp, lưu khóa, xác minh người sở hữu và thay khóa khi lộ. Độ dài khóa lớn không bù được việc cất khóa ở nơi mọi người đọc được.
''','''
Plaintext|Bản rõ|Dữ liệu đầu vào chưa được mã hóa trong phép xét.|Nội dung báo cáo trước khi đưa vào hàm mã hóa.|Bản rõ có thể là dữ liệu nhị phân chứ không chỉ văn bản.
Ciphertext|Bản mã|Kết quả của phép mã hóa dữ liệu bằng khóa.|Tập tin nhị phân sinh ra sau khi bảo vệ báo cáo bằng mật mã.|Chuỗi trông ngẫu nhiên chưa chứng minh đã được mã hóa an toàn.
Encryption|Mã hóa|Biến đổi bản rõ thành bản mã bằng thuật toán và khóa.|Người gửi biến báo cáo thành dạng cần khóa để đọc.|Không tự chứng minh người gửi hoặc ngăn phát lại.
Decryption|Giải mã|Khôi phục bản rõ từ bản mã với khóa thích hợp.|Người nhận dùng khóa của mình để đọc báo cáo đã mã hóa.|Giải mã ra dữ liệu chưa đồng nghĩa dữ liệu đã được xác thực.
Symmetric encryption|Mã hóa đối xứng|Phương pháp dùng bí mật chung cho mã hóa và giải mã.|Hai bên đã chia sẻ bí mật cần xử lý dữ liệu lớn.|Khó khăn quan trọng là phân phối bí mật chung.
Asymmetric encryption|Mã hóa bất đối xứng|Phương pháp mã hóa bằng khóa công khai và giải mã bằng khóa riêng tương ứng.|Người gửi chỉ cần khóa công khai đã xác minh của người nhận.|Không dùng khóa riêng để “mã hóa” như một mô tả chung cho chữ ký.
Public key|Khóa công khai|Thành phần cặp khóa có thể phân phối để kiểm chứng hoặc mã hóa tùy hệ.|Alice lấy khóa đã được xác minh của Bob để gửi bí mật.|Công khai không có nghĩa không cần xác thực chủ sở hữu.
Private key|Khóa riêng|Thành phần bí mật dùng giải mã hoặc ký tùy hệ mật mã.|Bob giữ thành phần cặp khóa cần để đọc bản mã gửi cho mình.|Không gửi thành phần bí mật cho người muốn xác minh chữ ký.
Encoding|Mã biểu diễn|Đổi cách biểu diễn dữ liệu theo quy tắc có thể đảo mà không cần bí mật.|Chuyển byte thành Base64 để đưa vào tập tin văn bản.|Base64 không cung cấp tính bí mật.
''','Alice gửi 5 GiB cho Bob bằng “mã hóa RSA bằng khóa riêng Alice”, rồi Base64 khóa lên email. Chỉ ra từng lỗi khái niệm; thiết kế lại luồng khóa, xác thực và xử lý khi khóa Bob bị thay trên danh bạ.',[
'Khóa riêng Alice không phải cách mã hóa riêng cho Bob; Base64 chỉ là biểu diễn. RSA không dùng trực tiếp cho tập tin 5 GiB.',
'Sinh khóa dữ liệu ngẫu nhiên, mã hóa dữ liệu bằng cơ chế xác thực đối xứng, bảo vệ khóa dữ liệu bằng khóa công khai đã xác minh của Bob.',
'Xác minh khóa Bob qua chứng chỉ hoặc fingerprint kênh độc lập; khi danh bạ đổi khóa phải kiểm chứng thay đổi trước khi gửi.',
'Nếu cần chứng minh Alice gửi, ký cấu trúc có ngữ cảnh và xác minh khóa Alice; nêu rõ xử lý mất/lộ khóa và bản dữ liệu đã phát hành.'
])

add('hybrid','applied','Mã hóa lai và niềm tin vào khóa','Một khóa phiên cho dữ liệu, một chuỗi kiểm chứng cho danh tính.','source-3',[13,14,15,16,17,18],['Xác minh khóa','Thỏa thuận khóa phiên','Mã hóa dữ liệu lớn'],'''
Vì sao kết hợp hai họ mật mã?
Hybrid encryption dùng mật mã công khai cho khâu thiết lập hoặc bảo vệ khóa và dùng mật mã đối xứng cho dữ liệu. Session key là khóa dùng trong một phiên hoặc phạm vi giới hạn. Không nên hiểu rằng mọi giao thức đều RSA-encrypt khóa phiên: ví dụ minh họa trong slide mô tả một cách vận chuyển khóa; các giao thức có thể dùng thỏa thuận khóa như ECDHE. Chi phí phụ thuộc thuật toán và triển khai, không có một hệ số tốc độ cố định cho mọi máy.

Khóa công khai cần gắn với danh tính
Fingerprint là giá trị băm nhận diện một khóa theo định dạng cụ thể. So sánh fingerprint qua cùng kênh đang bị giả mạo không thêm bảo đảm. Certificate ràng buộc khóa với thuộc tính của chủ thể bằng chữ ký của bên phát hành. Certificate Authority (CA) ký chứng chỉ theo chính sách; trust anchor là điểm bắt đầu mà bộ kiểm chứng đã được cấu hình tin. Có chữ ký trên chứng chỉ chưa đủ: còn cần chuỗi tin cậy, tên dịch vụ, thời hạn và các điều kiện sử dụng.

Đặt đúng giả định khi kiểm chứng
MITM có thể thay khóa nếu hai bên không xác thực nhau. Nếu dùng danh bạ khóa, cần quy trình kiểm tra fingerprint và thay khóa. Nếu dùng PKI, cần kiểm tra chuỗi chứng chỉ và tên mong muốn, không chỉ kiểm tra “chữ ký toán học hợp lệ”. Key ring là kho các khóa/chứng chỉ giúp quản lý và liên kết danh tính, nhưng việc nhập một khóa vào kho chưa chứng minh chủ sở hữu thật của nó.
''','''
Hybrid encryption|Mã hóa lai|Kết hợp mật mã công khai để thiết lập/bảo vệ khóa với mật mã đối xứng cho dữ liệu.|Một hệ thống dùng khóa công khai bảo vệ khóa dữ liệu rồi mã hóa tập tin lớn bằng AES.|Không nhất thiết luôn vận chuyển khóa bằng RSA.
Session key|Khóa phiên|Khóa có phạm vi sử dụng giới hạn cho một phiên hoặc tác vụ.|Hai bên dùng bí mật vừa thỏa thuận cho một phiên truyền dữ liệu.|Thay khóa phiên không tự xóa ảnh hưởng của lộ khóa cũ.
Fingerprint|Dấu vân tay khóa|Giá trị băm dùng nhận diện một khóa theo quy ước biểu diễn.|Hai người đọc giá trị nhận diện khóa qua một kênh độc lập để đối chiếu.|Cần kiểm chứng qua kênh đáng tin và cùng định dạng khóa.
Certificate|Chứng chỉ số|Cấu trúc được ký ràng buộc khóa công khai với thuộc tính chủ thể.|Máy chủ đưa ra bản ràng buộc tên dịch vụ và khóa được bên phát hành ký.|Phải kiểm tra tên, chuỗi tin cậy và thời hạn.
CA|Tổ chức chứng thực|Bên phát hành và ký chứng chỉ theo chính sách xác minh.|Một tổ chức được tin cậy ký ràng buộc tên miền và khóa công khai.|Tin CA không có nghĩa mọi chứng chỉ đều phù hợp mọi tên miền.
Trust anchor|Điểm neo tin cậy|Khóa hoặc thực thể gốc được cấu hình tin để bắt đầu kiểm tra chuỗi.|Bộ kiểm chứng bắt đầu từ chứng chỉ gốc được cài đặt tin cậy.|Chứng chỉ tự ký chưa tự tạo ra sự tin cậy.
MITM|Kẻ xen giữa|Tình huống đối tượng trung gian can thiệp giao tiếp và có thể giả hai đầu.|Danh bạ bị thay khóa khiến Alice gửi bí mật cho người giả Bob.|Thỏa thuận khóa thiếu xác thực vẫn có thể bị xen giữa.
PKI|Hạ tầng khóa công khai|Hệ thống chính sách và thành phần quản lý chứng chỉ, khóa và sự tin cậy.|Tổ chức quản lý phát hành, kiểm chứng và vòng đời chứng chỉ.|Không chỉ là một tập tin chứng chỉ đơn lẻ.
Key ring|Kho khóa|Tập hợp khóa và thông tin liên quan để quản lý việc sử dụng.|Phần mềm lưu nhiều khóa và chứng chỉ với nhãn chủ thể.|Nhãn tự đặt không chứng minh danh tính thật.
''','Bạn có chứng chỉ có chữ ký đúng, tên khác máy chủ, CA chưa tin và khóa vừa đổi. Thiết kế quyết định kết nối; so sánh vận chuyển khóa RSA với thỏa thuận ECDHE khi khóa riêng dài hạn bị lộ sau một năm.',[
'Tách kiểm tra chữ ký toán học khỏi chuỗi đến trust anchor, tên máy chủ và điều kiện hiệu lực; các lỗi nêu trong đề phải được xử lý trước khi tin khóa.',
'Thay khóa cần được xác minh qua chuỗi tin cậy hợp lệ hoặc kênh độc lập theo mô hình; không bỏ qua lỗi tên chỉ vì chữ ký đúng.',
'RSA vận chuyển khóa: nếu ghi lưu phiên và khóa giải mã dài hạn lộ, có thể khôi phục khóa phiên. ECDHE có khóa tạm thời được xóa đúng giúp forward secrecy.',
'Forward secrecy còn phụ thuộc sinh ngẫu nhiên, xóa bí mật tạm thời và giao thức; không bảo vệ bản rõ hay khóa phiên đã bị lấy ngay trong phiên.'
])

add('sign-intro','applied','Hash, MAC và chữ ký khác nhau ở đâu?','Chọn bằng chứng phù hợp với người cần kiểm tra.','source-3',[19,20,21,22],['Thông điệp','Hash · MAC · Chữ ký','Ai có thể kiểm chứng?'],'''
Ba công cụ trả lời ba câu khác nhau
Hash tạo digest cố định từ dữ liệu, không cần khóa. MAC dùng khóa chung để xác thực thông điệp giữa những bên giữ khóa. Digital signature dùng khóa riêng để tạo bằng chứng kiểm chứng bằng khóa công khai. Đừng gọi chung cả ba là “mã hóa”: chúng không tự che nội dung. Nếu cần vừa bí mật vừa xác thực, phải chọn cấu trúc hoặc giao thức kết hợp có thiết kế rõ.

Ký không đơn giản là đảo chiều mã hóa
Slide dùng cách nói “encrypt using private key” để trực giác hóa RSA. Hệ chữ ký thực tế có mã hóa thông điệp theo chuẩn riêng, hàm băm và kiểm tra nghiêm ngặt; RSA-PSS là một ví dụ. Nhiều hệ chữ ký không có phép mã hóa tương ứng. Người xác minh cần khóa công khai đã gắn đúng danh tính. Chữ ký đúng chứng minh tính tương thích với khóa, không tự chứng minh nội dung được ký là sự thật.

Bảo vệ đúng ngữ cảnh
Ký chỉ số tiền mà không ký tài khoản nhận có thể cho phép tráo ngữ cảnh giao dịch. Ký toàn bộ thông điệp có định dạng không nhập nhằng, mục đích, định danh phiên và cơ chế chống phát lại. Một chữ ký hợp lệ hôm qua có thể được gửi lại hôm nay nếu giao thức không kiểm tra tính mới. Bài tự luận nên luôn chỉ ra dữ liệu nào được bảo vệ và những giả định về khóa, thời gian, danh tính.
''','''
Digital signature|Chữ ký số|Bằng chứng tạo bằng khóa riêng và kiểm chứng bằng khóa công khai theo một lược đồ chữ ký.|Một đối tác cần bằng chứng có thể đưa cho bên thứ ba kiểm chứng.|Không phải một mô tả chung cho “mã hóa bằng khóa riêng”.
Signing|Tạo chữ ký|Thực hiện lược đồ ký bằng khóa riêng trên dữ liệu/ngữ cảnh xác định.|Bên gửi tạo bằng chứng cho giao dịch đã định dạng.|Phải biết chính xác byte và ngữ cảnh được ký.
Verification|Kiểm chứng|Kiểm tra bằng chứng với dữ liệu và khóa phù hợp.|Bên nhận dùng khóa công khai đã xác thực để kiểm tra chữ ký.|Hợp lệ về toán học chưa chứng minh khóa thuộc đúng người.
Authenticity|Tính xác thực|Bảo đảm chủ thể hoặc nguồn dữ liệu đúng như được nhận diện trong mô hình tin cậy.|Người nhận muốn biết bản cập nhật đến từ nhà phát hành đúng.|Không đồng nghĩa nội dung thông điệp luôn đúng sự thật.
Replay attack|Tấn công phát lại|Gửi lại dữ liệu xác thực cũ nhằm tạo hiệu lực trái ý muốn.|Một lệnh thanh toán ký đúng bị gửi lần thứ hai.|Chữ ký hợp lệ không tự bảo đảm tính mới.
''','Một đối tác muốn bằng chứng công khai cho hợp đồng, bí mật với người ngoài và không thể dùng lại chữ ký cho phụ lục khác. Thiết kế cấu trúc dữ liệu, thứ tự kiểm tra, vai trò hash/MAC/chữ ký và phản biện “hash là mã hóa một chiều”.',[
'Dùng chữ ký cho bằng chứng kiểm chứng công khai; hash tạo digest chứ không cung cấp bí mật; MAC chỉ các bên chung khóa kiểm tra/tạo được.',
'Ràng buộc loại văn bản, phiên bản, các bên, toàn bộ nội dung/phụ lục, định danh giao dịch; định dạng có phân tách độ dài hoặc chuẩn hóa rõ để tránh nhập nhằng.',
'Mã hóa nội dung cho người nhận theo giao thức được chọn; kiểm chứng khóa, tính toàn vẹn/xác thực rồi mới xử lý nghiệp vụ. Cách kết hợp phải được đặc tả nhất quán.',
'Chặn phát lại bằng định danh duy nhất và trạng thái đã xử lý; chữ ký không tự chống phát lại hay xác nhận nội dung là thật.'
])
