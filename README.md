# Portfolio site

Four files, no build step, no dependencies.

```
index.html                  content
styles.css                  all styling, dark by default, light via toggle or system preference
script.js                   theme toggle, scroll spy, reveal on scroll
Stefan-Dili-CV.pdf          linked from the hero
screenshot-login.jpg        Smenager screens, copied from its docs/marketing folder
screenshot-week-worker.jpg
```

Open `index.html` in a browser and it works. Nothing is fetched from a CDN, so it
also works offline and from a USB stick.

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
