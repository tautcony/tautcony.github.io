import { pdfViewerDataUrl } from "../../lib/pdf-embed";

/**
 * Promote prebuilt mount markup into the host (same place as the idle placeholder).
 * Sets `object.data` only after click so the PDF stays lazy.
 */

function activate(host: HTMLElement): void {
    if (host.dataset.pdfLoaded === "1") {
        return;
    }

    const file = host.dataset.pdfFile;
    const mount = host.querySelector<HTMLElement>(":scope > .pdf-embed__mount");
    if (!file || !mount) {
        return;
    }

    host.dataset.pdfLoaded = "1";
    host.replaceChildren(...Array.from(mount.childNodes));

    const viewer = host.querySelector<HTMLObjectElement>(":scope > object.pdf-embed__viewer");
    if (viewer) {
        viewer.data = pdfViewerDataUrl(file);
    }
}

export function init(root: ParentNode = document): void {
    for (const host of root.querySelectorAll<HTMLElement>(".pdf-embed")) {
        if (host.dataset.pdfBound === "1") {
            continue;
        }
        host.dataset.pdfBound = "1";

        const button = host.querySelector<HTMLButtonElement>(".pdf-embed__button");
        button?.addEventListener("click", () => activate(host), { once: true });
    }
}
