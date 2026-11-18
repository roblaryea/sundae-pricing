"""Reproduce square browser icons from the complete approved wordmark.
Only empty alpha margins are trimmed. Lettering, proportions and ink are preserved.
Requires Pillow. Primary PNGs remain byte-identical copies of the brand registry assets.
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
assets = root / 'public/logos'
source = Image.open(assets / 'sundae-wordmark-fraunces.png').convert('RGBA')
wordmark = source.crop(source.getchannel('A').getbbox())
for size, name in [(16, 'favicon-16x16.png'), (32, 'favicon-32x32.png'),
                   (180, 'apple-touch-icon.png'), (192, 'sundae-wordmark-icon-192.png'),
                   (512, 'sundae-wordmark-icon-512.png')]:
    canvas = Image.new('RGBA', (size, size), '#F6F1E8')
    scaled = wordmark.copy()
    scaled.thumbnail((round(size * .9), round(size * .9)), Image.Resampling.LANCZOS)
    canvas.alpha_composite(scaled, ((size - scaled.width) // 2, (size - scaled.height) // 2))
    canvas.convert('RGB').save(assets / name)
Image.open(assets / 'sundae-wordmark-icon-512.png').save(root / 'public/favicon.ico', sizes=[(16,16), (32,32), (48,48)])
