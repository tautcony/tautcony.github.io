import Pattern from "./pattern";
import {
    hexVal, fillOpacity, fillColor, map,
} from "../util";
import Preset from "../preset";

export default class Octogons extends Pattern {
    private static buildOctogonShape(squareSize: number) {
        const s = squareSize;
        const c = s * 0.33;
        return [
            c, 0,
            s - c, 0,
            s, c,
            s, s - c,
            s - c, s,
            c, s,
            0, s - c,
            0, c,
            c, 0,
        ].join(",");
    }

    public generate() {
        const squareSize = map(hexVal(this.hash, 0), 0, 15, 10, 60);
        const tile = Octogons.buildOctogonShape(squareSize);

        this.svg.setWidth(squareSize * 6);
        this.svg.setHeight(squareSize * 6);

        let i = 0;
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const val = hexVal(this.hash, i);
                const opacity = fillOpacity(val);
                const fill = fillColor(val);

                this.svg.polyline(tile, {
                    fill,
                    "fill-opacity": opacity,
                    stroke: Preset.StrokeColor,
                    "stroke-opacity": Preset.StrokeOpacity,
                }).transform({
                    translate: [
                        x * squareSize,
                        y * squareSize,
                    ],
                });

                i += 1;
            }
        }
        return this;
    }
}
