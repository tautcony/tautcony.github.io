import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const nullableString = z.preprocess(
    (value) => (value === null || value === "" ? undefined : value),
    z.string().optional()
);

const posts = defineCollection({
    loader: glob({
        base: "./src/content/posts",
        pattern: "**/*.{md,markdown}",
        // Keep full source filenames (with extension) as entry ids for legacy lookup.
        generateId: ({ entry }) => entry,
    }),
    schema: z.object({
        title: z.string(),
        titleHtml: nullableString,
        subtitle: z.preprocess(
            (v) => (v == null ? "" : v),
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
        sourceFilename: nullableString,
        legacyPath: nullableString,
        permalink: nullableString,
    }),
});

export const collections = { posts };
