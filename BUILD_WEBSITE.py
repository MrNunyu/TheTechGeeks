"""Update TheTechGeeks topic pages with exact published Google Sites assessment content.

Uses only the Python standard library. No text correction, rewriting or AI involved.
The downloaded original image files are stored in assets/ for offline viewing.
"""
from pathlib import Path
from urllib.request import Request, build_opener, HTTPCookieProcessor
from urllib.error import URLError, HTTPError
from http.cookiejar import CookieJar
from html import unescape, escape
import hashlib
import re
import sys

ROOT = Path(__file__).resolve().parent
SITE = 'https://sites.google.com/view/thetechgeeks/'
PAGES = [
    ('networking', 'networking.html'),
    ('history-of-the-internet', 'history-of-the-internet.html'),
    ('bits-bytes', 'bits-bytes.html'),
    ('pixels-pictures', 'pixels-pictures.html'),
    ('internet-safety-interland', 'interland.html'),
    ('artificial-intelligence', 'artificial-intelligence.html'),
    ('sources', 'sources.html'),
]
USER_AGENT = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
              'AppleWebKit/537.36 (KHTML, like Gecko) '
              'Chrome/152.0.0.0 Safari/537.36')
OPENER = build_opener(HTTPCookieProcessor(CookieJar()))
SECTION = re.compile(r'<section\b[^>]*>[\s\S]*?</section>', re.I)
BLOCK = re.compile(r'<(h[1-6]|p|ul|ol|li)\b[^>]*>[\s\S]*?</\1>|<img\b[^>]*>', re.I)
SRC = re.compile(r'\bsrc="([^"]+)"', re.I)
ASSESSMENT = re.compile(r'<!-- ORIGINAL_CONTENT_START -->[\s\S]*?<!-- ORIGINAL_CONTENT_END -->')
ASSETS = ROOT / 'assets'
ASSETS.mkdir(parents=True, exist_ok=True)


def fetch(url, referer=None):
    headers = {'User-Agent': USER_AGENT,
               'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'}
    if referer:
        headers['Referer'] = referer
    with OPENER.open(Request(url, headers=headers), timeout=30) as response:
        return response.read(), response.headers.get('Content-Type', '')


def original_blocks(raw_html):
    if '</header>' not in raw_html:
        raise ValueError('Google Sites page structure did not match the expected format')
    body = raw_html.split('</header>', 1)[1]
    sections = SECTION.findall(body)
    if not sections:
        raise ValueError('No published content sections found; aborting safely')
    return sections


def image_local_or_original(tag, page_url, report):
    match = SRC.search(tag)
    if not match:
        return tag
    url = unescape(match.group(1))
    if not url.startswith('https://sites.google.com/'):
        return tag
    try:
        data, media_type = fetch(url, referer=page_url)
        if not media_type.startswith('image/') or len(data) < 100:
            raise ValueError('Unexpected image response: ' + media_type)
        ext = ('.png' if 'png' in media_type else
               '.webp' if 'webp' in media_type else
               '.gif' if 'gif' in media_type else '.jpg')
        name = hashlib.sha256(data).hexdigest()[:20] + ext
        (ASSETS / name).write_bytes(data)
        img_src = 'assets/' + name
        report['images_saved'] += 1
    except (URLError, HTTPError, OSError, ValueError) as exc:
        img_src = url
        report['image_errors'].append(str(exc))
    # Original bytes are used. A figure only controls the new visual layout.
    img_tag = SRC.sub('src="' + escape(img_src, quote=True) + '"', tag, count=1)
    return '<figure class="original-picture">' + img_tag + '</figure>'


def section_markup(sections, page_url, report):
    out = []
    for section in sections:
        content = []
        for match in BLOCK.finditer(section):
            tag = match.group(0)
            if tag.lower().startswith('<img'):
                content.append(image_local_or_original(tag, page_url, report))
                report['images_found'] += 1
            else:
                # Deliberately preserve ALL original text, punctuation, typos,
                # headings, text emphasis, inline styles and line-break markup.
                content.append(tag)
                report['text_blocks'] += 1
        if content:
            out.append('<div class="original-section">\n' + '\n'.join(content) + '\n</div>')
    return '\n'.join(out)


def update_file(filepath, content):
    old = filepath.read_text(encoding='utf-8')
    replacement = ('<!-- ORIGINAL_CONTENT_START -->\n' + content +
                   '\n<!-- ORIGINAL_CONTENT_END -->')
    changed, count = ASSESSMENT.subn(lambda unused: replacement, old, count=1)
    if count != 1:
        raise ValueError('Cannot safely locate content placeholder in ' + filepath.name)
    filepath.write_text(changed, encoding='utf-8')


def main():
    total_blocks, total_images, failed = 0, 0, []
    for slug, filename in PAGES:
        page_url = SITE + slug
        report = dict(text_blocks=0, images_found=0, images_saved=0, image_errors=[])
        try:
            data, _ = fetch(page_url)
            sections = original_blocks(data.decode('utf-8'))
            original = section_markup(sections, page_url, report)
            if not original.strip():
                raise ValueError('Retrieved page was empty')
            update_file(ROOT / filename, original)
        except Exception as exc:
            failed.append((filename, str(exc)))
            print('[FAILED] ' + filename + ': ' + str(exc))
            continue
        total_blocks += report['text_blocks']
        total_images += report['images_saved']
        print(f"[OK] {filename}: {report['text_blocks']} text blocks; "
              f"{report['images_saved']}/{report['images_found']} original images downloaded")
        if report['image_errors']:
            print('     Image downloads restricted; see original page for images.')
    print(f'\nOriginal topic-page text blocks transferred: {total_blocks}.')
    print(f'Original image files downloaded: {total_images}.')
    if failed:
        print(f'Pages not updated: {len(failed)}. Check your internet connection and retry.')
        return 1
    print('Website ready. Double-click index.html to open it.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
