/**
 * Static (and dev) endpoint: `/json/quote.json`
 * Source: `src/data/quotes.yml` via `src/lib/quotes.ts`.
 * Footer client reads inline `#site-quotes`; this URL remains for external consumers.
 */
import type { APIRoute } from "astro";
import { loadQuotes, serializeQuotes } from "../../lib/quotes";

export const prerender = true;

export const GET: APIRoute = () => {
    const body = serializeQuotes(loadQuotes());
    return new Response(body, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=300",
        },
    });
};
