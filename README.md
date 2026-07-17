# TC Blog (tautcony.github.io)

Personal blog built with **Astro 7** (static site generation) and a TypeScript client layer.

Live site: <https://tautcony.xyz>

## Requirements

| Tool | Version |
|------|---------|
| Node.js | ≥ **24** (Active LTS; see `.nvmrc`) |
| npm | ≥ 10 |

## Install

```bash
npm ci
```

## Development

```bash
npm run dev
```

Open the URL printed by Astro (default <http://localhost:4321>).

Dev and production builds serve committed files under `public/` as-is. Public paths such as `/img/`, `/attach/`, `/fonts/`, `/css/`, and `/json/` are stable site URLs.

### Useful scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Astro dev server |
| `npm run build` | Production SSG → `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run check:astro` | `astro check` |
| `npm run math:check` | Reject display-math delimiters embedded in prose |
| `npm run eslint` | ESLint on `src/` + scripts |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lastmod:check` | Validate `src/data/lastmod.json` against post files |
| `npm run lastmod:refresh` | Regenerate `lastmod.json` from git history |
| `npm run quotes:check` | Validate `src/data/quotes.yml` (JSON via Astro `/json/quote.json`) |
| `npm run ci` | Lint + typecheck + astro check + math + quotes + lastmod + build |

## Deploy

GitHub Actions (`.github/workflows/build.yml`) runs `npm run ci` and deploys **`dist/`** to **GitHub Pages** on every push to `master`.

Local production check:

```bash
npm run ci
```

Docker image (optional; uses committed `lastmod.json`, no git history required at build):

```bash
docker build -t tautcony/tc-blog .
```

If pulling from Docker Hub fails, override base images (example mirror):

```bash
docker build \
  --build-arg NODE_IMAGE=docker.m.daocloud.io/library/node:24-bookworm-slim \
  --build-arg NGINX_IMAGE=docker.m.daocloud.io/library/nginx:stable-alpine \
  -t tautcony/tc-blog .
```

```bash
docker run --rm -p 8080:80 tautcony/tc-blog
```

## Project layout

```
src/
  pages/            Routes (home, pagination, posts, about, archive, 404, tcupdate, feed, sitemap)
  layouts/          Base / page / post layouts
  components/       Site chrome and post UI
  content/posts/    Markdown posts (Content Layer)
  data/             site.ts, pages.ts, lastmod.json
  lib/              Build-time helpers (posts, pagination, excerpts)
  client/           Browser runtime (entries, features, geopattern, …)
  styles/           Site SCSS
public/             Static assets served at the site root
scripts/            content checks and optional utilities
```

### Client entry roles

| Entry | Role |
|-------|------|
| `src/client/entries/blog.ts` | Main site JS (nav, quote, pdf-embed, archive tags, …) |
| `src/client/entries/page404.ts` | Responsive particle 404 (Three.js) |
| `src/client/entries/tcupdate.ts` | Tools download page (GitHub release enhancement) |

## Content notes

- Posts live in `src/content/posts/` (`YYYY-MM-DD-slug.md`). Public post URLs are `/YYYY/MM/DD/slug/` via `postUrl()`; the filename date is an archive id and may differ from the URL date.
- “Update on” dates come from `src/data/lastmod.json` (`lastmod:check` in CI; refresh with `lastmod:refresh` when needed).
- Site-wide config is `src/data/site.ts` (title, SNS, RSS footer icon, etc.).
- PDF previews use `.pdf-embed` placeholders and the browser’s native PDF viewer.
- Comments use **utterances**; math uses **KaTeX** when enabled on a post.
- Code highlighting uses **Prism** styles under `src/styles/syntax.scss`.
- Footer quotes: edit `src/data/quotes.yml` (Astro serves `/json/quote.json` on `dev`/`build`; CI runs `quotes:check`).
- Sentry `release` is `tc-blog@<version>+<gitsha>`.

## License

Apache-2.0 — see [LICENSE](./LICENSE).
