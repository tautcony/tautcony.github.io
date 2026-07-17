# Client TypeScript

Browser-only modules under `src/`, bundled via Astro client `<script>` imports.

Do **not** import `entries/*` from Astro frontmatter — they touch `document` / `location` and break SSG.

```
src/
  client/          Browser runtime (this tree)
    entries/       Page bootstraps
    features/      UI & page behaviors (interaction only)
    lib/           Shared client helpers (dom)
    types/         Ambient shims (e.g. heti)
  lib/             Build-time helpers (posts, tag-cloud, rehype, geopattern, …)
  components/      Astro components
  layouts/
  pages/
  data/
```

| Entry | Mounted from | Bootstraps |
|-------|--------------|------------|
| `entries/blog.ts` | `layouts/BaseLayout.astro` | shell always; page features via `PAGE_FEATURES` |
| `entries/page404.ts` | `pages/404.astro` | `features/particle404` |
| `entries/tcupdate.ts` | `pages/tcupdate/index.astro` | GitHub release UI |

## Blog entry ownership

**Shell** (always, static imports):

| Feature | Role |
|---------|------|
| `navbar` | mobile menu |
| `page-chrome` | gotop, sticky nav, side-catalog fold/fixed |
| `title` | tab title jokes |
| `quote` | footer quote rotation (fetches `/json/quote.json`) |
| Heti / Sentry / Crisp | third-party |

**Page features** (dynamic import when `match` exists):

| `match` | Module |
|---------|--------|
| `#tag_cloud` | `archive` — tag filter + `?tag=` |
| `#kon-container` | `about` — language select |
| `.pdf-embed` | `pdf-embed` — promote mount shell + set `object.data` |

## SSG-only (no client feature)

| Concern | Where |
|---------|--------|
| Header GeoPattern fallback | `src/lib/geopattern` via `IntroHeader` |
| “Update on” dates | `src/data/lastmod.json` |
| `//` tint, `a.external`, table wrap, PDF mount shell | `src/lib/rehype-post-enhancements` |
| Tag count badge weight colors | `src/lib/tag-cloud` → archive `#tag_cloud` 角标 |
| Side-catalog heading list | `render(post).headings` → `PostLayout` |
| K-ON quote blocks | `src/data/kon.ts` → about page |

## Feature API

Each feature module exports a single **`init(...args)`** as the public entry. Internals use private helpers / constructors; avoid `new Foo().init()`.

```ts
import * as navbar from "../features/navbar";
navbar.init();
```

| Kind | Convention | Examples |
|------|------------|----------|
| Files (multi-word) | `kebab-case` | `page-chrome.ts` |
| Public entry | `export function init(...)` | `navbar.init()`, `quote.init({ intervalMs })` |
| Types | `PascalCase` | `QuoteEntry`, `QuoteOptions` |
| Classes | `PascalCase` | `ArchiveFilter`, `QuoteRotator` |
| Helpers | `camelCase` / `bindX` | `bindGotop`, `setTagQuery` |
| Constants | `SCREAMING_SNAKE_CASE` | `TITLE_JOKES`, `PAGE_FEATURES` |
