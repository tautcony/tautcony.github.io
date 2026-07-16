import { site } from "../data/site";
import type { PostEntry } from "./posts";
import { sortPostsDesc } from "./posts";

export const PAGE_SIZE = site.paginate;

export interface PageSlice {
    /** 1-based page number */
    page: number;
    totalPages: number;
    posts: PostEntry[];
    previousHref?: string;
    nextHref?: string;
}

/** URL for a list page: page 1 → `/`, else `/pageN/`. */
export function listPageHref(page: number): string {
    if (page <= 1) return "/";
    return `/page${page}/`;
}

export function paginatePosts(all: PostEntry[]): PageSlice[] {
    const ordered = sortPostsDesc(all);
    const totalPages = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
    const slices: PageSlice[] = [];

    for (let page = 1; page <= totalPages; page++) {
        const start = (page - 1) * PAGE_SIZE;
        const posts = ordered.slice(start, start + PAGE_SIZE);
        slices.push({
            page,
            totalPages,
            posts,
            previousHref: page > 1 ? listPageHref(page - 1) : undefined,
            nextHref: page < totalPages ? listPageHref(page + 1) : undefined,
        });
    }
    return slices;
}
