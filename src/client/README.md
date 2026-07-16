# Client TypeScript

Browser-only modules under `src/`, bundled via Astro client `<script>` imports.

Do **not** import `entries/*` from Astro frontmatter — they touch `document` / `location` and break SSG.

```
src/
  client/          Browser runtime (this tree)
    entries/       Page bootstraps
    features/      UI & page behaviors
    lib/           Shared client helpers + geopattern
    types/         Ambient shims (e.g. heti)
  lib/             Build-time helpers (posts, pagination, excerpts, rehype)
  components/      Astro components
  layouts/
  pages/
  data/
```

| Entry | Mounted from | Bootstraps |
|-------|--------------|------------|
| `entries/blog.ts` | `layouts/BaseLayout.astro` | main-site features |
| `entries/page404.ts` | `pages/404.astro` | `features/particle404` |
| `entries/tcupdate.ts` | `pages/tcupdate/index.astro` (`/tcupdate/`; `/tcupdate.html` redirects) | GitHub release UI |

`features/brightness.ts` and `features/core-value.ts` exist but are not wired into an entry yet.

## Naming conventions

| Kind | Convention | Examples |
|------|------------|----------|
| Files (multi-word) | `kebab-case` | `tag-cloud.ts`, `page-chrome.ts`, `core-value.ts` |
| Feature public API | named `export function init(...)` | `navbar.init()`, `quote.init({ intervalMs })` |
| Types / interfaces | `PascalCase`, no `I` prefix | `QuoteEntry`, `PatternOptions`, `Rgb` |
| Classes | `PascalCase` | `Navbar`, `ArchiveFilter`, `XmlNode`, `Svg` |
| Functions / methods | `camelCase` | `hexToRgb`, `findHeadingById`, `loadRepository` |
| Booleans | `isX` / `hasX` | `isInitialized`, `hasTagCloud` |
| Timer / id fields | `*Id` | `timerId`, `restoreTimerId` |
| Constants | `SCREAMING_SNAKE_CASE` | `STORAGE_KEY`, `TITLE_JOKES`, `STRUCTURE_NAMES` |

Prefer namespace imports for features in entries:

```ts
import * as navbar from "../features/navbar";
navbar.init();
```
