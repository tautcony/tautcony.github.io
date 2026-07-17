import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const nullableString = z.preprocess(
    value => (value === null || value === "" ? undefined : value),
    z.string().optional()
);

/** Shared by published posts and drafts (same frontmatter shape). */
const postSchema = z.object({
    title: z.string(),
    titleHtml: nullableString,
    subtitle: z.preprocess(
        v => (v == null ? "" : v),
        z.string().default("")
    ),
    publishedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    author: nullableString,
    headerImg: nullableString,
    headerMask: z.union([z.string(), z.number()]).nullish(),
    headerStyle: nullableString,
    catalog: z.boolean().optional().default(false),
    math: z.boolean().optional(),
    tags: z.array(z.string()).default([]),
    image: z
        .object({
            credit: nullableString,
            creditlink: nullableString,
        })
        .optional(),
    permalink: nullableString,
});

const posts = defineCollection({
    loader: glob({
        base: "./src/content/posts",
        pattern: "**/*.md",
        // Stable file IDs also key frozen last-modified metadata.
        generateId: ({ entry }) => entry,
    }),
    schema: postSchema,
});

/**
 * Work-in-progress under `src/content/drafts/`.
 * Built only when `draftsEnabled()` (astro dev, or PREVIEW_DRAFTS=1 build).
 * Never listed in home / archive / feed / sitemap.
 */
const drafts = defineCollection({
    loader: glob({
        base: "./src/content/drafts",
        // Dated drafts only; skip README.md (not a post).
        // Prefer simple prefix over character-class globs (micromatch quirks).
        pattern: "**/????-*.md",
        generateId: ({ entry }) => entry,
    }),
    schema: postSchema,
});

export const collections = { posts, drafts };
