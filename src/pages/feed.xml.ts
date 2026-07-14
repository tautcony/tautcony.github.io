import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { site } from "../data/site";
import type { PostEntry } from "../lib/posts";
import { postUrl, sortPostsDesc } from "../lib/posts";

export const prerender = true;

function xmlEscape(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/** RFC822 using UTC noon to avoid TZ day-shift for date-only values. */
function toRfc822(ymd: string): string {
    const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return ymd;
    const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0));
    return d.toUTCString().replace("GMT", "+0000");
}

function absoluteUrl(path: string): string {
    const base = site.url.replace(/\/$/, "");
    if (path.startsWith("http")) return path;
    return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const GET: APIRoute = async () => {
    const all = (await getCollection("posts")) as PostEntry[];
    const posts = sortPostsDesc(all).slice(0, 10);
    const now = new Date().toUTCString().replace("GMT", "+0000");

    const items = posts
        .map((post) => {
            const url = absoluteUrl(postUrl(post));
            const html = post.rendered?.html ?? post.body ?? "";
            const cats = (post.data.tags ?? [])
                .map((t) => `        <category>${xmlEscape(t)}</category>`)
                .join("\n");
            return `      <item>
        <title>${xmlEscape(post.data.title)}</title>
        <description>${xmlEscape(html)}</description>
        <pubDate>${toRfc822(post.data.publishedDate)}</pubDate>
        <link>${xmlEscape(url)}</link>
        <guid isPermaLink="true">${xmlEscape(url)}</guid>
${cats}
      </item>`;
        })
        .join("\n");

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(site.title)}</title>
    <description>${xmlEscape(site.description)}</description>
    <link>${xmlEscape(absoluteUrl("/"))}</link>
    <atom:link href="${xmlEscape(absoluteUrl("/feed.xml"))}" rel="self" type="application/rss+xml" />
    <pubDate>${now}</pubDate>
    <lastBuildDate>${now}</lastBuildDate>
    <generator>Astro</generator>
${items}
  </channel>
</rss>
`;

    return new Response(body, {
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
        },
    });
};
