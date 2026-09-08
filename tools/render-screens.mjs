// Pull three screens out of the Claude Design canvas file and wrap each one
// as a standalone page sized to the artboard, ready for a headless screenshot.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const SRC = 'C:/Users/PC/Desktop/Smenager - strukturni predlozi.dc.html';
const OUT = process.argv[2];

const WANTED = [
  { label: '2a-1', file: 'screen-1', seed: 3 },
  { label: '2a-5', file: 'screen-5', seed: 11 },
  { label: '2a-6', file: 'screen-6', seed: 29 },
];

// The bottom ⓘ boxes the user asked to drop from screens 5 and 6.
const DROP = [
  'Isti tok za svaki zahtev',
  'Posle tvoje potvrde ide adminu',
];

/** Extract one element by attribute, walking div open/close tags to find the match. */
function extractElement(html, attr) {
  const start = html.indexOf(attr);
  if (start === -1) throw new Error(`not found: ${attr}`);
  const open = html.lastIndexOf('<div', start);
  let i = open;
  let depth = 0;
  const tag = /<\/?div\b[^>]*>/g;
  tag.lastIndex = open;
  let m;
  while ((m = tag.exec(html))) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (depth === 0) {
      i = m.index + m[0].length;
      break;
    }
  }
  return html.slice(open, i);
}

/** Remove the whole <div> whose text contains `needle`. */
function dropDivContaining(html, needle) {
  const at = html.indexOf(needle);
  if (at === -1) return { html, dropped: false };
  const open = html.lastIndexOf('<div', at);
  const close = html.indexOf('</div>', at);
  if (open === -1 || close === -1) return { html, dropped: false };
  return { html: html.slice(0, open) + html.slice(close + 6), dropped: true };
}

// Rough.js redraws the borders and fills after layout, the same library and the
// same settings the app uses. See sketch-pass.js. The padding gives the wobble
// somewhere to go so the outer frame is never clipped.
const PAD = 8;

const page = (screen, seed) => `<!DOCTYPE html>
<html lang="sr"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Amatic+SC:wght@700&display=swap" rel="stylesheet">
<style>
  html, body { margin: 0; padding: 0; background: #fdfcf7; }
  body {
    font-family: 'Amatic SC', cursive;
    font-weight: 700;
    color: #1b1b1f;
    -webkit-font-smoothing: antialiased;
    padding: ${PAD}px;
  }
</style></head><body>
${screen.replace('<div ', `<div class="artboard" `)}
<script src="./rough.js"></script>
<script>window.__SEED__ = ${seed};</script>
<script src="./sketch-pass.js"></script>
</body></html>
`;

await mkdir(OUT, { recursive: true });
const src = await readFile(SRC, 'utf8');

for (const { label, file, seed } of WANTED) {
  let screen = extractElement(src, `data-screen-label="${label}"`);
  // The drop shadow would be clipped by a viewport-tight screenshot.
  screen = screen.replace(/;box-shadow:2px 3px 0 rgba\(80,70,40,\.10\)/, '');

  const removed = [];
  for (const needle of DROP) {
    const r = dropDivContaining(screen, needle);
    if (r.dropped) {
      screen = r.html;
      removed.push(needle);
    }
  }

  if (/\{\{|\}\}/.test(screen)) throw new Error(`${label} still holds a template placeholder`);

  await writeFile(join(OUT, `${file}.html`), page(screen, seed), 'utf8');
  console.log(`${label} -> ${file}.html  (${screen.length} chars, dropped: ${removed.length ? removed.join('; ') : 'none'})`);
}
