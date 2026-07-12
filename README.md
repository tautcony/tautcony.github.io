# TC Blog (tautcony.github.io)

Personal blog powered by **Jekyll** (GitHub Pages) with a **TypeScript + Webpack** frontend.

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
# Terminal 1 — frontend watch build
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
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run build:prod` | Production bundle → `js/tc-blog.min.js` + `css/tc-blog.min.css` |
| `npm run build:update` | Update-page assets (`tcupdate`) |
| `npm run build` | Both frontend production builds |
| `npm run jekyll:build` | Static site → `_site/` |
| `npm run ci` | typecheck + frontend build + Jekyll build |

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
  entries/          Webpack entries (blog, page404)
  pages/            Per-page UI modules
  Lib/              Shared utilities (navbar, geopattern, …)
  particle404/      Particle 404 scene (TypeScript)
    config.ts       Query flags + constants
    tween.ts        Lightweight tween runtime
    stats-panel.ts  FPS panel (`?perf=true`)
    gui.ts          dat.GUI wrapper (`?gui=true`)
    shell / scene / mask …
less/               Styles (tc-blog.less, 404.less)
build/              Webpack configs
js/404/independent/ Three.js r56 only (CanvasRenderer-era API)
_posts/             Blog posts
.github/workflows/  CI / Pages deploy
```

Build outputs:

| Entry | JS | CSS |
|-------|----|-----|
| `blog` | `js/tc-blog.min.js` | `css/tc-blog.min.css` |
| `page404` | `js/page404.min.js` | `css/404.min.css` |

### 404 debug flags

| Query | Effect |
|-------|--------|
| `?webGL=true` | Use WebGL renderer instead of canvas |
| `?perf=true` | Show FPS / MS panel |
| `?gui=true` | Show dat.GUI (colors / message / explode) |

Example: `/404.html?perf=true&gui=true`

## Notes

- Target browsers: modern evergreen only (IE 11 dropped).
- Polyfills come from `babel-preset-env` (`useBuiltIns: "usage"`), not a full `core-js` dump.
- The particle 404 page no longer depends on jQuery 1.8.
