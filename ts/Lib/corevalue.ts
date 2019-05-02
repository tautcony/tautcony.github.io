import { util_ui_element_creator as _ } from "./utils";
import anime from "animejs/lib/anime.es.js";

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
            // tslint:disable-next-line: no-any
            const event = ev as any;
            // The path attribute is only exists in Chrome
            // tslint:disable-next-line: no-unsafe-any
            if (event.path) {
                // tslint:disable-next-line: no-unsafe-any
                for (const node of event.path) {
                    const nodeName = (node as Element).nodeName;
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
                    "position": "absolute",
                    "font-weight": "bold",
                    "top": `${ev.pageY - 20}px`,
                    "left": `${ev.pageX}px`,
                    "color": "#ff6651",
                    "user-select": "none"
                }
            });
            document.body.appendChild(span);
            span.textContent = this.coreText[this.coreIndex++ % this.coreText.length];
            // tslint:disable-next-line: no-unsafe-any
            anime.timeline()
                .add({
                    targets: span,
                    translateY: {
                        value: -150,
                        duration: 1000
                    }
                })
                .add({
                    targets: span,
                    opacity: 0,
                    complete: anim => {
                        span.parentNode.removeChild(span);
                    }
                });
        });
    }
}
