import Pattern from "./pattern";
import { hexVal, fillOpacity, fillColor } from "../util";

export default class Plaid extends Pattern {
    public generate() {
        let height = 0;
        let width = 0;

        // Horizontal stripes
        let i = 0;
        while (i < 36) {
            const space = hexVal(this.hash, i);
            height += space + 5;

            const val = hexVal(this.hash, i + 1);
            const opacity = fillOpacity(val);
            const fill = fillColor(val);
            const stripeHeight = val + 5;

            this.svg.rect(0, height, "100%", stripeHeight, {
                opacity,
                fill,
            });

            height += stripeHeight;
            i += 2;
        }

        // Vertical stripes
        i = 0;
        while (i < 36) {
            const space = hexVal(this.hash, i);
            width += space + 5;

            const val = hexVal(this.hash, i + 1);
            const opacity = fillOpacity(val);
            const fill = fillColor(val);
            const stripeWidth = val + 5;

            this.svg.rect(width, 0, stripeWidth, "100%", {
                opacity,
                fill,
            });

            width += stripeWidth;
            i += 2;
        }

        this.svg.setWidth(width);
        this.svg.setHeight(height);
        return this;
    }
}
