import anime from "animejs/lib/anime.es";
import { util_ui_element_creator as _ } from "./utils";

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
            // The path attribute is only exists in Chrome
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
                },
            });
            document.body.appendChild(span);
            span.textContent = this.coreText[this.coreIndex++ % this.coreText.length];
            anime.timeline()
                .add({
                    targets: span,
                    translateY: {
                        value: -150,
                        duration: 1000,
                    },
                })
                .add({
                    targets: span,
                    opacity: 0,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    complete: anim => {
                        span.parentNode.removeChild(span);
                    },
                });
        });
    }
}
