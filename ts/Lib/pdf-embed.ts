/**
 * Hydrate `.pdf-embed` placeholders: load PDF.js viewer only on user action.
 * Viewer assets live under /js/pdfjs (vendored); they are not part of the main bundle.
 */

const VIEWER_PATH = "/js/pdfjs/web/viewer.html";

function viewerUrl(file: string): string {
    const base = document.querySelector("meta[name=\"baseurl\"]") as HTMLMetaElement | null;
    const baseurl = (base?.content || "").replace(/\/$/, "");
    const viewer = `${baseurl}${VIEWER_PATH}`;
    // PDF.js viewer expects an absolute or root-relative file URL.
    const fileUrl = file.startsWith("http") ? file : file;
    return `${viewer}?file=${encodeURIComponent(fileUrl)}`;
}

function mountIframe(host: HTMLElement): void {
    const file = host.dataset.pdfFile;
    if (!file || host.dataset.pdfLoaded === "1") {
        return;
    }
    const height = host.dataset.pdfHeight || "500";
    const title = host.dataset.pdfTitle || "PDF preview";

    host.dataset.pdfLoaded = "1";
    host.replaceChildren();

    const iframe = document.createElement("iframe");
    iframe.src = viewerUrl(file);
    iframe.width = "100%";
    iframe.height = height;
    iframe.title = title;
    iframe.setAttribute("loading", "lazy");
    iframe.className = "pdf-embed__frame";
    host.appendChild(iframe);
}

export function initPdfEmbeds(root: ParentNode = document): void {
    const nodes = root.querySelectorAll<HTMLElement>(".pdf-embed");
    nodes.forEach(host => {
        if (host.dataset.pdfBound === "1") {
            return;
        }
        host.dataset.pdfBound = "1";

        const button = host.querySelector<HTMLButtonElement>(".pdf-embed__button");
        if (button) {
            button.addEventListener("click", () => mountIframe(host), { once: true });
        }
    });
}
