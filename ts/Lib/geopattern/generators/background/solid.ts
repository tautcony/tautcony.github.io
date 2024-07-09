import { Generator } from "../generator";
import BaseColorGenerator from "../color";
import SVG from "../../svg";
import * as Color from "../../color";
import { IPatternOption } from "../../types";


export default class SolidBackgroundGenerator extends Generator<SVG> {
    public color: Color.Irgb;
    public constructor(argv: IPatternOption | string) {
        super();
        if (typeof argv === "string") {
            this.color = Color.hex2rgb(argv);
        } else {
            const generator = new BaseColorGenerator(argv);
            this.color = generator.generate();
        }
    }

    public generate() {
        const svg = new SVG();
        svg.rect(0, 0, "100%", "100%", {
            fill: Color.rgb2rgbString(this.color),
        });
        return svg;
    }
}
