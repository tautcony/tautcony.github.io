/** Shared post ordering / URL helpers (homepage, archive, prev-next). */
import type { CollectionEntry } from "astro:content";

export type PostEntry = CollectionEntry<"posts">;

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

export function getPrevNext(post: PostEntry, all: PostEntry[]): {
    previous: PostEntry | undefined;
    next: PostEntry | undefined;
} {
    const ordered = sortPostsAsc(all);
    const idx = ordered.findIndex(p => p.id === post.id);
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
