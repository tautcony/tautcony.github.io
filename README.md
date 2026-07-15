# TC Blog (tautcony.github.io)

Personal blog built with **Astro 7** (static site generation) and a TypeScript client layer.

Live site: <https://tautcony.xyz>

## Requirements

| Tool | Version |
|------|---------|
| Node.js | ≥ **22.12.0** (see `.nvmrc`) |
| npm | ≥ 10 |

Ruby / Jekyll are **no longer required** for build or deploy.

## Install

```bash
npm ci
```

## Development

```bash
npm run dev
```

Open the URL printed by Astro (default <http://localhost:4321>).

`npm run dev` / `npm run build` use the committed legacy assets in `public/` directly. Their public URLs (`/img/`, `/attach/`, `/fonts/`, `/css/`, `/json/`, …) remain stable.

### Useful scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Sync public assets + Astro dev server |
| `npm run build` | Production SSG → `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run check:astro` | `astro check` |
| `npm run eslint` | ESLint on `ts/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lastmod:check` | Validate frozen `src/data/lastmod.json` (42 posts) |
| `npm run verify:routes` | Full HTML/XML route diff vs fixtures |
| `npm run verify:assets` | Static asset URL + size/hash diff |
| `npm run ci` | Lint + typecheck + astro check + lastmod + build + verifies |
| `npm run eval:consistency` | Optional：相对冻结 Jekyll `_site` 的 L1–L5 一致性（不进 CI） |
| `npm run eval:visual` | Optional/发布必做：六类页桌面+移动截图 diff（需 Playwright） |
| `npm run eval:all` | consistency + visual |

## Deploy

GitHub Actions (`.github/workflows/build.yml`) builds Astro and deploys **`dist/`** to **GitHub Pages** on every push to `master`.

Local production check:

```bash
npm run ci
```

Docker image (optional; uses frozen lastmod, no git history required at build):

```bash
docker build -t tautcony/tc-blog .
```

## Project layout

```
src/
  pages/            Astro routes (posts, lists, 404, tcupdate, feed, sitemap)
  layouts/          Base / page / post layouts
  components/       Site chrome and post UI
  content/posts/    Migrated Markdown (Content Layer)
  data/             site.ts, pages.ts, lastmod.json (frozen)
  lib/              posts helpers, rehype, pagination
ts/
  entries/          Client entries (blog, page404, tcupdate)
  pages/            Per-page UI modules
  Lib/              Shared utilities
  particle404/      Particle 404 scene
styles/             Site SCSS (frozen during migration; still at repo root)
public/             Stable legacy assets and runtime-static files
mig/                Migration docs, fixtures, PROGRESS.md
scripts/            content/ (migration + metadata), test/ (verification)
```

### Client entry roles

| Entry | Role |
|-------|------|
| `ts/entries/blog.ts` | Main site JS (nav, quote, pdf-embed, archive tags, …) |
| `ts/entries/page404.ts` | Particle 404 (Three.js r56 via CDN) |
| `ts/entries/tcupdate.jsx` | Tools download page (Vue JSX, client-only) |

### 404 debug flags

| Query | Effect |
|-------|--------|
| `?webGL=true` | Use WebGL renderer instead of canvas |
| `?perf=true` | Show FPS / MS panel |
| `?gui=true` | Show dat.GUI |

Example: `/404.html?perf=true&gui=true`

## Content notes

- **Posts live only in** `src/content/posts/` (M5+; former `_posts/` removed).
- Post URLs are frozen against `mig/fixtures/legacy-post-urls.txt` (some filename dates differ from URL dates).
- “Update on” dates come from **frozen** `src/data/lastmod.json` (`npm run lastmod:check`; optional `lastmod:refresh`).
- PDF previews load **PDF.js from cdnjs** on demand (`.pdf-embed` placeholders).
- 404 particle scene loads **Three.js r56 from cdnjs** (CanvasRenderer-era API).
- Comments use **utterances**; math uses **KaTeX** when enabled on a post.
- Legacy Service Worker registrations are unregistered once on the main client entry.
- Sentry `release` is `tc-blog@<version>+<gitsha>` (see `mig/11-sentry-observe.md` for 7-day watch).

## Migration

Astro cutover notes and resumable checklist: [`mig/PROGRESS.md`](./mig/PROGRESS.md).

Jekyll runtime is gone; archived config/drafts under `mig/legacy/`.
