import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";
import { getAllPosts, postUrl, sortPostsAsc } from "../lib/posts";
import { listPageHref, paginatePosts } from "../lib/pagination";
import { absoluteUrl } from "../lib/url";

export const prerender = true;

/** Attach PDFs listed as first-class sitemap URLs (frozen set). */
const SITEMAP_ATTACH_PDFS = [
    "/attach/naming-of-fonts/040220kanjicode.pdf",
    "/attach/naming-of-fonts/5078.Adobe-Japan1-6.pdf",
    "/attach/naming-of-fonts/JIS2004_Comparison.pdf",
    "/attach/rubiksrevenge/G-rubiksrevenge.pdf",
] as const;

/** Post lastmod as calendar date at +08:00 midnight (stable, TZ-independent). */
function lastmodFromYmd(ymd: string): string {
    return `${ymd}T00:00:00+08:00`;
}

function walkPublicFiles(dir: string, base = ""): string[] {
    if (!fs.existsSync(dir)) return [];
    const out: string[] = [];
    for (const name of fs.readdirSync(dir)) {
        if (name === ".DS_Store") continue;
        const full = path.join(dir, name);
        const rel = base ? `${base}/${name}` : name;
        const st = fs.statSync(full);
        if (st.isDirectory()) {
            out.push(...walkPublicFiles(full, rel));
        } else {
            out.push(`/${rel.replace(/\\/g, "/")}`);
        }
    }
    return out;
}

/**
 * Single urlset sitemap (no sitemap index):
 * posts → static pages → paginated lists → allowlisted attach PDFs.
 */
export const GET: APIRoute = async () => {
    const all = await getAllPosts();
    const posts = sortPostsAsc(all);
    const pages = paginatePosts(all);

    const urls: { path: string; lastmod?: string }[] = [];

    for (const post of posts) {
        urls.push({
            path: postUrl(post),
            lastmod: lastmodFromYmd(post.data.publishedDate),
        });
    }

    urls.push({ path: "/about/" });
    urls.push({ path: "/archive/" });
    urls.push({ path: "/" });
    urls.push({ path: "/tcupdate/" });

    for (const slice of pages) {
        if (slice.page >= 2) {
            urls.push({ path: listPageHref(slice.page) });
        }
    }

    const publicDir = path.join(process.cwd(), "public");
    const attachPdfs = new Set(
        walkPublicFiles(path.join(publicDir, "attach"), "attach").filter(p =>
            p.toLowerCase().endsWith(".pdf")
        )
    );
    for (const p of SITEMAP_ATTACH_PDFS) {
        if (attachPdfs.has(p)) urls.push({ path: p });
    }

    const seen = new Set<string>();
    const unique = urls.filter(u => {
        if (seen.has(u.path)) return false;
        seen.add(u.path);
        return true;
    });

    const body =
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
        "<urlset xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd\" xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n" +
        unique
            .map(u => {
                const lines = ["<url>", `<loc>${absoluteUrl(u.path)}</loc>`];
                if (u.lastmod) lines.push(`<lastmod>${u.lastmod}</lastmod>`);
                lines.push("</url>");
                return lines.join("\n");
            })
            .join("\n") +
        "\n</urlset>\n";

    return new Response(body, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
        },
    });
};
