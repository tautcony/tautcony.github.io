# Legacy Jekyll artifacts

Archived during Astro cutover. **Not used by production build.**

| Path | Notes |
|------|--------|
| `_config.yml` | Pre-Astro Jekyll site config → mapped to `src/data/site.ts` |
| `drafts/` | Former `_drafts/` (not published) |
| `lastmod-jekyll.json` | Last Jekyll-keyed lastmod map (`_posts/...` keys); freeze for Astro is `src/data/lastmod.json` |

## Content source of truth (M5+)

| Role | Path |
|------|------|
| Posts | `src/content/posts/` only |
| Frozen lastmod | `src/data/lastmod.json` |
| Static roots | `img/` `attach/` `fonts/` `css/` `json/` … via `scripts/sync-public.mjs` |
| Fixtures / compare | `mig/fixtures/*`, `scripts/compare-*.mjs`, `scripts/eval-*.mjs` |

Do not reintroduce `_posts/` as a dual write path.
