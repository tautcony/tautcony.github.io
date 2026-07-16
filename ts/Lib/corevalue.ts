import { el } from "./utils";

/**
 * Click easter-egg: float a short phrase at the pointer.
 * Animation uses CSS transitions (no anime.js).
 */
export default class CoreValue {
    private readonly phrases = [
        "富强", "民主", "文明", "和谐", "自由", "平等", "公正", "法治",
        "爱国", "敬业", "诚信", "友善", "+1s",
    ];
    private index = 0;

    public Init() {
        document.body.addEventListener("click", ev => {
            if (this.isInsideLink(ev)) {
                return;
            }

            const phrase = this.phrases[this.index++ % this.phrases.length];
            const span = el("span", {
                style: {
                    zIndex: 1 << 24,
                    position: "absolute",
                    fontWeight: "bold",
                    top: `${ev.pageY - 20}px`,
                    left: `${ev.pageX}px`,
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

    private isInsideLink(ev: MouseEvent): boolean {
        const path = typeof ev.composedPath === "function" ? ev.composedPath() : [];
        for (const node of path) {
            if (node instanceof Element && node.closest("a")) {
                return true;
            }
        }
        const target = ev.target;
        return target instanceof Element && target.closest("a") !== null;
    }
}
