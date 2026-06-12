// Warm the pricing micro-site palette to match the sundae-website warm-signature.
// Centralised hex + rgb-glow swaps. Run: node scripts/_warm-theme.mjs [--apply]
import fs from 'fs';
import path from 'path';

const APPLY = process.argv.includes('--apply');

// case-insensitive hex map (cold -> warm)
const HEX = {
  '#667eea': '#FF5C4D', // gradient start indigo -> coral
  '#764ba2': '#E9A24A', // gradient end  purple -> caramel
  '#38BDF8': '#FF5C4D', // sky accent -> coral
  '#0F172A': '#15110D', // dark navy(cool) -> warm navy
  '#1E293B': '#1F1A15', // surface -> warm surface
  '#334155': '#2A231C', // surface-hover -> warm
  '#3B82F6': '#FF7E6F', // report-plus blue -> light coral
  '#6366F1': '#FF5C4D', // report-pro indigo -> coral
  '#8B5CF6': '#E9A24A', // core-lite violet -> caramel
  '#A855F7': '#C2410C', // core-pro purple -> burnt
  // report-lite #10B981 (green free tier), enterprise #F59E0B (amber),
  // watchtower #EF4444 (red), gradient-gold (warm) intentionally kept.
};

function warm(src) {
  let hits = 0;
  for (const [cold, hot] of Object.entries(HEX)) {
    const re = new RegExp(cold.replace('#', '#'), 'gi');
    src = src.replace(re, (m) => { hits++; return hot; });
  }
  // coral glow: rgba(102,126,234, a) -> rgba(255,92,77, a)
  src = src.replace(/rgba\(\s*102\s*,\s*126\s*,\s*234\s*,/gi, (m) => { hits++; return 'rgba(255, 92, 77,'; });
  // cold Tailwind ACCENT classes -> warm arbitrary hex (opacity suffix preserved).
  // report-side hues (blue/indigo/sky/cyan) -> coral family;
  // core-side hues (purple/violet) -> caramel/burnt. Neutral slate/gray untouched.
  const HUE = {
    blue: '#FF5C4D', indigo: '#FF5C4D', sky: '#FF7E6F', cyan: '#FF7E6F',
    purple: '#E9A24A', violet: '#C2410C',
  };
  src = src.replace(
    /\b(text|bg|from|to|via|border|ring|fill|stroke|decoration|outline|divide|placeholder|shadow)-(blue|indigo|violet|purple|sky|cyan)-(\d{2,3})(\/\d{1,3})?\b/g,
    (m, prefix, hue, _shade, op) => { hits++; return `${prefix}-[${HUE[hue]}]${op || ''}`; }
  );
  return { src, hits };
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'dist' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(css|cjs|js|ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

const targets = [...walk('src'), 'tailwind.config.cjs'].filter(f => fs.existsSync(f));
let totalFiles = 0, totalHits = 0;
for (const file of targets) {
  const { src, hits } = warm(fs.readFileSync(file, 'utf8'));
  if (hits > 0) {
    totalFiles++; totalHits += hits;
    console.log(`${String(hits).padStart(4)}  ${file}`);
    if (APPLY) fs.writeFileSync(file, src);
  }
}
console.log(`\n${APPLY ? 'APPLIED' : 'DRY RUN'}: ${totalHits} swaps in ${totalFiles} files`);
