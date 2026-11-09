"""Extract local course PDFs into an offline, page-addressable source library."""
import json
from pathlib import Path
import sys
import pymupdf as fitz
sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'data'
IMAGES = ROOT / 'public' / 'assets' / 'slides'
OUT.mkdir(parents=True, exist_ok=True)
IMAGES.mkdir(parents=True, exist_ok=True)
documents = []
for i, path in enumerate(sorted((ROOT / 'resources' / 'documents').glob('*.pdf'))):
    doc = fitz.open(path)
    pages = []
    doc_id = f'source-{i + 1}'
    for number, page in enumerate(doc, 1):
        pages.append({'number': number, 'text': page.get_text()})
    documents.append({'id': doc_id, 'file': path.name, 'pages': pages, 'pageCount': len(doc)})
    print(f'\n{doc_id}: {path.name} ({len(doc)} pages)')
    for p in pages:
        lines = [s.strip() for s in p['text'].splitlines() if s.strip()]
        print(str(p['number']) + ': ' + ' / '.join(lines[:4])[:220])
    (OUT / f'{doc_id}.json').write_text(json.dumps(documents[-1], ensure_ascii=False), encoding='utf-8')
index = [{k: v for k, v in d.items() if k != 'pages'} for d in documents]
(OUT / 'sources.json').write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding='utf-8')
