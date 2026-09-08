"""
Минимальный конвертер Markdown → HTML под LibreOffice: pandoc в окружении нет,
а из подмножества разметки документа нужны только заголовки, таблицы, списки,
блоки кода и выделение. Полноценный парсер здесь избыточен.
"""
import html
import re
import sys

CSS = """
@page { size: A4; margin: 18mm 16mm; }
body { font-family: 'Liberation Sans', Arial, sans-serif; font-size: 10.5pt; color: #1a1a2e; line-height: 1.5; }
h1 { font-size: 22pt; color: #25254f; margin: 0 0 4pt; }
h2 { font-size: 15pt; color: #25254f; margin: 20pt 0 6pt; border-bottom: 1px solid #c9cddb; padding-bottom: 4pt; }
h3 { font-size: 12pt; color: #3f3f8a; margin: 14pt 0 4pt; }
p { margin: 0 0 7pt; }
ul, ol { margin: 0 0 8pt; padding-left: 18pt; }
li { margin-bottom: 3pt; }
table { border-collapse: collapse; width: 100%; margin: 8pt 0 12pt; font-size: 9.5pt; }
th, td { border: 1px solid #c9cddb; padding: 5pt 7pt; text-align: left; vertical-align: top; }
th { background: #eef0f6; font-weight: bold; color: #25254f; }
pre { background: #f4f5f9; border-left: 3px solid #7575ff; padding: 8pt 10pt; font-family: 'Liberation Mono', monospace; font-size: 9pt; white-space: pre-wrap; margin: 8pt 0 12pt; }
code { font-family: 'Liberation Mono', monospace; font-size: 9.5pt; }
hr { border: 0; border-top: 1px solid #c9cddb; margin: 16pt 0; }
.lead { color: #5a5ac4; font-size: 12pt; margin-bottom: 14pt; }
"""


def inline(text: str) -> str:
    text = html.escape(text)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'(?<!\w)\*([^*]+)\*(?!\w)', r'<em>\1</em>', text)
    return text


def convert(md: str) -> str:
    out, lines, i = [], md.split('\n'), 0
    while i < len(lines):
        line = lines[i]

        if line.startswith('```'):
            block = []
            i += 1
            while i < len(lines) and not lines[i].startswith('```'):
                block.append(html.escape(lines[i]))
                i += 1
            out.append('<pre>' + '\n'.join(block) + '</pre>')
            i += 1
            continue

        if line.startswith('|') and i + 1 < len(lines) and re.match(r'^\|[\s:|-]+\|$', lines[i + 1]):
            head = [c.strip() for c in line.strip('|').split('|')]
            i += 2
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                rows.append([c.strip() for c in lines[i].strip('|').split('|')])
                i += 1
            out.append('<table><thead><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in head) + '</tr></thead><tbody>')
            for row in rows:
                out.append('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in row) + '</tr>')
            out.append('</tbody></table>')
            continue

        if re.match(r'^#{1,4} ', line):
            level = len(line) - len(line.lstrip('#'))
            out.append(f'<h{level}>{inline(line[level + 1:])}</h{level}>')
            i += 1
            continue

        if line.strip() in ('---', '***'):
            out.append('<hr>')
            i += 1
            continue

        if re.match(r'^[-*] ', line) or re.match(r'^\d+\. ', line):
            ordered = bool(re.match(r'^\d+\. ', line))
            tag = 'ol' if ordered else 'ul'
            items = []
            while i < len(lines) and (re.match(r'^[-*] ', lines[i]) or re.match(r'^\d+\. ', lines[i])):
                items.append(inline(re.sub(r'^([-*]|\d+\.) ', '', lines[i])))
                i += 1
            out.append(f'<{tag}>' + ''.join(f'<li>{x}</li>' for x in items) + f'</{tag}>')
            continue

        if line.startswith('> '):
            out.append(f'<p><em>{inline(line[2:])}</em></p>')
            i += 1
            continue

        if line.strip():
            out.append(f'<p>{inline(line)}</p>')
        i += 1

    return f'<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Логика продуктов Trigonum</title><style>{CSS}</style></head><body>{"".join(out)}</body></html>'


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    with open(src, encoding='utf-8') as f:
        result = convert(f.read())
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(result)
    print(f'{dst}: {len(result)} символов')
