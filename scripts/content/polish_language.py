"""Apply reviewed Vietnamese prose edits without changing stable learning identities."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def polish_course(course):
    bodies = json.loads((ROOT / 'scripts/content/language-sections.json').read_text(encoding='utf-8'))
    edits = json.loads((ROOT / 'scripts/content/language-polish.json').read_text(encoding='utf-8'))
    paragraphs = json.loads((ROOT / 'scripts/content/language-study.json').read_text(encoding='utf-8'))
    lessons = {lesson['id']: lesson for lesson in course['lessons']}
    terms = {term['id']: term for term in course['terms']}
    changes = []

    def put(obj, key, value, path):
        before = obj[key]
        if before != value:
            changes.append({'path': path, 'before': before, 'after': value})
            obj[key] = value

    assert set(bodies) == set(lessons), 'Every lesson must receive reviewed section introductions'
    for lesson_id, values in bodies.items():
        sections = lessons[lesson_id]['sections']
        assert len(values) == len(sections), lesson_id
        for i, value in enumerate(values):
            put(sections[i], 'body', value, f'lessons/{lesson_id}/sections/{i}/body')
    for term_id, fields in edits['terms'].items():
        assert set(fields) <= {'definition', 'scenario', 'pitfall'}, term_id
        for field, value in fields.items():
            put(terms[term_id], field, value, f'terms/{term_id}/{field}')
    for lesson_id, titles in edits['sectionTitles'].items():
        for i, title in enumerate(titles):
            section = lessons[lesson_id]['sections'][i]
            put(section, 'title', title, f'lessons/{lesson_id}/sections/{i}/title')
            caption = f'Hình từ tài liệu gốc · Phần {i+1}: {title}'
            put(section['study'], 'figureCaption', caption, f'lessons/{lesson_id}/sections/{i}/study/figureCaption')
    for identity, value in paragraphs.items():
        lesson_id, part, index = identity.split(':')
        values = lessons[lesson_id]['sections'][int(part)]['study']['paragraphs']
        put(values, int(index), value, f'lessons/{lesson_id}/sections/{part}/study/paragraphs/{index}')

    # Only prose is eligible for phrase edits. IDs, English term names, command
    # source/token strings, URLs and user state never pass through this walker.
    prose_keys = {'body', 'paragraphs', 'steps', 'question', 'answer', 'text', 'prompt',
                  'definition', 'scenario', 'pitfall', 'situation', 'result', 'warning', 'meaning'}

    def walk(value, path='', eligible=False):
        if isinstance(value, dict):
            for key, item in value.items():
                result = walk(item, f'{path}/{key}', key in prose_keys)
                if result != item:
                    value[key] = result
        elif isinstance(value, list):
            for index, item in enumerate(value):
                identity = item.get('id', index) if isinstance(item, dict) else index
                result = walk(item, f'{path}/{identity}', eligible)
                if result != item:
                    value[index] = result
        elif isinstance(value, str) and eligible:
            result = value
            for before, after in edits['replacements']:
                result = result.replace(before, after)
            if result != value:
                changes.append({'path': path, 'before': value, 'after': result})
                return result
        return value

    walk(course)
    merged = {}
    for change in changes:
        path = change['path'].lstrip('/')
        if path in merged:
            merged[path]['after'] = change['after']
        else:
            merged[path] = {**change, 'path': path}
    return [change for change in merged.values() if change['before'] != change['after']]


if __name__ == '__main__':
    target = ROOT / 'public/data/course.json'
    course = json.loads(target.read_text(encoding='utf-8'))
    changes = polish_course(course)
    target.write_text(json.dumps(course, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    audit = ROOT / 'tmp/qa/language-diff.json'
    audit.parent.mkdir(parents=True, exist_ok=True)
    audit.write_text(json.dumps(changes, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'changedFields': len(changes), 'reviewedLessons': len(course['lessons']),
                      'reviewedSectionIntroductions': sum(len(l['sections']) for l in course['lessons'])}))
