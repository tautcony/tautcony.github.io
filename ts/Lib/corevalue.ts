import { util_ui_element_creator as _ } from "./utils";

/**
 * Click easter-egg: float a short phrase at the pointer.
 * Animation uses CSS transitions (no anime.js).
 */
export default class CoreValue {
    private coreText: string[];
    private coreIndex: number;

    public constructor() {
        this.coreText = ["富强", "民主", "文明", "和谐", "自由", "平等", "公正", "法治", "爱国", "敬业", "诚信", "友善", "+1s"];
        this.coreIndex = 0;
    }

    public Init() {
        document.body.addEventListener("click", ev => {
            const target = ev.target as Element;
            if (target.nodeName && target.nodeName.toLowerCase() === "a") {
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const event = ev as any;
            if (event.path) {
                for (const node of event.path) {
                    const { nodeName } = (node as Element);
                    if (nodeName === undefined) {
                        continue;
                    }
                    if (nodeName.toLowerCase() === "a") {
                        return;
                    }
                }
            }
            const span = _("span", {
                style: {
                    "z-index": `${1 << 24}`,
                    position: "absolute",
                    "font-weight": "bold",
                    top: `${ev.pageY - 20}px`,
                    left: `${ev.pageX}px`,
                    color: "#ff6651",
                    "user-select": "none",
                    transition: "transform 1s ease-out, opacity 0.6s ease-out 0.4s",
                    transform: "translateY(0)",
                    opacity: "1",
                    pointerEvents: "none",
                },
            });
            document.body.appendChild(span);
            span.textContent = this.coreText[this.coreIndex++ % this.coreText.length];

            requestAnimationFrame(() => {
                span.style.transform = "translateY(-150px)";
                span.style.opacity = "0";
            });
            window.setTimeout(() => {
                span.remove();
            }, 1100);
        });
    }
}
