# Portfolio site

No build step and no dependencies.

```
index.html             content
styles.css             all styling, dark by default, light via toggle or system preference
script.js              theme toggle, scroll spy, reveal on scroll
Stefan-Dili-CV.pdf     linked from the hero
smenager-today.png     three Smenager artboards, see "Re-rendering the screens"
smenager-requests.png
smenager-hours.png
tools/                 the renderer for those three, not shipped with the site
```

Open `index.html` in a browser and it works. Nothing is fetched from a CDN, so it
also works offline and from a USB stick.

## Re-rendering the screens

The three Smenager images come from the Claude Design canvas
`Smenager - strukturni predlozi.dc.html`, row 2a, screens 1, 5 and 6. The bottom
info box is stripped from 5 and 6.

`tools/render-screens.mjs` pulls each artboard out of the canvas file and writes a
standalone page. `tools/sketch-pass.js` then runs inside that page and redraws
every border and fill as Rough.js strokes, using the same library and the same
settings as the app itself (`ROUGHNESS = 1.3`, `BOWING = 1.2`, hachure fills at
gap 6, from `src/components/sketch/index.tsx` in the smenager repo). Text is left
alone: the app wobbles the chrome, not the lettering. Roughness eases off on small
elements, because Rough.js displaces by absolute pixels and full roughness turns a
12px status square into a wedge.

Two things stay out of the Rough.js pass. The artboard's own frame is stripped, so
there is no border around the whole phone. And sticky notes keep flat edges and a
solid fill: `board-tab.tsx` draws them as plain rectangles with a head strip and a
small skew, never through `RoughBox`. A note is recognised by its thick top border,
the glued flap, which is also what separates it from a button.

```bash
node tools/render-screens.mjs /tmp/screens
```

Then copy `rough.js` (from smenager's `node_modules/roughjs/bundled/`) and
`tools/sketch-pass.js` next to the generated pages, and screenshot each at
356x876 with a headless browser at 2x device scale. Keep the output path short:
Chrome's screenshot writer silently fails past the Windows 260-character limit.

## Deploy

GitHub Pages: push the folder contents to a repo, then Settings → Pages → deploy
from the branch root. A `dili021.github.io` repo publishes at the bare username
domain.

Vercel or Netlify: drag the folder onto the dashboard, or point either at the repo
with no build command and the folder as the output directory.

## Editing

The content lives in `index.html` and nowhere else. To add a project, copy an
`<article class="project">` block and change the text. The tag pills are plain
`<li>` items inside `<ul class="tags">`.

Colours are CSS custom properties at the top of `styles.css`. The accent is
goldenrod, `#e0a82e` on dark and `#8a6410` on light, and the neutrals are tinted
warm to sit with it. Three blocks define the palette: `:root` for dark,
`[data-theme="light"]`, and the `prefers-color-scheme: light` copy of the same
values. Change `--accent` in all three to reskin the site.

## Things worth checking before you publish

- The CV PDF is a copy taken on 2026-09-08. Replace it when the CV changes.
- Smenager links to `smenager.vercel.app`. Swap in the real domain once it points there.
- Both project repositories are private, so the page says so rather than linking dead URLs.
  Add links if you ever open them.
- There is no analytics and no fonts from Google. Add either deliberately if you want them.
