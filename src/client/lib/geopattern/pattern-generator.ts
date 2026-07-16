import sha1 from "./sha1";
import { hexVal } from "./generators/util";
import {
    Pattern, Chevrons, ConcentricCircles, Diamonds, Hexagons, MosaicSquares, NestedSquares, Octogons, OverlappingCircles, OverlappingRings, Plaid, PlusSigns, SineWaves, Squares, Tessellation, Triangles, Xes,
} from "./generators/structure";
import { Generator } from "./generators/generator";
import SolidBackgroundGenerator from "./generators/background/solid";
import Preset from "./generators/preset";
import BaseColorGenerator from "./generators/color";
import { PatternOptions, STRUCTURE_NAMES } from "./types";
import * as Color from "./color";

const PATTERNS = {
    octogons: Octogons,
    overlappingCircles: OverlappingCircles,
    plusSigns: PlusSigns,
    xes: Xes,
    sineWaves: SineWaves,
    hexagons: Hexagons,
    overlappingRings: OverlappingRings,
    plaid: Plaid,
    triangles: Triangles,
    squares: Squares,
    concentricCircles: ConcentricCircles,
    diamonds: Diamonds,
    tessellation: Tessellation,
    nestedSquares: NestedSquares,
    mosaicSquares: MosaicSquares,
    chevrons: Chevrons,
};

export default class PatternGenerator extends Generator<Pattern> {
    private pattern!: Pattern;
    private options: PatternOptions;

    public constructor(str: string, options?: PatternOptions) {
        super();
        this.options = { ...options };
        this.options.hash = this.options.hash || sha1(str);
        this.options.baseColor = this.options.baseColor || Preset.baseColor;
    }

    public get Pattern() {
        return this.pattern;
    }

    public generate() {
        const colorGenerator = new BaseColorGenerator(this.options);
        const color = colorGenerator.generate();
        this.options.color = Color.rgbToHex(color);

        const backgroundGenerator = new SolidBackgroundGenerator(this.options);
        const background = backgroundGenerator.generate();

        let generatorName = this.options.generator;
        if (generatorName) {
            if (!(STRUCTURE_NAMES as readonly string[]).includes(generatorName)) {
                throw new Error(`The generator ${generatorName} does not exist.`);
            }
        } else {
            generatorName = STRUCTURE_NAMES[hexVal(this.options.hash!, 20)];
        }

        const PatternType = PATTERNS[generatorName];
        this.pattern = new PatternType(this.options, background);
        this.pattern.generate();
        return this.pattern;
    }
}

export type { PatternOptions } from "./types";
export { Pattern } from "./generators/structure";
