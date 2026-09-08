# Сборка документов

Три формата собираются из одного источника — `../logika-produktov.md`. Править
нужно только его: DOCX и PDF пересобираются, иначе форматы разойдутся.

```bash
python3 tools/md2html.py  logika-produktov.md  /tmp/doc.html
python3 tools/md2docx.py  logika-produktov.md  "Логика продуктов Trigonum.docx"
node    tools/html2pdf.mjs /tmp/doc.html       "Логика продуктов Trigonum.pdf"
```

Требуется `python-docx` (`pip install python-docx`) и Playwright с Chromium —
PDF печатается headless-браузером. LibreOffice в контейнере не запускается,
поэтому конвертация идёт этим путём, а не через `soffice --convert-to`.
