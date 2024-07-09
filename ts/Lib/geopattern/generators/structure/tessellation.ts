import Pattern from "./pattern";
import {
    hexVal, fillOpacity, fillColor, map,
} from "../util";
import Preset from "../preset";

export default class Tessellation extends Pattern {
    private static buildRotatedTriangleShape(sideLength: number, triangleWidth: number) {
        const halfHeight = sideLength / 2;
        return [
            0, 0,
            triangleWidth, halfHeight,
            0, sideLength,
            0, 0,
        ].join(",");
    }

    // eslint-disable-next-line complexity
    public generate() {
        // 3.4.6.4 semi-regular tessellation
        const sideLength = map(hexVal(this.hash, 0), 0, 15, 5, 40);
        const hexHeight = sideLength * Math.sqrt(3);
        const hexWidth = sideLength * 2;
        const triangleHeight = (sideLength / 2) * Math.sqrt(3);
        const triangle = Tessellation.buildRotatedTriangleShape(sideLength, triangleHeight);
        const tileWidth = sideLength * 3 + triangleHeight * 2;
        const tileHeight = (hexHeight * 2) + (sideLength * 2);

        this.svg.setWidth(tileWidth);
        this.svg.setHeight(tileHeight);

        for (let i = 0; i < 20; i++) {
            const val = hexVal(this.hash, i);
            const opacity = fillOpacity(val);
            const fill = fillColor(val);

            const styles = {
                stroke: Preset.StrokeColor,
                "stroke-opacity": Preset.StrokeOpacity,
                fill,
                "fill-opacity": opacity,
                "stroke-width": 1,
            };

            switch (i) {
                case 0: // All 4 corners
                    this.svg.rect(-sideLength / 2, -sideLength / 2, sideLength, sideLength, styles);
                    this.svg.rect(tileWidth - sideLength / 2, -sideLength / 2, sideLength, sideLength, styles);
                    this.svg.rect(-sideLength / 2, tileHeight - sideLength / 2, sideLength, sideLength, styles);
                    this.svg.rect(tileWidth - sideLength / 2, tileHeight - sideLength / 2, sideLength, sideLength, styles);
                    break;
                case 1: // Center / top square
                    this.svg.rect(hexWidth / 2 + triangleHeight, hexHeight / 2, sideLength, sideLength, styles);
                    break;
                case 2: // Side squares
                    this.svg.rect(-sideLength / 2, tileHeight / 2 - sideLength / 2, sideLength, sideLength, styles);
                    this.svg.rect(tileWidth - sideLength / 2, tileHeight / 2 - sideLength / 2, sideLength, sideLength, styles);
                    break;
                case 3: // Center / bottom square
                    this.svg.rect(hexWidth / 2 + triangleHeight, hexHeight * 1.5 + sideLength, sideLength, sideLength, styles);
                    break;
                case 4: // Left top / bottom triangle
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            sideLength / 2,
                            -sideLength / 2,
                        ],
                        rotate: [
                            0,
                            sideLength / 2,
                            triangleHeight / 2,
                        ],
                    });
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            sideLength / 2,
                            tileHeight - -sideLength / 2,
                        ],
                        rotate: [
                            0,
                            sideLength / 2,
                            triangleHeight / 2,
                        ],
                        scale: [1, -1],
                    });
                    break;
                case 5: // Right top / bottom triangle
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth - sideLength / 2,
                            -sideLength / 2,
                        ],
                        rotate: [
                            0,
                            sideLength / 2,
                            triangleHeight / 2,
                        ],
                        scale: [-1, 1],
                    });
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth - sideLength / 2,
                            tileHeight + sideLength / 2,
                        ],
                        rotate: [
                            0,
                            sideLength / 2,
                            triangleHeight / 2,
                        ],
                        scale: [-1, -1],
                    });
                    break;
                case 6: // Center / top / right triangle
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth / 2 + sideLength / 2,
                            hexHeight / 2,
                        ],
                    });
                    break;
                case 7: // Center / top / left triangle
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth - tileWidth / 2 - sideLength / 2,
                            hexHeight / 2,
                        ],
                        scale: [-1, 1],
                    });
                    break;
                case 8: // Center / bottom / right triangle
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth / 2 + sideLength / 2,
                            tileHeight - hexHeight / 2,
                        ],
                        scale: [1, -1],
                    });
                    break;
                case 9: // Center / bottom / left triangle
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth - tileWidth / 2 - sideLength / 2,
                            tileHeight - hexHeight / 2,
                        ],
                        scale: [-1, -1],
                    });
                    break;
                case 10: // Left / middle triangle
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            sideLength / 2,
                            tileHeight / 2 - sideLength / 2,
                        ],
                    });
                    break;
                case 11: // Right // middle triangle
                    this.svg.polyline(triangle, styles).transform({
                        translate: [
                            tileWidth - sideLength / 2,
                            tileHeight / 2 - sideLength / 2,
                        ],
                        scale: [-1, 1],
                    });
                    break;
                case 12: // Left / top square
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        translate: [sideLength / 2, sideLength / 2],
                        rotate: [-30, 0, 0],
                    });
                    break;
                case 13: // Right / top square
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        scale: [-1, 1],
                        translate: [-tileWidth + sideLength / 2, sideLength / 2],
                        rotate: [-30, 0, 0],
                    });
                    break;
                case 14: // Left / center-top square
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        translate: [
                            sideLength / 2,
                            tileHeight / 2 - sideLength / 2 - sideLength,
                        ],
                        rotate: [30, 0, sideLength],
                    });
                    break;
                case 15: // Right / center-top square
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        scale: [-1, 1],
                        translate: [
                            -tileWidth + sideLength / 2,
                            tileHeight / 2 - sideLength / 2 - sideLength,
                        ],
                        rotate: [30, 0, sideLength],
                    });
                    break;
                case 16: // Left / center-top square
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        scale: [1, -1],
                        translate: [
                            sideLength / 2,
                            -tileHeight + tileHeight / 2 - sideLength / 2 - sideLength,
                        ],
                        rotate: [30, 0, sideLength],
                    });
                    break;
                case 17: // Right / center-bottom square
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        scale: [-1, -1],
                        translate: [
                            -tileWidth + sideLength / 2,
                            -tileHeight + tileHeight / 2 - sideLength / 2 - sideLength,
                        ],
                        rotate: [30, 0, sideLength],
                    });
                    break;
                case 18: // Left / bottom square
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        scale: [1, -1],
                        translate: [
                            sideLength / 2,
                            -tileHeight + sideLength / 2,
                        ],
                        rotate: [-30, 0, 0],
                    });
                    break;
                case 19: // Right / bottom square
                    this.svg.rect(0, 0, sideLength, sideLength, styles).transform({
                        scale: [-1, -1],
                        translate: [
                            -tileWidth + sideLength / 2,
                            -tileHeight + sideLength / 2,
                        ],
                        rotate: [-30, 0, 0],
                    });
                    break;
                default:
                    break;
            }
        }
        return this;
    }
}
