import Pattern from "./pattern";
import {
    hexVal, fillOpacity, fillColor, map,
} from "../util";
import Preset from "../preset";

export default class Triangles extends Pattern {
    private static buildTriangleShape(sideLength: number, height: number) {
        const halfWidth = sideLength / 2;
        return [
            halfWidth, 0,
            sideLength, height,
            0, height,
            halfWidth, 0,
        ].join(",");
    }

    public generate() {
        const scale = hexVal(this.hash, 0);
        const sideLength = map(scale, 0, 15, 15, 80);
        const triangleHeight = (sideLength / 2) * Math.sqrt(3);
        const triangle = Triangles.buildTriangleShape(sideLength, triangleHeight);

        this.svg.setWidth(sideLength * 3);
        this.svg.setHeight(triangleHeight * 6);

        let i = 0;
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const val = hexVal(this.hash, i);
                const opacity = fillOpacity(val);
                const fill = fillColor(val);

                const styles = {
                    fill,
                    "fill-opacity": opacity,
                    stroke: Preset.StrokeColor,
                    "stroke-opacity": Preset.StrokeOpacity,
                };

                let rotation;
                if (y % 2 === 0) {
                    rotation = x % 2 === 0 ? 180 : 0;
                } else {
                    rotation = x % 2 !== 0 ? 180 : 0;
                }

                this.svg.polyline(triangle, styles).transform({
                    translate: [
                        x * sideLength * 0.5 - sideLength / 2,
                        triangleHeight * y,
                    ],
                    rotate: [
                        rotation,
                        sideLength / 2,
                        triangleHeight / 2,
                    ],
                });

                // Add an extra one at top-right, for tiling.
                if (x === 0) {
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            6 * sideLength * 0.5 - sideLength / 2,
                            triangleHeight * y,
                        ],
                        rotate: [
                            rotation,
                            sideLength / 2,
                            triangleHeight / 2,
                        ],
                    });
                }

                i += 1;
            }
        }
        return this;
    }
}
