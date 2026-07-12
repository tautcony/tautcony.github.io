# TC Blog (tautcony.github.io)

Personal blog powered by **Jekyll** (GitHub Pages) with a **TypeScript + Vite** frontend.

Live site: <https://tautcony.xyz>

## Requirements

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 (22 LTS recommended) |
| npm | ≥ 10 |
| Ruby | **3.2 or 3.3** (see `.ruby-version`; Ruby 4.x is **not** supported by `github-pages` / `commonmarker` yet) |
| Bundler | ≥ 2.4 |

## Install

```bash
# 1) Ruby 3.3 (required — Ruby 4.x cannot install github-pages yet)
brew install ruby@3.3
export PATH="$(brew --prefix ruby@3.3)/bin:$PATH"
ruby -v   # must print 3.3.x

# 2) JS + gems
npm ci
bundle config set --local path 'vendor/bundle'
bin/with-ruby bundle install   # or: npm run bundle -- install
```

If `bundle install` complains about Ruby 4.0.x / `commonmarker`, your shell is still on Homebrew’s default Ruby 4. Put `ruby@3.3` **first** on `PATH` (snippet above), or always use `bin/with-ruby`.

## Development

```bash
# Terminal 1 — frontend watch build (writes assets/build + _data/assets.json)
npm run build:dev

# Terminal 2 — Jekyll (uses bin/with-ruby so Ruby 3.3 is preferred)
npm start
# optional live reload:
# npm run start:l
```

Open <http://127.0.0.1:4000>.

### Useful scripts

| Script | Description |
|--------|-------------|
| `npm run eslint` | ESLint on `ts/` |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run build` | Vite production build → `assets/build/` + `_data/assets.json` |
| `npm run build:dev` | Vite development watch build |
| `npm run jekyll:build` | Static site → `_site/` |
| `npm run ci` | eslint + typecheck + frontend build + Jekyll build |

## Deploy

GitHub Actions (`.github/workflows/build.yml`) builds and deploys to **GitHub Pages** on every push to `master`.

Local full build:

```bash
npm run ci
```

Docker image (optional):

```bash
docker build -t tautcony/tc-blog .
```

## Project layout

```
ts/
  entries/          Vite entries (blog, page404, tcupdate)
  pages/            Per-page UI modules
  Lib/              Shared utilities (navbar, geopattern, pdf-embed, …)
  particle404/      Particle 404 scene (TypeScript)
less/               Styles (tc-blog.less, 404.less, tcupdate.less)
assets/build/       Vite output (gitignored; hashed JS/CSS)
_data/assets.json   Liquid map of entry → asset URLs (generated)
js/pdfjs/           Vendored PDF.js (loaded on demand via pdf-embed)
js/404/independent/ Three.js r56 only (CanvasRenderer-era API)
_posts/             Blog posts
docs/               Design / modernization notes
.github/workflows/  CI / Pages deploy
```

Build outputs (hashed filenames; see `_data/assets.json`):

| Entry | Role |
|-------|------|
| `tc-blog` | Main site JS/CSS |
| `page404` | Particle 404 |
| `tcupdate` | Tools download page (Vue JSX) |

### 404 debug flags

| Query | Effect |
|-------|--------|
| `?webGL=true` | Use WebGL renderer instead of canvas |
| `?perf=true` | Show FPS / MS panel |
| `?gui=true` | Show dat.GUI (colors / message / explode) |

Example: `/404.html?perf=true&gui=true`

## Notes

- Target browsers: modern evergreen only (IE 11 dropped).
- Frontend is ESM (`type="module"`) produced by Vite.
- Service Worker support has been **removed** (legacy registrations are unregistered once for migration).
- PDF previews use vendored PDF.js under `js/pdfjs/`, loaded **on demand** via `{% include pdf-embed.html file="..." %}`.
- Post math uses **KaTeX** (`site.katex`; opt out with `math: false` on a page).
- Scroll UX uses native `window.scrollTo({ behavior: "smooth" })` (no anime.js).
