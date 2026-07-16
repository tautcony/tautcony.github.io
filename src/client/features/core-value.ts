import { el } from "../lib/dom";

/**
 * Click easter-egg: float a short phrase at the pointer.
 * Animation uses CSS transitions (no anime.js).
 */
class CoreValueOverlay {
    private readonly phrases = [
        "富强", "民主", "文明", "和谐", "自由", "平等", "公正", "法治",
        "爱国", "敬业", "诚信", "友善", "+1s",
    ] as const;
    private index = 0;

    public init(): void {
        document.body.addEventListener("click", event => {
            if (this.isInsideLink(event)) {
                return;
            }

            const phrase = this.phrases[this.index++ % this.phrases.length];
            const span = el("span", {
                style: {
                    zIndex: 1 << 24,
                    position: "absolute",
                    fontWeight: "bold",
                    top: `${event.pageY - 20}px`,
                    left: `${event.pageX}px`,
                    color: "#ff6651",
                    userSelect: "none",
                    transition: "transform 1s ease-out, opacity 0.6s ease-out 0.4s",
                    transform: "translateY(0)",
                    opacity: 1,
                    pointerEvents: "none",
                },
            }, phrase);

            document.body.append(span);
            requestAnimationFrame(() => {
                span.style.transform = "translateY(-150px)";
                span.style.opacity = "0";
            });
            window.setTimeout(() => {
                span.remove();
            }, 1100);
        });
    }

    private isInsideLink(event: MouseEvent): boolean {
        const path = typeof event.composedPath === "function" ? event.composedPath() : [];
        for (const node of path) {
            if (node instanceof Element && node.closest("a")) {
                return true;
            }
        }
        const target = event.target;
        return target instanceof Element && target.closest("a") !== null;
    }
}

export function init(): void {
    new CoreValueOverlay().init();
}
