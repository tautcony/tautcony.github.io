/**
 * Shared post ordering / URL helpers (homepage, archive, prev-next).
 * Legacy posts: URL only from frozen map keyed by sourceFilename.
 */
import type { CollectionEntry } from "astro:content";
import legacyUrls from "../../mig/fixtures/legacy-post-urls.json";

export type PostEntry = CollectionEntry<"posts">;

const legacyMap = legacyUrls as Record<string, string>;

/** Fixture insertion order for same-day tie-break. */
const legacyOrder = new Map<string, number>(
    Object.keys(legacyMap).map((k, i) => [k, i])
);

export function getLegacyUrl(sourceFilename: string): string {
    const url = legacyMap[sourceFilename];
    if (!url) {
        throw new Error(`Missing legacy URL for sourceFilename=${sourceFilename}`);
    }
    return url;
}

export function postUrl(post: PostEntry): string {
    if (post.data.permalink) return post.data.permalink;
    if (post.data.sourceFilename) {
        return getLegacyUrl(post.data.sourceFilename);
    }
    // New posts without legacy mapping
    const [y, m, d] = post.data.publishedDate.split("-");
    const slug = post.id.replace(/\.(md|markdown)$/i, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
    return `/${y}/${m}/${d}/${slug}/`;
}

/** Ascending by publishedDate, then legacy fixture order. */
export function comparePostsAsc(a: PostEntry, b: PostEntry): number {
    if (a.data.publishedDate !== b.data.publishedDate) {
        return a.data.publishedDate < b.data.publishedDate ? -1 : 1;
    }
    const ai = legacyOrder.get(a.data.sourceFilename ?? "") ?? 0;
    const bi = legacyOrder.get(b.data.sourceFilename ?? "") ?? 0;
    return ai - bi;
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

export function parseLegacyUrl(url: string): {
    year: string;
    month: string;
    day: string;
    slug: string;
} {
    const parts = url.replace(/^\/+|\/+$/g, "").split("/");
    if (parts.length !== 4) {
        throw new Error(`Unexpected legacy URL shape: ${url}`);
    }
    const [year, month, day, slug] = parts;
    return { year, month, day, slug };
}

export function getPrevNext(post: PostEntry, all: PostEntry[]): {
    previous: PostEntry | undefined;
    next: PostEntry | undefined;
} {
    const ordered = sortPostsAsc(all);
    const idx = ordered.findIndex(
        p =>
            (p.data.sourceFilename && p.data.sourceFilename === post.data.sourceFilename) ||
            p.id === post.id
    );
    if (idx < 0) return { previous: undefined, next: undefined };
    return {
        previous: ordered[idx - 1],
        next: ordered[idx + 1],
    };
}

export function collectTagCounts(posts: PostEntry[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const p of posts) {
        for (const t of p.data.tags ?? []) {
            map.set(t, (map.get(t) ?? 0) + 1);
        }
    }
    return map;
}
