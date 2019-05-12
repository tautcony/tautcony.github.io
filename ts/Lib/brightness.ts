import * as Cookies from "js-cookie";

import { util_ui_element_creator as _ } from "./utils";

interface IConfig {
    enable: boolean;
    brightness: number;
}

class BrightnessWatcher {
    private maskDiv: HTMLDivElement;
    private config: IConfig;

    public constructor() {
        this.maskDiv = _("div", {
            style: {
                position: "fixed",
                top: 0,
                left: 0,
                outline: "50000px solid",
                zIndex: "999999",
                outlineColor: "rgba(0, 0, 0, 0)"
            }
        });
        document.body.appendChild(this.maskDiv);
        this.config = Cookies.getJSON("brightness") as IConfig;
        if (this.config === undefined) {
            this.config = {
                brightness: 0,
                enable: false
            };
            Cookies.set("brightness", this.config);
        }
        this.update();
    }

    public increase() {
        if (this.config.enable) {
            this.config.brightness = Math.max(5, this.config.brightness - 5);
            this.update();
        }
    }

    public decrease() {
        if (this.config.enable) {
            this.config.brightness = Math.min(95, this.config.brightness + 5);
            this.update();
        }
    }

    public toggle() {
        this.config.enable = !this.config.enable;
        this.config.brightness = this.config.enable ? 30 : 0;
        this.update();
    }

    private update() {
        this.maskDiv.style.outlineColor = `rgba(0, 0, 0, ${this.config.brightness / 100})`;
        Cookies.set("brightness", this.config);
    }
}

const brightness = new BrightnessWatcher();

export default function init() {
    const keyMapping: {[key: string]: () => void} = {
        // tslint:disable: no-unsafe-any
        KeyZ: brightness.toggle.bind(brightness),
        ArrowUp: brightness.increase.bind(brightness),
        ArrowDown: brightness.decrease.bind(brightness)
        // tslint:enable: no-unsafe-any
    };
    window.addEventListener("keydown", (e) => {
        if (!e.altKey) {
            return;
        }
        const action = keyMapping[e.code];
        if (action) {
            action();
        }
    });
}
