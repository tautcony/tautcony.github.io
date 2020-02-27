import * as PIXI from "pixi.js";
import { shuffle } from "./utils";

export default class BubbleBg {
    private codeSource = "https://www.hai-furi.com/assets_mv/js/haihuri.common.js";
    private instance: PIXI.Application;
    private elem: string;
    private source = ["/img/bubble/bg_bob01.png", "/img/bubble/bg_bob02.png", "/img/bubble/bg_bob03.png", "/img/bubble/bg_bob04.png"];

    private bubbleUtils = {
        x(pos: number) {
            return Math.random() * pos;
        },
        y(pos: number) {
            return Math.random() * pos;
        },
        scale(scale: number) {
            return scale * 0.5 + Math.random() * 0.1;
        },
    };

    private state = {
        init: false,
    };

    public constructor(elem: string) {
        this.elem = elem;
        PIXI.utils.skipHello();
    }

    public init() {
        this.effect();
        this.start();
        this.resize();
    }

    private effect() {
        this.instance = new PIXI.Application({
            autoStart: false,
            width: window.innerWidth,
            height: window.innerHeight,
            view: document.querySelector(this.elem),
            transparent: true,
            forceCanvas: true,
        });
        this.state.init = true;

        shuffle(this.source);
        const totalSprites = this.source.length;

        const sprites = new PIXI.ParticleContainer(totalSprites, {
            // auto: true,
            position: true,
        });
        this.instance.stage.addChild(sprites);
        const bubbles: PIXI.Sprite[] = this.source.map(img => new PIXI.Sprite(PIXI.Texture.from(img)));
        const speeds = new Float64Array(totalSprites);

        for (let i = 0; i < totalSprites; i++) {
            bubbles[i].anchor.set(0.5); // 中心点を設定

            bubbles[i].scale.set(this.bubbleUtils.scale(0.8)); // サイズ設定

            bubbles[i].x = this.bubbleUtils.x(this.instance.screen.width);
            bubbles[i].y = this.bubbleUtils.y(this.instance.screen.height);

            speeds[i] = (6 + Math.random() * 0.5) * 0.5;

            this.instance.stage.addChild(bubbles[i]);
        }
        let tick = 0;
        const height = () => window.innerHeight + 100;
        this.instance.ticker.add(() => {
            for (const [index, bubble] of bubbles.entries()) {
                bubble.y -= bubble.scale.y * speeds[index];
                if (bubble.y <= -100) {
                    bubble.y = height() + 60;
                    bubble.x = this.bubbleUtils.x(this.instance.screen.width);
                }
            }
            tick += 0.1;
        });
    }
    private destroy() {
        if (this.state.init) {
            this.instance.destroy();
            this.state.init = false;
        }
    }
    private resize() {
        window.addEventListener("resize", () => {
            if (this.state.init) {
                this.instance.renderer.resize(window.innerWidth, window.innerHeight);
            }
        });
    }
    private start() {
        if (this.state.init) {
            this.instance.start();
        }
    }
    private stop() {
        if (this.state.init) {
            this.instance.stop();
        }
    }
}
