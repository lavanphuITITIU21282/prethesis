"""Detailed authored study guides. Stable lesson/section ids keep saved progress valid."""
import math

def guide(lesson_id, rows):
    lesson=next(l for l in lessons if l['id']==lesson_id)
    assert len(rows)==len(lesson['sections'])==3, lesson_id
    for index, row in enumerate(rows):
        page, paragraphs, example_title, steps, question, answer = row
        section=lesson['sections'][index]
        section['study']={
            'paragraphs':paragraphs.split('\n\n'),
            'example':{'title':example_title,'steps':steps},
            'checkpoint':{'question':question,'answer':answer},
            'references':[{'source':lesson['source'],'page':page}],
            'figure':f"/assets/source-pages/{lesson['source']}-p{page}.webp",
            'figureCaption':f"Hình nguồn cho phần {index+1}: {section['title']}",
        }
        if page not in lesson['pages']:lesson['pages'].append(page)
        words=len(' '.join([section['body'],paragraphs,example_title,*steps,question,answer]).split())
        section['minutes']=max(4,math.ceil(words/160)+2)
    lesson['minutes']=sum(s['minutes'] for s in lesson['sections'])

def extra(lesson_id,section_index,name,definition,scenario,pitfall):
    lesson=next(l for l in lessons if l['id']==lesson_id)
    # Names are fixed authoring input, never generated at runtime.
    slug=''.join(c.lower() if c.isalnum() else '-' for c in name).strip('-')
    term_id=f'{lesson_id}-extra-{slug}'
    assert not any(t['id']==term_id for t in terms),term_id
    terms.append(dict(id=term_id,lesson=lesson_id,module=lesson['module'],name=name,
        vi='',definition=definition,scenario=scenario,pitfall=pitfall))
    lesson['terms'].append(term_id)
    lesson['sections'][section_index]['terms'].append(term_id)

for filename in ['depth_foundation.py','depth_symmetric.py','depth_hash.py','depth_public.py']:
    exec(compile((ROOT/'scripts'/'content'/filename).read_text(encoding='utf-8'),str(ROOT/'scripts'/'content'/filename),'exec'),globals())

aes_lesson=next(l for l in lessons if l['id']=='aes')
aes_lesson['sections'][0]['study']['paragraphs'].append('DES dùng cấu trúc Feistel: Li=R(i−1), Ri=L(i−1)⊕F(R(i−1),Ki). Hai nửa khối đổi vai qua các round; giải dùng thứ tự round key đảo lại trong cấu trúc phù hợp. AES không phải Feistel: ShiftRows đổi vị trí hàng, MixColumns trộn byte trong cột và AddRoundKey XOR state với round key. Đây là kiến thức bổ sung để đọc thuật toán, tách với các mode ECB/CBC/CTR bên ngoài.')
dh_lesson=next(l for l in lessons if l['id']=='dh')
dh_lesson['sections'][2]['study']['paragraphs'].append('Trang 8 gợi cách biến ý tưởng DH thành mã hóa công khai. Trong mô hình ElGamal trên nhóm, người nhận có y=g^x; người gửi dùng số mũ mới r, tạo c1=g^r và c2=m·y^r. Người nhận dùng c1^x để bỏ mặt nạ nhóm. Mô hình toán học thô này có tính malleable và cần điều kiện/encoding, không là công thức lưu tệp tùy ý. IES kết hợp trao đổi khóa, KDF và cơ chế bảo vệ dữ liệu theo một lược đồ hoàn chỉnh.')
next(l for l in lessons if l['id']=='ctr')['sections'][2]['study']['paragraphs'].append('Quy tắc IV khác nhau theo mode trong SP 800-38A: CBC/CFB cần IV không đoán trước; OFB cần IV không lặp dưới cùng key; CTR cần mọi counter block không lặp dưới cùng key. IV/nonce công khai không có nghĩa được sửa tùy ý. Đừng lấy một quy tắc chung “IV bất kỳ là được” hoặc “mọi mode đều chỉ cần random” thay cho yêu cầu cụ thể.')
for row in [
('keys',2,'Key distribution','Quy trình đưa vật liệu khóa phù hợp tới các bên được phép sử dụng.','Xác thực khóa công khai hoặc thiết lập bí mật chung trước khi gửi dữ liệu.','Gửi khóa bí mật cạnh bản mã qua cùng kênh bị nghe lén không giải quyết vấn đề.'),
('aes',0,'S-box','Bảng thay thế phi tuyến được dùng trong một số thuật toán mật mã.','SubBytes của AES dùng S-box thay giá trị từng byte.','Không nhầm bảng thay giá trị với bước hoán vị vị trí.'),
('aes',0,'ShiftRows','Bước dịch vị trí byte trên các hàng state trong AES theo độ lệch quy định.','Đọc đường di chuyển byte giữa các cột trong sơ đồ AES.','Không thay thế chức năng phi tuyến của SubBytes.'),
('aes',0,'MixColumns','Bước trộn các byte trong từng cột state AES theo phép biến đổi được quy định.','Phân biệt round thông thường với round cuối của AES.','Vòng cuối AES bỏ MixColumns theo thuật toán, không có nghĩa mọi round đều bỏ.'),
('aes',0,'AddRoundKey','Bước XOR state với round key trong AES.','Theo dấu phần vật liệu khóa đi vào state sau một round.','Không phải vòng password KDF hoặc thao tác thêm ký tự mật khẩu.'),
('aes',0,'Feistel network','Cấu trúc mã khối chia state thành các nửa và kết hợp hàm vòng qua XOR/đổi vai.','Đọc công thức Li=R trước và Ri=L trước XOR F trong DES.','AES không dùng chính cấu trúc Feistel của DES.'),
('hash-properties',2,'Hamming distance','Số vị trí bit khác nhau giữa hai chuỗi bit cùng độ dài.','XOR hai digest rồi đếm bit1 để đo số bit đổi.','Số ký tự hex khác không bằng số bit khác.'),
('hash-algorithms',1,'Sponge rate','Phần trạng thái được dùng để hấp thụ dữ liệu hoặc lấy đầu ra trong sponge.','Phân biệt phần rate với capacity khi đọc sơ đồ SHA-3.','Kích thước rate không đồng nghĩa độ dài digest.'),
('hash-algorithms',1,'Sponge capacity','Phần trạng thái không trực tiếp trao đổi dữ liệu theo rate trong cấu trúc sponge.','Theo dấu cách chia state thành rate và capacity.','Không tự suy mức an toàn chỉ từ tổng số bit state.'),
('dh',2,'ElGamal encryption','Hệ mã công khai dựa trên phép toán nhóm và bí mật kiểu Diffie–Hellman.','Phân tích c1=g^r và c2=m nhân y^r trong mô hình nhóm học.','Mô hình thô có tính malleable; không tự mã hóa mọi tệp bằng công thức này.'),
('dh',2,'Integrated Encryption Scheme','Lược đồ kết hợp thiết lập khóa, dẫn xuất khóa và cơ chế bảo vệ dữ liệu.','Tách thành phần DH/KDF khỏi cơ chế đối xứng bảo vệ thông điệp.','Cần theo một đặc tả cụ thể, không tự ghép các primitive tùy ý.'),
]:extra(*row)

