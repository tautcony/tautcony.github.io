import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import fs from "node:fs";
import path from "node:path";
import { site } from "../data/site";
import type { PostEntry } from "../lib/posts";
import { postUrl, sortPostsAsc } from "../lib/posts";
import { listPageHref, paginatePosts } from "../lib/pagination";

export const prerender = true;

function loc(pathOrUrl: string): string {
    if (pathOrUrl.startsWith("http")) return pathOrUrl;
    const base = site.url.replace(/\/$/, "");
    return `${base}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

function lastmodFromYmd(ymd: string): string {
    // Jekyll jekyll-sitemap used +08:00 midnight for post dates
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
 * Match legacy jekyll-sitemap: posts + key pages + a few attach PDFs that
 * appear as standalone URLs. Do NOT emit sitemap-index / sitemap-0.
 */
export const GET: APIRoute = async () => {
    const all = (await getCollection("posts")) as PostEntry[];
    const posts = sortPostsAsc(all);
    const pages = paginatePosts(all);

    const urls: { path: string; lastmod?: string }[] = [];

    for (const post of posts) {
        urls.push({
            path: postUrl(post),
            lastmod: lastmodFromYmd(post.data.publishedDate),
        });
    }

    // Static pages (order similar to jekyll: posts first then pages)
    urls.push({ path: "/about/" });
    urls.push({ path: "/archive/" });
    urls.push({ path: "/" });
    urls.push({ path: "/tcupdate.html" });

    for (const slice of pages) {
        if (slice.page >= 2) {
            urls.push({ path: listPageHref(slice.page) });
        }
    }

    // Attach PDFs that jekyll-sitemap included (only files under public/attach)
    const publicDir = path.join(process.cwd(), "public");
    const attachPdfs = walkPublicFiles(path.join(publicDir, "attach"), "attach").filter(p =>
        p.toLowerCase().endsWith(".pdf")
    );
    // Jekyll included a subset: naming-of-fonts PDFs + rubiksrevenge PDF
    const allowPdf = new Set([
        "/attach/naming-of-fonts/040220kanjicode.pdf",
        "/attach/naming-of-fonts/5078.Adobe-Japan1-6.pdf",
        "/attach/naming-of-fonts/JIS2004_Comparison.pdf",
        "/attach/rubiksrevenge/G-rubiksrevenge.pdf",
    ]);
    for (const p of attachPdfs) {
        if (allowPdf.has(p)) urls.push({ path: p });
    }

    // Deduplicate by path
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
                const lines = ["<url>", `<loc>${loc(u.path)}</loc>`];
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
