/**
 * Minimal PNG read/write for visual diff (no native deps).
 * Supports 8-bit RGBA PNG as produced by Playwright screenshots.
 */
import fs from "node:fs";
import zlib from "node:zlib";

function crc32buf(buf) {
    let c = ~0;
    for (let i = 0; i < buf.length; i++) {
        c ^= buf[i];
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
        }
    }
    return ~c >>> 0;
}

function readU32(buf, off) {
    return buf.readUInt32BE(off);
}

function paeth(a, b, c) {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
}

function unfilter(data, width, height, bpp) {
    const stride = width * bpp;
    const out = Buffer.alloc(stride * height);
    let inOff = 0;
    let outOff = 0;
    let prev = Buffer.alloc(stride);
    for (let y = 0; y < height; y++) {
        const type = data[inOff++];
        const row = data.subarray(inOff, inOff + stride);
        inOff += stride;
        const dest = out.subarray(outOff, outOff + stride);
        if (type === 0) {
            row.copy(dest);
        } else if (type === 1) {
            for (let i = 0; i < stride; i++) {
                const left = i >= bpp ? dest[i - bpp] : 0;
                dest[i] = (row[i] + left) & 255;
            }
        } else if (type === 2) {
            for (let i = 0; i < stride; i++) {
                dest[i] = (row[i] + prev[i]) & 255;
            }
        } else if (type === 3) {
            for (let i = 0; i < stride; i++) {
                const left = i >= bpp ? dest[i - bpp] : 0;
                dest[i] = (row[i] + Math.floor((left + prev[i]) / 2)) & 255;
            }
        } else if (type === 4) {
            for (let i = 0; i < stride; i++) {
                const left = i >= bpp ? dest[i - bpp] : 0;
                const up = prev[i];
                const upLeft = i >= bpp ? prev[i - bpp] : 0;
                dest[i] = (row[i] + paeth(left, up, upLeft)) & 255;
            }
        } else {
            throw new Error(`Unsupported PNG filter ${type}`);
        }
        prev = Buffer.from(dest);
        outOff += stride;
    }
    return out;
}

function filterNone(rgba, width, height) {
    const bpp = 4;
    const stride = width * bpp;
    const out = Buffer.alloc((stride + 1) * height);
    let o = 0;
    for (let y = 0; y < height; y++) {
        out[o++] = 0;
        rgba.copy(out, o, y * stride, y * stride + stride);
        o += stride;
    }
    return out;
}

export class PNG {
    constructor({ width, height, data } = {}) {
        this.width = width || 0;
        this.height = height || 0;
        this.data = data || (width && height ? Buffer.alloc(width * height * 4) : null);
    }

    static readFile(filePath) {
        const buf = fs.readFileSync(filePath);
        const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
        if (buf.length < 8 || !buf.subarray(0, 8).equals(sig)) {
            throw new Error(`Not a PNG: ${filePath}`);
        }
        let offset = 8;
        let width = 0;
        let height = 0;
        let bitDepth = 8;
        let colorType = 6;
        const idat = [];
        while (offset < buf.length) {
            const len = readU32(buf, offset);
            const type = buf.toString("ascii", offset + 4, offset + 8);
            const data = buf.subarray(offset + 8, offset + 8 + len);
            offset += 12 + len;
            if (type === "IHDR") {
                width = readU32(data, 0);
                height = readU32(data, 4);
                bitDepth = data[8];
                colorType = data[9];
            } else if (type === "IDAT") {
                idat.push(data);
            } else if (type === "IEND") {
                break;
            }
        }
        if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
            throw new Error(
                `Only 8-bit RGB/RGBA PNG supported (got depth=${bitDepth} type=${colorType})`
            );
        }
        const bpp = colorType === 6 ? 4 : 3;
        const compressed = Buffer.concat(idat);
        const inflated = zlib.inflateSync(compressed);
        const raw = unfilter(inflated, width, height, bpp);
        // Normalize to RGBA for pixel diff
        let rgba = raw;
        if (bpp === 3) {
            rgba = Buffer.alloc(width * height * 4);
            for (let i = 0, j = 0; i < raw.length; i += 3, j += 4) {
                rgba[j] = raw[i];
                rgba[j + 1] = raw[i + 1];
                rgba[j + 2] = raw[i + 2];
                rgba[j + 3] = 255;
            }
        }
        return new PNG({ width, height, data: rgba });
    }

    static writeFile(filePath, png) {
        const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
        const ihdrData = Buffer.alloc(13);
        ihdrData.writeUInt32BE(png.width, 0);
        ihdrData.writeUInt32BE(png.height, 4);
        ihdrData[8] = 8;
        ihdrData[9] = 6;
        ihdrData[10] = 0;
        ihdrData[11] = 0;
        ihdrData[12] = 0;
        const ihdr = chunk("IHDR", ihdrData);
        const filtered = filterNone(png.data, png.width, png.height);
        const compressed = zlib.deflateSync(filtered, { level: 9 });
        const idat = chunk("IDAT", compressed);
        const iend = chunk("IEND", Buffer.alloc(0));
        fs.writeFileSync(filePath, Buffer.concat([signature, ihdr, idat, iend]));
    }
}

function chunk(type, data) {
    const typeBuf = Buffer.from(type, "ascii");
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.alloc(4);
    const crc = crc32buf(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
}