# Additional executable examples are explained token by token in the command page.
command('python-hash','hash-algorithms','Băm dữ liệu theo từng chunk trong Python','Python 3 · thư viện chuẩn',
"import hashlib\nh = hashlib.sha256()\nh.update(b'abc')\nprint(h.hexdigest())",
'Cần phân biệt byte đầu vào, trạng thái băm và cách biểu diễn digest.',
'In ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad.',
'Đây là hash không khóa, không xác thực người gửi; update nhiều lần nối byte chứ không băm riêng từng phần.',[
('import hashlib','Nạp thư viện băm của Python, chưa thực hiện mã hóa hoặc băm dữ liệu.'),
('hashlib.sha256()','Tạo đối tượng SHA-256 với trạng thái ban đầu, đầu ra 256 bit.'),
("h.update(b'abc')",'Đưa đúng ba byte ASCII abc vào trạng thái, không có newline.'),
('h.hexdigest()','Lấy digest dưới dạng 64 ký tự hex; không làm digest trở thành 512 bit.'),
('print(...)','In biểu diễn kết quả, không thay đổi dữ liệu đã được băm.')])
command('python-rsa-key','rsa','Sinh và xuất khóa RSA qua API','Python 3 · PyCryptodome',
"from Crypto.PublicKey import RSA\nkey = RSA.generate(2048)\npublic_pem = key.public_key().export_key(format='PEM')",
'Cần nhận biết đối tượng khóa riêng và phần công khai khi dùng API RSA.',
'key chứa thành phần riêng; public_pem là bytes PEM chỉ chứa phần công khai.',
'Ví dụ không lưu khóa riêng. Không đưa private key thật vào trang học; thư viện cần được cài trong môi trường thực hành riêng.',[
('from Crypto.PublicKey import RSA','Nạp API RSA của PyCryptodome; không phải module rsa thuộc thư viện chuẩn Python.'),
('RSA.generate(2048)','Sinh khóa mới có modulus 2048 bit, không phải khóa đối xứng dài 2048 byte.'),
('key.public_key()','Lấy đối tượng chỉ giữ thành phần khóa công khai.'),
("export_key(format='PEM')",'Tuần tự hóa khóa thành bytes PEM; PEM tự nó không mã hóa bí mật.')])
command('python-pss','pss','Ký và kiểm chứng RSA-PSS qua API','Python 3 · PyCryptodome',
"from Crypto.Hash import SHA256\nfrom Crypto.Signature import pss\nh = SHA256.new(b'lab message')\nsignature = pss.new(private_key).sign(h)\npss.new(public_key).verify(h, signature)",
'Đã có cặp khóa thử và muốn kiểm chứng chữ ký PSS trên đúng byte thông điệp.',
'verify không phát sinh ngoại lệ nếu hợp lệ; ValueError hoặc TypeError cần được xử lý như kiểm chứng thất bại.',
'private_key/public_key là đối tượng RSA đã nạp. Không dùng bool(verify(...)) vì thành công trả None; không tự băm digest lần nữa.',[
('SHA256.new(...)','Tạo đối tượng hash theo API PyCryptodome từ đúng byte thông điệp.'),
('pss.new(private_key)','Tạo bộ ký PSS với khóa riêng, chưa tạo chữ ký.'),
('.sign(h)','Ký đối tượng hash, không phải truyền nhầm chuỗi hex vào chỗ thông điệp.'),
('pss.new(public_key)','Tạo bộ kiểm chứng với khóa công khai đã xác thực.'),
('.verify(h, signature)','Kiểm chứng chữ ký theo hash và tham số; xử lý ngoại lệ khi dữ liệu không khớp.')])
for command_id,lesson_id,index in [('python-hash','hash-algorithms',2),('python-rsa-key','rsa',2),('python-pss','pss',2)]:
    next(c for c in commands if c['id']==command_id)['sections']=[index]
    next(l for l in lessons if l['id']==lesson_id)['sections'][index]['commands'].append(command_id)

# Attach the three-page handwritten notes to the corresponding conceptual sections.
for lesson_id,index,page in [('otp',0,1),('cbc',0,2),('ctr',0,3)]:
    next(l for l in lessons if l['id']==lesson_id)['sections'][index]['study']['references'].append({'source':'source-1','page':page})
