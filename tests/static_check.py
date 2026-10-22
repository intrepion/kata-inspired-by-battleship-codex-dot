"""Verify root HTML has only present local runtime dependencies."""
from html.parser import HTMLParser
from pathlib import Path
root = Path(__file__).resolve().parent.parent
class Check(HTMLParser):
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        value = attrs.get('src') if tag == 'script' else attrs.get('href') if tag == 'link' else None
        if value:
            assert '://' not in value, f'Unexpected remote dependency: {value}'
            assert (root / value).is_file(), f'Missing asset: {value}'
Check().feed((root / 'index.html').read_text())
print('PASS: root runtime assets are local and present')
