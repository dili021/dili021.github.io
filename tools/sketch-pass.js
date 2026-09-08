// Redraw an artboard's borders and fills as Rough.js strokes, the way the app
// does it in src/components/sketch/. Text is left alone: the app wobbles the
// chrome, not the lettering.
//
// Constants copied from src/components/sketch/index.tsx.
const ROUGHNESS = 1.3;
const BOWING = 1.2;
const HACHURE_GAP = 6;
const NS = 'http://www.w3.org/2000/svg';
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

// The artboard's own paper colour. Hachuring it against itself is invisible
// work, and it would scribble over the whole screen.
const PAPER = 'rgb(253, 252, 247)';

// Below this, hachure lines are too sparse to read as a fill, so go solid.
const HACHURE_MIN = 26;

// Rough.js displaces vertices by an absolute number of pixels, so the full
// roughness that flatters a 300px card turns a 12px status square into a wedge.
// Ease it off on small boxes.
function easeRough(minDim) {
  const t = Math.min(Math.max(minDim / 40, 0.25), 1);
  return { roughness: ROUGHNESS * t, bowing: BOWING * t };
}

function sketch(seed) {
  const gen = rough.generator();
  const root = document.querySelector('.artboard');
  const rootBox = root.getBoundingClientRect();

  // position + z-index makes the artboard a stacking context, so the fill layer
  // at z-index -1 lands above its paper background and below the text. Without
  // the z-index it escapes to the root context and disappears behind the page.
  root.style.position = 'relative';
  root.style.zIndex = '0';

  const under = layer(-1);
  const over = layer(3);
  root.appendChild(under);
  root.appendChild(over);

  // Deterministic per-element seeds, so a re-render is byte-identical.
  let counter = seed;
  const nextSeed = () => (counter = (counter * 1103515245 + 12345) & 0x7fffffff);

  function layer(z) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', String(rootBox.width));
    svg.setAttribute('height', String(rootBox.height));
    svg.style.cssText = `position:absolute;left:0;top:0;pointer-events:none;z-index:${z};overflow:visible`;
    return svg;
  }

  function path(d, attrs) {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    for (const [k, v] of Object.entries(attrs)) p.setAttribute(k, String(v));
    return p;
  }

  function emitFill(svg, drawable, color, weight) {
    for (const set of drawable.sets) {
      const d = gen.opsToPath(set);
      if (!d) continue;
      if (set.type === 'fillSketch') {
        svg.appendChild(path(d, {
          stroke: color, 'stroke-width': weight, fill: 'none', 'stroke-linecap': 'round',
        }));
      } else if (set.type === 'fillPath') {
        svg.appendChild(path(d, { fill: color, stroke: 'none' }));
      }
    }
  }

  function emitStroke(svg, drawable, color, width) {
    for (const set of drawable.sets) {
      if (set.type === 'fillSketch' || set.type === 'fillPath') continue;
      const d = gen.opsToPath(set);
      if (!d) continue;
      svg.appendChild(path(d, {
        stroke: color, 'stroke-width': width, fill: 'none',
        'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      }));
    }
  }

  const all = [root, ...root.querySelectorAll('*')];

  for (const el of all) {
    if (el.tagName === 'svg' || el.closest('svg')) continue;

    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const w = r.width;
    const h = r.height;
    if (w < 2 || h < 2) continue;

    const x = r.left - rootBox.left;
    const y = r.top - rootBox.top;

    const bg = cs.backgroundColor;
    if (bg && bg !== TRANSPARENT && bg !== PAPER) {
      const hachure = Math.min(w, h) >= HACHURE_MIN;
      const drawable = gen.rectangle(x, y, w, h, {
        ...easeRough(Math.min(w, h)),
        seed: nextSeed(),
        stroke: 'none',
        fill: bg,
        fillStyle: hachure ? 'hachure' : 'solid',
        fillWeight: 1.2,
        hachureGap: HACHURE_GAP,
      });
      emitFill(under, drawable, bg, 1.2);
      el.style.backgroundColor = 'transparent';
    }

    const sides = ['Top', 'Right', 'Bottom', 'Left'].map((s) => ({
      width: parseFloat(cs[`border${s}Width`]) || 0,
      color: cs[`border${s}Color`],
    }));
    const visible = sides.filter((s) => s.width > 0 && s.color !== TRANSPARENT);
    if (!visible.length) continue;

    const uniform =
      visible.length === 4 &&
      sides.every((s) => s.width === sides[0].width && s.color === sides[0].color);

    const opts = { ...easeRough(Math.min(w, h)), seed: nextSeed() };

    if (uniform) {
      emitStroke(over, gen.rectangle(x, y, w, h, opts), sides[0].color, sides[0].width);
    } else {
      // A hairline rule or a highlighter cap on one edge: draw the sides that exist.
      const [top, right, bottom, left] = sides;
      const edges = [
        [top, x, y, x + w, y],
        [right, x + w, y, x + w, y + h],
        [bottom, x, y + h, x + w, y + h],
        [left, x, y, x, y + h],
      ];
      for (const [side, x1, y1, x2, y2] of edges) {
        if (side.width <= 0 || side.color === TRANSPARENT) continue;
        const line = gen.line(x1, y1, x2, y2, { ...opts, seed: nextSeed() });
        emitStroke(over, line, side.color, side.width);
      }
    }
    el.style.borderColor = 'transparent';
  }

  document.documentElement.dataset.sketched = 'done';
}

document.fonts.ready.then(() => {
  requestAnimationFrame(() => sketch(window.__SEED__ ?? 1));
});
