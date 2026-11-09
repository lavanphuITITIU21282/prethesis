"""Authoring entry point: python scripts/content/build_all.py."""
from pathlib import Path
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')
import textwrap
from html import escape
import pymupdf

ROOT=Path(__file__).resolve().parents[2]
for name in ['build_content.py','content_symmetric.py','content_hash.py','content_public.py','content_commands.py','content_supplement.py','content_sections.py','content_depth.py']:
    exec(compile((ROOT/'scripts'/'content'/name).read_text(encoding='utf-8'),str(ROOT/'scripts'/'content'/name),'exec'),globals())

sources=json.loads((DATA/'sources.json').read_text(encoding='utf-8'))
(ASSETS/'source-pages').mkdir(exist_ok=True)
rendered_pages=set()
page_dimensions={}
for lesson in lessons:
    for section in lesson['sections']:
        for ref in section['study']['references']:
            identity=(ref['source'],ref['page'])
            if identity in rendered_pages:
                ref['image']=page_dimensions[identity]
                continue
            source=next(s for s in sources if s['id']==ref['source'])
            assert 1<=ref['page']<=source['pageCount'],identity
            doc=pymupdf.open(ROOT/'resources'/'documents'/source['file'])
            pix=doc[ref['page']-1].get_pixmap(matrix=pymupdf.Matrix(1.6,1.6),alpha=False)
            from PIL import Image
            Image.frombytes('RGB',[pix.width,pix.height],pix.samples).save(ASSETS/'source-pages'/f"{ref['source']}-p{ref['page']}.webp",quality=87)
            page_dimensions[identity]={'width':pix.width,'height':pix.height}
            ref['image']=page_dimensions[identity]
            doc.close()
            rendered_pages.add(identity)
slide_pages={'cia':11,'aaa':13,'risk':16,'services':21,'keys':5,'hybrid':14,'sign-intro':19,'caesar':7,'substitution':24,'otp':28,'aes':32,'cbc':42,'ctr':45,'shell':16,'hash-properties':6,'hash-algorithms':13,'hash-apps':22,'hmac':31,'blockchain':35,'number-theory':18,'dh':4,'rsa':14,'oaep':33,'pss':48,'protocols':54}
palette=['#0d7569','#377dcc','#b67832']
for lesson in lessons:
    p=slide_pages[lesson['id']]
    lesson['slidePage']=p
    # Each source reference includes the source image page even if sections cite others.
    lesson['pages']=sorted(set(lesson['pages']+[p]))
    source=next(s for s in sources if s['id']==lesson['source'])
    doc=pymupdf.open(ROOT/'resources'/'documents'/source['file'])
    pix=doc[p-1].get_pixmap(matrix=pymupdf.Matrix(1.4,1.4),alpha=False)
    from PIL import Image
    Image.frombytes('RGB',[pix.width,pix.height],pix.samples).save(ASSETS/'slides'/f"{lesson['id']}.webp",quality=85)
    doc.close()
    svg=['<svg xmlns="http://www.w3.org/2000/svg" width="960" height="220" viewBox="0 0 960 220" role="img">',f'<title>{escape(lesson["title"])}</title>','<rect width="960" height="220" rx="24" fill="#f0f7f5"/>','<defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7" fill="none" stroke="#91aaa5" stroke-width="1.4"/></marker></defs>']
    for i,label in enumerate(lesson['flow']):
        x=32+i*310
        svg.append(f'<rect x="{x}" y="57" width="274" height="108" rx="16" fill="white" stroke="#d8e6e1"/>')
        svg.append(f'<text x="{x+20}" y="83" font-family="Segoe UI,Arial,sans-serif" font-size="12" font-weight="700" fill="{palette[i]}">BƯỚC 0{i+1}</text>')
        for j,line in enumerate(textwrap.wrap(label,25)):
            svg.append(f'<text x="{x+20}" y="{113+j*23}" font-family="Segoe UI,Arial,sans-serif" font-size="17" font-weight="600" fill="#223d37">{escape(line)}</text>')
        if i<2: svg.append(f'<path d="M{x+281} 112 h21" stroke="#91aaa5" stroke-width="2" marker-end="url(#arrow)"/>')
    svg.append('</svg>')
    (ASSETS/'diagrams'/f"{lesson['id']}.svg").write_text(''.join(svg),encoding='utf-8')
    mobile=['<svg xmlns="http://www.w3.org/2000/svg" width="380" height="392" viewBox="0 0 380 392" role="img">',f'<title>{escape(lesson["title"])}</title>','<rect width="380" height="392" rx="18" fill="#f0f7f5"/>']
    for i,label in enumerate(lesson['flow']):
        y=20+i*122
        mobile.append(f'<rect x="24" y="{y}" width="332" height="100" rx="13" fill="white" stroke="#d8e6e1"/><text x="45" y="{y+27}" font-family="Segoe UI,Arial,sans-serif" font-size="11" font-weight="700" fill="{palette[i]}">BƯỚC 0{i+1}</text>')
        for j,line in enumerate(textwrap.wrap(label,30)):
            mobile.append(f'<text x="45" y="{y+55+j*23}" font-family="Segoe UI,Arial,sans-serif" font-size="17" font-weight="600" fill="#223d37">{escape(line)}</text>')
        if i<2: mobile.append(f'<path d="M190 {y+103}v14m-5-5 5 5 5-5" stroke="#91aaa5" stroke-width="2" fill="none"/>')
    mobile.append('</svg>')
    (ASSETS/'diagrams'/f"{lesson['id']}-mobile.svg").write_text(''.join(mobile),encoding='utf-8')

