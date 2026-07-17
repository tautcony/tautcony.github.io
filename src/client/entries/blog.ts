import * as Sentry from "@sentry/browser";
import Heti from "heti/js/heti-addon";

import * as navbar from "../features/navbar";
import * as pageChrome from "../features/page-chrome";
import * as quote from "../features/quote";
import * as title from "../features/title";

// Styles are imported from BaseLayout (not here) to avoid duplicate CSS chunks.

/** Sentry release: Vite injects at build; see astro.config.mjs `define`. */
const SENTRY_RELEASE =
    import.meta.env.PUBLIC_SENTRY_RELEASE || "tc-blog@1.1.0+astro";

Sentry.init({
    dsn: "https://24f09a831bb64823a88e88b918b2bb4f@o955448.ingest.sentry.io/6683081",
    release: SENTRY_RELEASE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.05,
    enabled: location.hostname !== "localhost" && location.hostname !== "127.0.0.1",
});

const TITLE_JOKES = [
    "_(:3 」∠)_",
    "_(・ω・｣∠)_",
    "_(:з)∠)_",
    "_(┐「ε:)_",
    "_(:3」∠❀",
    "_(:зゝ∠)_",
    "_(:3」[＿]",
    "ヾ(:3ﾉｼヾ)ﾉｼ",
    "(¦3ꇤ[▓▓]",
    "_( -ω-` )⌒)_",
] as const;

/** Page-local features: load only when the mount point exists. */
const PAGE_FEATURES = [
    { match: "#tag_cloud", load: () => import("../features/archive") },
    { match: "#kon-container", load: () => import("../features/about") },
    { match: ".pdf-embed", load: () => import("../features/pdf-embed") },
] as const;

function bootShell(): void {
    navbar.init();
    pageChrome.init();
    title.init(TITLE_JOKES);
    quote.init({ intervalMs: 10_000 });

    window.$crisp?.push(["safe", true]);

    if (typeof XPathResult !== "undefined") {
        new Heti(".heti").autoSpacing();
    }
}

async function bootPageFeatures(): Promise<void> {
    await Promise.all(
        PAGE_FEATURES
            .filter(({ match }) => document.querySelector(match))
            .map(({ load }) => load().then(mod => mod.init()))
    );
}

function boot(): void {
    bootShell();
    void bootPageFeatures();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}
