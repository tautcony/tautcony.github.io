import { Generator } from "../generator";
import { hexVal, map } from "../util";
import Preset from "../preset";
import * as Color from "../../color";
import { IPatternOption } from "../../types";


export default class BaseColorGenerator extends Generator<Color.Irgb> {
    public color: string;
    private baseColor: string;
    private hash: string;

    public constructor(options: IPatternOption) {
        super();
        this.hash = options.hash;
        this.baseColor = options.baseColor || Preset.baseColor;
        this.color = options.color;
    }

    public static transform(hash: string, baseColor: string, color?: string) {
        if (color) {
            return Color.hex2rgb(color);
        }
        const hueOffset = map(hexVal(hash, 14, 3), 0, 4095, 0, 359);
        const satOffset = hexVal(hash, 17);
        const newColor = Color.rgb2hsl(Color.hex2rgb(baseColor));
        newColor.h = (((newColor.h * 360 - hueOffset) + 360) % 360) / 360;

        if (satOffset % 2 === 0) {
            newColor.s = Math.min(1, ((newColor.s * 100) + satOffset) / 100);
        } else {
            newColor.s = Math.max(0, ((newColor.s * 100) - satOffset) / 100);
        }
        return Color.hsl2rgb(newColor);
    }

    public generate() {
        return BaseColorGenerator.transform(this.hash, this.baseColor, this.color);
    }
}
