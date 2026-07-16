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
    const link = document.createElement("a");
    link.href = file;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = text;
    return link;
}

function mountEmbed(host: HTMLElement): void {
    const file = host.dataset.pdfFile;
    if (!file || host.dataset.pdfLoaded === "1") {
        return;
    }
    host.dataset.pdfLoaded = "1";

    const title = host.dataset.pdfTitle || "PDF document";
    const viewer = document.createElement("object");
    viewer.className = "pdf-embed__viewer";
    viewer.type = "application/pdf";
    viewer.data = `${file}#view=FitH`;
    viewer.style.height = cssLength(host.dataset.pdfHeight || "500");
    viewer.title = title;
    viewer.setAttribute("aria-label", title);

    const fallback = document.createElement("div");
    fallback.className = "pdf-embed__placeholder";
    const fallbackLabel = document.createElement("p");
    fallbackLabel.className = "pdf-embed__label";
    fallbackLabel.textContent = "当前浏览器不支持内嵌 PDF 预览";
    const fallbackLink = createOpenLink(file, "直接打开 / 下载 PDF");
    fallback.append(fallbackLabel, fallbackLink);
    viewer.appendChild(fallback);

    const actions = document.createElement("p");
    actions.className = "pdf-embed__alt pdf-embed__actions";
    actions.appendChild(createOpenLink(file, "在新窗口打开 / 下载 PDF"));

    host.replaceChildren(viewer, actions);
}

export function initPdfEmbeds(root: ParentNode = document): void {
    const nodes = root.querySelectorAll<HTMLElement>(".pdf-embed");
    nodes.forEach(host => {
        if (host.dataset.pdfBound === "1") {
            return;
        }
        host.dataset.pdfBound = "1";

        const button = host.querySelector<HTMLButtonElement>(".pdf-embed__button");
        button?.addEventListener("click", () => mountEmbed(host), { once: true });
    });
}
