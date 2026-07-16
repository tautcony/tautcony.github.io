import * as Sentry from "@sentry/browser";
import Heti from "heti/js/heti-addon";

import * as about from "../features/about";
import * as archive from "../features/archive";
import * as navbar from "../features/navbar";
import * as pageChrome from "../features/page-chrome";
import * as pdfEmbed from "../features/pdf-embed";
import * as post from "../features/post";
import * as quote from "../features/quote";
import * as tagCloud from "../features/tag-cloud";
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

function boot(): void {
    navbar.init();
    archive.init();
    pageChrome.init();
    post.init();
    title.init(TITLE_JOKES);
    quote.init({ intervalMs: 10_000 });
    about.init();
    pdfEmbed.init();
    tagCloud.init(document.querySelectorAll("#tag_cloud a"), {
        color: { start: "#bbbbee", end: "#0085a1" },
        size: { start: 1, end: 1.1, unit: "em" },
    });

    // Optional Crisp chat widget (injected only when the third-party snippet is present).
    window.$crisp?.push(["safe", true]);

    if (typeof XPathResult !== "undefined") {
        new Heti(".heti").autoSpacing();
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}
