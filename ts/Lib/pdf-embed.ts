/**
 * Hydrate `.pdf-embed` placeholders: load PDF.js from cdnjs only on user action,
 * then render pages to canvas (no vendored viewer tree).
 */

const PDFJS_VERSION = "3.3.122";
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;
const PDFJS_SCRIPT = `${PDFJS_CDN}/pdf.min.js`;
const PDFJS_WORKER = `${PDFJS_CDN}/pdf.worker.min.js`;
const PDFJS_INTEGRITY =
    "sha512-CGtesFWoCAxW8xV1S4wdev6uWmGhkEBtTGJsQLkT75ab0eVyx0RTOdGxHk9hFVV/OlF6ZyCoukfPdiZPpAiUtw==";

interface PdfJsLib {
    GlobalWorkerOptions: { workerSrc: string };
    getDocument: (src: string | { url: string }) => {
        promise: Promise<{
            numPages: number;
            getPage: (pageNumber: number) => Promise<{
                getViewport: (params: { scale: number }) => { width: number; height: number };
                render: (params: {
                    canvasContext: CanvasRenderingContext2D;
                    viewport: { width: number; height: number };
                }) => { promise: Promise<void> };
            }>;
        }>;
    };
}

declare global {
    interface Window {
        pdfjsLib?: PdfJsLib;
    }
}

let pdfjsLoad: Promise<PdfJsLib> | null = null;

function loadPdfJs(): Promise<PdfJsLib> {
    if (window.pdfjsLib) {
        return Promise.resolve(window.pdfjsLib);
    }
    if (pdfjsLoad) {
        return pdfjsLoad;
    }

    pdfjsLoad = new Promise<PdfJsLib>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(
            `script[src="${PDFJS_SCRIPT}"]`
        );
        if (existing) {
            existing.addEventListener("load", () => {
                if (window.pdfjsLib) {
                    resolve(window.pdfjsLib);
                } else {
                    reject(new Error("PDF.js loaded but pdfjsLib is missing"));
                }
            });
            existing.addEventListener("error", () => reject(new Error("Failed to load PDF.js")));
            return;
        }

        const script = document.createElement("script");
        script.src = PDFJS_SCRIPT;
        script.integrity = PDFJS_INTEGRITY;
        script.crossOrigin = "anonymous";
        script.referrerPolicy = "no-referrer";
        script.async = true;
        script.onload = () => {
            if (window.pdfjsLib) {
                resolve(window.pdfjsLib);
            } else {
                reject(new Error("PDF.js loaded but pdfjsLib is missing"));
            }
        };
        script.onerror = () => {
            pdfjsLoad = null;
            reject(new Error("Failed to load PDF.js from CDN"));
        };
        document.head.appendChild(script);
    }).then(lib => {
        lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        return lib;
    });

    return pdfjsLoad;
}

async function renderPdf(host: HTMLElement, file: string): Promise<void> {
    const height = host.dataset.pdfHeight || "500";
    const title = host.dataset.pdfTitle || "PDF preview";

    host.replaceChildren();

    const status = document.createElement("p");
    status.className = "pdf-embed__status";
    status.textContent = "正在加载 PDF.js…";
    host.appendChild(status);

    try {
        const pdfjsLib = await loadPdfJs();
        status.textContent = "正在打开 PDF…";

        const pdf = await pdfjsLib.getDocument(file).promise;
        const scroll = document.createElement("div");
        scroll.className = "pdf-embed__scroll";
        scroll.style.maxHeight = `${height}px`;
        scroll.setAttribute("role", "region");
        scroll.setAttribute("aria-label", title);

        // Fit page width to container; fall back to a sensible default before layout.
        const containerWidth = Math.max(host.clientWidth - 16, 320);
        const firstPage = await pdf.getPage(1);
        const baseViewport = firstPage.getViewport({ scale: 1 });
        const scale = containerWidth / baseViewport.width;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = pageNum === 1 ? firstPage : await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement("canvas");
            canvas.className = "pdf-embed__page";
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            canvas.setAttribute("aria-label", `${title} — 第 ${pageNum} 页`);

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                throw new Error("Canvas 2D context unavailable");
            }
            await page.render({ canvasContext: ctx, viewport }).promise;
            scroll.appendChild(canvas);
        }

        status.remove();
        host.appendChild(scroll);
    } catch (err) {
        console.error("[pdf-embed]", err);
        host.replaceChildren();
        const fail = document.createElement("div");
        fail.className = "pdf-embed__placeholder";
        const label = document.createElement("p");
        label.className = "pdf-embed__label";
        label.textContent = "PDF 预览加载失败";
        const alt = document.createElement("p");
        alt.className = "pdf-embed__alt";
        const link = document.createElement("a");
        link.href = file;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = "直接打开 / 下载 PDF";
        alt.appendChild(link);
        fail.append(label, alt);
        host.appendChild(fail);
    }
}

function mountEmbed(host: HTMLElement): void {
    const file = host.dataset.pdfFile;
    if (!file || host.dataset.pdfLoaded === "1") {
        return;
    }
    host.dataset.pdfLoaded = "1";
    void renderPdf(host, file);
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
            button.addEventListener("click", () => mountEmbed(host), { once: true });
        }
    });
}
