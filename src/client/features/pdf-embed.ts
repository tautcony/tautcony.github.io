import { el } from "../lib/dom";

/**
 * Hydrate `.pdf-embed` placeholders with the browser's native PDF viewer.
 * The PDF URL is assigned only after user interaction, preserving lazy loading.
 */

function cssLength(value: string, fallback = "500px"): string {
    const normalized = value.trim();
    if (/^\d+(?:\.\d+)?$/.test(normalized)) {
        return `${normalized}px`;
    }
    return CSS.supports("height", normalized) ? normalized : fallback;
}

function createOpenLink(file: string, text: string): HTMLAnchorElement {
    return el("a", {
        href: file,
        target: "_blank",
        rel: "noopener",
        textContent: text,
    });
}

function mountEmbed(host: HTMLElement): void {
    const file = host.dataset.pdfFile;
    if (!file || host.dataset.pdfLoaded === "1") {
        return;
    }
    host.dataset.pdfLoaded = "1";

    const title = host.dataset.pdfTitle || "PDF document";
    const viewer = el(
        "object",
        {
            class: "pdf-embed__viewer",
            type: "application/pdf",
            data: `${file}#view=FitH`,
            title,
            "aria-label": title,
            style: { height: cssLength(host.dataset.pdfHeight || "500") },
        },
        el(
            "div",
            { class: "pdf-embed__placeholder" },
            el("p", { class: "pdf-embed__label" }, "当前浏览器不支持内嵌 PDF 预览"),
            createOpenLink(file, "直接打开 / 下载 PDF")
        )
    );

    const actions = el(
        "p",
        { class: "pdf-embed__alt pdf-embed__actions" },
        createOpenLink(file, "在新窗口打开 / 下载 PDF")
    );

    host.replaceChildren(viewer, actions);
}

export function init(root: ParentNode = document): void {
    for (const host of root.querySelectorAll<HTMLElement>(".pdf-embed")) {
        if (host.dataset.pdfBound === "1") {
            continue;
        }
        host.dataset.pdfBound = "1";

        const button = host.querySelector<HTMLButtonElement>(".pdf-embed__button");
        button?.addEventListener("click", () => mountEmbed(host), { once: true });
    }
}
