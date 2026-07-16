import Pattern from "./pattern";
import {
    hexVal, fillOpacity, fillColor, map,
} from "../util";
import Preset from "../preset";

export default class Squares extends Pattern {
    public generate() {
        const squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 60);

        this.svg.setWidth(squareSize * 6);
        this.svg.setHeight(squareSize * 6);

        let i = 0;
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const val = hexVal(this.hash, i);
                const opacity = fillOpacity(val);
                const fill = fillColor(val);

                this.svg.rect(x * squareSize, y * squareSize, squareSize, squareSize, {
                    fill,
                    "fill-opacity": opacity,
                    stroke: Preset.StrokeColor,
                    "stroke-opacity": Preset.StrokeOpacity,
                });

                i += 1;
            }
        }
        return this;
    }
}
