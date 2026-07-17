/**
 * Shared post ordering / URL helpers (homepage, archive, prev-next).
 * Drafts live in collection `drafts` and are optional at preview time.
 */
import { getCollection, type CollectionEntry } from "astro:content";

export type PublishedPost = CollectionEntry<"posts">;
export type DraftPost = CollectionEntry<"drafts">;
/** Any renderable post (published or draft). */
export type PostEntry = PublishedPost | DraftPost;

/**
 * Whether draft pages should be generated and listed at `/drafts/`.
 *
 * On when any of:
 * - `astro dev` (`import.meta.env.DEV` / non-production NODE_ENV)
 * - `PREVIEW_DRAFTS=1` or `true` (for `astro build` / CI preview deploys)
 *
 * Force off with `PREVIEW_DRAFTS=0` even in dev (rare).
 */
export function draftsEnabled(): boolean {
    const flag = String(
        process.env.PREVIEW_DRAFTS ?? import.meta.env.PREVIEW_DRAFTS ?? ""
    ).toLowerCase();
    if (flag === "0" || flag === "false") {
        return false;
    }
    if (flag === "1" || flag === "true") {
        return true;
    }
    // Vite: DEV true / PROD false under `astro dev`
    if (import.meta.env.DEV || import.meta.env.MODE === "development") {
        return true;
    }
    // Fallback: some tooling only sets NODE_ENV
    if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
        return true;
    }
    return false;
}

export function isDraft(post: PostEntry): boolean {
    return post.collection === "drafts";
}

/** Published posts only (listings, feed, sitemap, tag counts). */
export async function getAllPosts(): Promise<PublishedPost[]> {
    return getCollection("posts");
}

/** Drafts collection (may be empty). Caller must gate with `draftsEnabled()`. */
export async function getDraftPosts(): Promise<DraftPost[]> {
    return getCollection("drafts");
}

/**
 * Posts available as full pages for the current build mode.
 * Listings still use `getAllPosts()` so drafts stay out of the public index.
 */
export async function getRenderablePosts(): Promise<PostEntry[]> {
    const published = await getAllPosts();
    if (!draftsEnabled()) {
        return published;
    }
    const drafts = await getDraftPosts();
    return [...published, ...drafts];
}

function postSlug(post: PostEntry): string {
    return post.id
        .replace(/\.(md|markdown)$/i, "")
        .replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

export function postUrl(post: PostEntry): string {
    if (post.data.permalink) return post.data.permalink;
    const [y, m, d] = post.data.publishedDate.split("-");
    return `/${y}/${m}/${d}/${postSlug(post)}/`;
}

/** Ascending by publishedDate, then stable file ID. */
export function comparePostsAsc(a: PostEntry, b: PostEntry): number {
    if (a.data.publishedDate !== b.data.publishedDate) {
        return a.data.publishedDate < b.data.publishedDate ? -1 : 1;
    }
    return a.id.localeCompare(b.id, "en");
}

/** Newest first (site.posts style). */
export function comparePostsDesc(a: PostEntry, b: PostEntry): number {
    return comparePostsAsc(b, a);
}

export function sortPostsAsc(posts: PostEntry[]): PostEntry[] {
    return [...posts].sort(comparePostsAsc);
}

export function sortPostsDesc(posts: PostEntry[]): PostEntry[] {
    return [...posts].sort(comparePostsDesc);
}

/** Format YYYY-MM-DD as "June 17, 2017" in UTC calendar (no TZ shift). */
export function formatPostDate(ymd: string): string {
    const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return ymd;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const date = new Date(Date.UTC(y, mo - 1, d));
    return date.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
}

export function parsePostUrl(url: string): {
    year: string;
    month: string;
    day: string;
    slug: string;
} {
    const parts = url.replace(/^\/+|\/+$/g, "").split("/");
    if (parts.length !== 4) {
        throw new Error(`Unexpected post URL shape: ${url}`);
    }
    const [year, month, day, slug] = parts;
    return { year, month, day, slug };
}

/**
 * Prev/next among published posts only (drafts do not enter the public chain).
 */
export function getPrevNext(post: PostEntry, all: PostEntry[]): {
    previous: PostEntry | undefined;
    next: PostEntry | undefined;
} {
    if (isDraft(post)) {
        return { previous: undefined, next: undefined };
    }
    const ordered = sortPostsAsc(all.filter(p => !isDraft(p)));
    const idx = ordered.findIndex(p => p.id === post.id && p.collection === post.collection);
    if (idx < 0) return { previous: undefined, next: undefined };
    return {
        previous: ordered[idx - 1],
        next: ordered[idx + 1],
    };
}

export function collectTagCounts(posts: PostEntry[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const p of posts) {
        if (isDraft(p)) continue;
        for (const t of p.data.tags ?? []) {
            map.set(t, (map.get(t) ?? 0) + 1);
        }
    }
    return map;
}
