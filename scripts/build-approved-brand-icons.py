"""Generate only small favicon derivatives of the approved S/cherry square.
The original SVG, 512px app icon, 180px Apple icon and Fraunces PNGs remain
byte-identical copies from the approved released sources; no artwork is redrawn.
Requires Pillow.
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
assets = root / 'public/logos'
source = Image.open(assets / 'sundae-app-icon.png').convert('RGBA')
for size in [16, 32, 192]:
    source.resize((size, size), Image.Resampling.LANCZOS).save(assets / (f'favicon-{size}x{size}.png' if size < 100 else 'sundae-icon-192.png'))
# The original July favicon.ico is copied unchanged, not regenerated.
