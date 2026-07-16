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

`npm run dev` / `npm run build` use committed assets in `public/` directly. Public URLs (`/img/`, `/attach/`, `/fonts/`, `/css/`, `/json/`, …) stay stable.

### Useful scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Astro dev server |
| `npm run build` | Production SSG → `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run check:astro` | `astro check` |
| `npm run math:check` | Reject display-math delimiters embedded in prose |
| `npm run eslint` | ESLint on `ts/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lastmod:check` | Validate frozen `src/data/lastmod.json` (42 posts) |
| `npm run ci` | Lint + typecheck + astro check + math + lastmod + build（CI 入口） |
| `npm run verify:routes` | Optional：HTML/XML 路由 diff vs Jekyll fixtures |
| `npm run verify:assets` | Optional：静态资源 URL + size/hash vs fixtures |
| `npm run verify:legacy` | Optional：`verify:routes` + `verify:assets`（不进 CI） |
| `npm run eval:consistency` | Optional：相对冻结 Jekyll `_site` 的 L1–L5 一致性 |
| `npm run eval:visual` | Optional：六类页桌面+移动截图 diff（需 Playwright） |
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
  particle404/      Modern Three.js 404 scene
styles/             Site SCSS (frozen contract; repo root)
public/             Stable static assets (historical URLs)
mig/                Migration docs, fixtures, PROGRESS.md
scripts/            content/ (metadata), test/ (verification)
```

### Client entry roles

| Entry | Role |
|-------|------|
| `ts/entries/blog.ts` | Main site JS (nav, quote, pdf-embed, archive tags, …) |
| `ts/entries/page404.ts` | Responsive particle 404 (bundled modern Three.js) |
| `ts/entries/tcupdate.ts` | Tools download page GitHub release enhancement |

## Content notes

- **Posts live only in** `src/content/posts/` (M5+; former `_posts/` removed).
- Post URLs are frozen against `mig/fixtures/legacy-post-urls.txt` (some filename dates differ from URL dates).
- “Update on” dates come from **frozen** `src/data/lastmod.json` (`npm run lastmod:check`; optional `lastmod:refresh`).
- PDF previews lazily mount the browser's native vector PDF viewer (`.pdf-embed` placeholders).
- 404 particle scene bundles the current **Three.js** WebGL renderer.
- Comments use **utterances**; math uses **KaTeX** when enabled on a post.
- Sentry `release` is `tc-blog@<version>+<gitsha>` (see `mig/11-sentry-observe.md` for 7-day watch).

## Migration

Astro cutover notes and resumable checklist: [`mig/PROGRESS.md`](./mig/PROGRESS.md).

Jekyll runtime is gone; archived config/drafts under `mig/legacy/`.
