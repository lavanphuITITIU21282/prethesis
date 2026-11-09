"""Explicit concept/command scope for the three authored sections of each lesson.

Numbers refer to the existing stable <lesson>-t<number> term ids. A concept can
belong to several sections when the text develops it again in a new context.
"""
SECTION_TERMS = {
    'cia': [[1,2,3,9], [4,5,6,10], [1,2,3,7,8]],
    'aaa': [[1,2,3,8], [4,5,8], [2,3,6,7]],
    'risk': [[1,2,3,4,5], [6,7,8,9], [10,11,12,13,14]],
    'services': [[1,2,3], [4], [1,2,3,4,5,6,7,8]],
    'keys': [[1,2,3,4,9,10], [5,6,7,8], [5,7,8]],
    'hybrid': [[1,2], [3,4,5,6], [3,7,8,9]],
    'sign-intro': [[1,2,3,4], [1,2,3], [4,5]],
    'caesar': [[1,4], [2,3,5], [6,7]],
    'substitution': [[1,2], [2,3,4,5], [6,7,8,9,10,11]],
    'otp': [[1,4], [2,3,6], [3,5]],
    'aes': [[1,2,8], [3,4,5,6,7,9], [5,7,8]],
    'cbc': [[1], [2,3], [4,5,6]],
    'ctr': [[1,2,3,5], [1,2,3], [4,5,6,7]],
    'shell': [[1,2,3,4,5], [1,2,4,5,8], [6,7]],
    'hash-properties': [[1,2], [3,4,5,6], [7]],
    'hash-algorithms': [[1,2,3,4,5,6,10,11,12], [7,8,9,13], [4,14]],
    'hash-apps': [[1], [2,3,4,5], [6,7,8]],
    'hmac': [[1,3], [4], [2,5,6,7,8]],
    'blockchain': [[1,2], [3,4,5], [6,7]],
    'number-theory': [[1,2,3], [4,5], [6,7,8]],
    'dh': [[1,3,4], [2,3,4,5], [1,6,7]],
    'rsa': [[1,2,3,4], [5,6], [7,8,9,10]],
    'oaep': [[1,2,3], [3,4,5], [1,3,4,5]],
    'pss': [[1,2], [2,3,4], [1,5]],
    'protocols': [[1,2,3,4,9], [5,6,7], [4,8]],
}
COMMAND_SECTIONS = {
    'tr-map': [0,1], 'enc': [1,2], 'dec': [1,2], 'bmp-header': [0],
    'tr-case': [0,1], 'tr-filter': [0,1], 'printf-hash': [0],
    'sum': [2], 'check': [0], 'hmac-cmd': [2],
    'genkey': [0,2], 'pubout': [2], 'oaep-enc': [2], 'oaep-dec': [2],
    'python-oaep': [2], 'pss-sign': [2], 'pss-verify': [2], 'ssh-gen': [0],
}

for lesson in lessons:
    assigned = set()
    for index, section in enumerate(lesson['sections']):
        section['terms'] = [f"{lesson['id']}-t{n}" for n in SECTION_TERMS[lesson['id']][index]]
        assert set(section['terms']) <= set(lesson['terms']), lesson['id']
        assigned.update(section['terms'])
        section['commands'] = [c['id'] for c in commands
            if c['lesson'] == lesson['id'] and index in COMMAND_SECTIONS[c['id']]]
    assert assigned == set(lesson['terms']), f"Unscoped terms: {lesson['id']}"
for command_row in commands:
    command_row['sections'] = COMMAND_SECTIONS[command_row['id']]
