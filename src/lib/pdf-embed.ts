/**
 * Shared PDF-embed helpers (SSG markup + client activate).
 *
 * Idle UI is a single `.pdf-embed__placeholder`. Viewer + actions live in a
 * hidden `.pdf-embed__mount` (not painted). On click the client moves that
 * markup into the host (same place as the placeholder) and sets `object.data`.
 */

/** Normalize height for CSS: bare numbers → px; pass through simple lengths. */
export function cssLength(value: string | number, fallback = "500px"): string {
    const normalized = String(value).trim();
    if (normalized === "") {
        return fallback;
    }
    if (/^\d+(?:\.\d+)?$/.test(normalized)) {
        return `${normalized}px`;
    }
    if (/^\d+(?:\.\d+)?(px|em|rem|vh|vw|%|cm|mm|in)$/i.test(normalized)) {
        return normalized;
    }
    return fallback;
}

/** Absolute or site-root PDF URL as used in anchors / object.data. */
export function pdfOpenUrl(file: string): string {
    const trimmed = file.trim();
    if (trimmed.startsWith("/") || /^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    return `/${trimmed}`;
}

/** Native viewer URL (FitH) assigned only after user interaction. */
export function pdfViewerDataUrl(file: string): string {
    return `${pdfOpenUrl(file)}#view=FitH`;
}
