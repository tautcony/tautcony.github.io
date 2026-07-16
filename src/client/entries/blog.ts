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

/**
 * Shell features always run. Page-local features load via dynamic import only when
 * their mount points exist (keeps ownership readable and enables code-splitting).
 */
function bootShell(): void {
    navbar.init();
    pageChrome.init();
    title.init(TITLE_JOKES);
    quote.init({ intervalMs: 10_000 });

    // Optional Crisp chat widget (injected only when the third-party snippet is present).
    window.$crisp?.push(["safe", true]);

    if (typeof XPathResult !== "undefined") {
        new Heti(".heti").autoSpacing();
    }
}

async function bootPageFeatures(): Promise<void> {
    const tasks: Promise<unknown>[] = [];

    if (document.querySelector(".catalog-body")) {
        tasks.push(import("../features/catalog").then(m => m.init()));
    }
    if (document.querySelector(".post-content")) {
        tasks.push(import("../features/post").then(m => m.init()));
    }
    if (document.querySelector("#tag_cloud")) {
        tasks.push(
            import("../features/archive").then(m => m.init()),
            import("../features/tag-cloud").then(m =>
                m.init(document.querySelectorAll("#tag_cloud a"), {
                    color: { start: "#999999", end: "#0085a1" },
                    size: { start: 1, end: 1.1, unit: "em" },
                })
            )
        );
    }
    if (document.querySelector("#kon-container")) {
        tasks.push(import("../features/about").then(m => m.init()));
    }
    if (document.querySelector(".pdf-embed")) {
        tasks.push(import("../features/pdf-embed").then(m => m.init()));
    }

    await Promise.all(tasks);
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
