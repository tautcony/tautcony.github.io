import { Generator } from "../generator";
import BaseColorGenerator from "../color";
import Svg from "../../svg";
import * as Color from "../../color";
import { PatternOptions } from "../../types";


export default class SolidBackgroundGenerator extends Generator<Svg> {
    public color: Color.Rgb;
    public constructor(argv: PatternOptions | string) {
        super();
        if (typeof argv === "string") {
            this.color = Color.hexToRgb(argv);
        } else {
            const generator = new BaseColorGenerator(argv);
            this.color = generator.generate();
        }
    }

    public generate() {
        const svg = new Svg();
        svg.rect(0, 0, "100%", "100%", {
            fill: Color.rgbToCss(this.color),
        });
        return svg;
    }
}
