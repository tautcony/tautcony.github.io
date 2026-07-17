# Drafts

Work-in-progress posts. Same frontmatter schema as `../posts/`.

## How to preview

1. Put `YYYY-MM-DD-slug.md` here (not bare `README.md`).
2. Run **`npm run dev`**.
3. Open **http://localhost:4321/drafts/** — list of all drafts with links.
4. Or open the post URL directly: `/YYYY/MM/DD/slug/` from frontmatter `publishedDate` + filename slug.

| Mode | Behavior |
|------|----------|
| `npm run dev` | Drafts **on**; index at `/drafts/` |
| `npm run build` | Drafts **off** (production) |
| `npm run build:drafts` / `PREVIEW_DRAFTS=1` | Drafts **on** in `dist/` |

## Rules

- Not listed on home, archive, feed, or sitemap
- Sticky **Draft** banner + `noindex`
- Publish by **moving** the file into `src/content/posts/`
