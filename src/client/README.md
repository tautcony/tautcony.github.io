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

`features/brightness.ts` and `features/corevalue.ts` exist but are not wired into an entry yet.
