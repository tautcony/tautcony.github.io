# Scripts

The scripts are grouped by when they are used:

- `build/`: build-time preparation. `sync-public.mjs` mirrors the legacy static assets into Astro's generated `public/` directory and is run before `dev` and `build`.
- `content/`: content and metadata maintenance. These scripts migrate posts or refresh/check the frozen last-modified map; they are run intentionally, not on every build.
- `test/`: verification and consistency checks. The `compare-*` scripts check routes/assets, while `eval-*` scripts compare content and rendered screenshots. Their self-tests can run without a build.

The npm scripts are the supported entry points, so callers do not need to depend on these paths directly.