course={'version':1,'title':'Trạm học','language':'vi','modules':modules,'lessons':lessons,'terms':terms,'commands':commands,
 'references':[
 {'title':'Tài nguyên Hands-on Security — Wenliang Du','url':'https://www.handsonsecurity.net/resources.html','note':'Liên kết đọc thêm; bài học tiếng Việt và câu hỏi được biên soạn cho website từ PDF cục bộ.'},
 {'title':'OpenSSL enc','url':'https://docs.openssl.org/3.5/man1/openssl-enc/','note':'Tham chiếu cú pháp và giới hạn của enc.'},
 {'title':'OpenSSL pkeyutl','url':'https://docs.openssl.org/3.5/man1/openssl-pkeyutl/','note':'Tham chiếu RSA-OAEP và lựa chọn đệm.'},
 {'title':'OpenSSL dgst','url':'https://docs.openssl.org/3.5/man1/openssl-dgst/','note':'Tham chiếu băm, ký và kiểm chứng.'},
 {'title':'RFC 8017 — PKCS #1','url':'https://www.rfc-editor.org/rfc/rfc8017','note':'RSA-OAEP, RSA-PSS và giới hạn kích thước.'},
 {'title':'RFC 8446 — TLS 1.3','url':'https://www.rfc-editor.org/rfc/rfc8446','note':'Phân biệt TLS 1.3 với ví dụ vận chuyển khóa RSA lịch sử.'}
 ,{'title':'PyCryptodome — OAEP','url':'https://www.pycryptodome.org/src/cipher/oaep','note':'Tham chiếu ví dụ API Python và cấu hình hash.'}
 ,{'title':'OpenSSH — ssh-keygen','url':'https://man.openbsd.org/ssh-keygen','note':'Tham chiếu lệnh sinh khóa SSH.'}
 ]}
course['references'].extend([
 {'title':'NIST FIPS 197 — AES','url':'https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf','note':'Bổ sung cấu trúc state, round và phân biệt độ dài khóa với khối.'},
 {'title':'NIST SP 800-38A — Block cipher modes','url':'https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38a.pdf','note':'Đối chiếu công thức ECB/CBC/CFB/OFB/CTR và quy tắc IV/counter.'},
 {'title':'RFC 2104 — HMAC','url':'https://www.rfc-editor.org/rfc/rfc2104','note':'Đối chiếu cấu trúc HMAC; thuật toán ví dụ thực hành dùng SHA-256.'},
 {'title':'Python hashlib','url':'https://docs.python.org/3/library/hashlib.html','note':'Đối chiếu API bytes, update, digest và hexdigest.'}
])
from polish_language import polish_course
polish_course(course)
from annotate_terms import annotate_terms
annotate_terms(course)
(DATA/'course.json').write_text(json.dumps(course,ensure_ascii=False,indent=2),encoding='utf-8')
print(f"Built {len(lessons)} lessons, {len(terms)} terms, {len(commands)} commands, {sum(len(l['sections']) for l in lessons)} detailed guides, {len(rendered_pages)} source-page images.")
