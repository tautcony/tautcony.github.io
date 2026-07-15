import * as Sentry from "@sentry/browser";
import Heti from "heti/js/heti-addon";

import Nav from "../Lib/navbar";
import Quote from "../Lib/quote";
import Title from "../Lib/title";
import tagcloud from "../Lib/tagcloud";
import { initPdfEmbeds } from "../Lib/pdf-embed";
import Archive from "../pages/archive";
import * as page from "../pages/page";
import * as post from "../pages/post";
import * as about from "../pages/about";

// CSS: BaseLayout imports tc-blog.scss + heti (M5: drop entry-side duplicate CSS).

/** Sentry release: Vite injects at build; see astro.config.mjs `define`. */
const sentryRelease =
    import.meta.env.PUBLIC_SENTRY_RELEASE || "tc-blog@1.1.0+astro";

Sentry.init({
    dsn: "https://24f09a831bb64823a88e88b918b2bb4f@o955448.ingest.sentry.io/6683081",
    release: sentryRelease,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.05,
    enabled: location.hostname !== "localhost" && location.hostname !== "127.0.0.1",
});

document.addEventListener("DOMContentLoaded", () => {
    const nav = new Nav();
    const title = new Title([
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
    ]);
    const quote = new Quote(".copyright", "quote");

    nav.init();
    const archive = new Archive();
    archive.init();
    page.init();
    post.init();

    title.init();
    quote.init(10 ** 4);
    about.init();
    initPdfEmbeds();

    tagcloud(document.querySelectorAll("#tag_cloud a"), {
        color: { start: "#bbbbee", end: "#0085a1" },
        size: { start: 1, end: 1.1, unit: "em" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const crisp = (window as any).$crisp;
    if (crisp !== undefined) {
        crisp.push(["safe", true]);
    }

    if (typeof XPathResult !== "undefined") {
        const heti = new Heti(".heti");
        heti.autoSpacing();
    }
});

// One-shot migration: drop any legacy service workers from older deploys.
// Safe to remove after a few months in production.
if (navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
            registration.unregister();
        }
    });
}
