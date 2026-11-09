"""Attach Vietnamese glosses and reviewed English expansions to course terms."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]

def annotate_terms(course):
    metadata = json.loads((ROOT / 'scripts/content/term-annotations.json').read_text(encoding='utf-8'))
    for term in course['terms']:
        values = metadata['terms'].get(term['name'])
        if values:
            term['vi'] = values[0]
            if len(values) > 1:
                term['englishFull'] = values[1]
            if len(values) > 2:
                term['nameNote'] = values[2]
        assert term.get('vi', '').strip(), f"Missing Vietnamese gloss: {term['name']}"
    course['termAnnotationSources'] = metadata['sources']

if __name__ == '__main__':
    path = ROOT / 'public/data/course.json'
    course = json.loads(path.read_text(encoding='utf-8'))
    annotate_terms(course)
    path.write_text(json.dumps(course,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'translatedTerms':len(course['terms']), 'englishExpansions':sum(bool(t.get('englishFull')) for t in course['terms'])}))
