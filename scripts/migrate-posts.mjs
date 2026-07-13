/**
 * Migrate `_posts` → `src/content/posts` for Astro Content Layer.
 * M0: skeleton + fixture self-tests. M1: full front-matter / Liquid conversion.
 *
 * Usage:
 *   node scripts/migrate-posts.mjs --self-test
 *   node scripts/migrate-posts.mjs --check-fixtures
 *   node scripts/migrate-posts.mjs --dry-run   # M1
 *   node scripts/migrate-posts.mjs            # M1 write
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const postsDir = path.join(root, "_posts");
const outDir = path.join(root, "src/content/posts");
const legacyJson = path.join(root, "mig/fixtures/legacy-post-urls.json");
const legacyTxt = path.join(root, "mig/fixtures/legacy-post-urls.txt");

const EXPECTED_POST_COUNT = 42;

export function listPostFiles(dir = postsDir) {
    if (!fs.existsSync(dir)) return [];
    return fs
        .readdirSync(dir)
        .filter((name) => /\.(md|markdown)$/i.test(name))
        .sort();
}

export function loadLegacyMap(filePath = legacyJson) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`legacy map missing: ${filePath}`);
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/**
 * Assert fixture integrity used by M1 URL generation.
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function checkFixtures() {
    const errors = [];
    const files = listPostFiles();
    if (files.length !== EXPECTED_POST_COUNT) {
        errors.push(`_posts count ${files.length} !== ${EXPECTED_POST_COUNT}`);
    }

    if (!fs.existsSync(legacyJson)) {
        errors.push(`missing ${path.relative(root, legacyJson)}`);
        return { ok: false, errors };
    }

    const map = loadLegacyMap();
    const keys = Object.keys(map);
    if (keys.length !== EXPECTED_POST_COUNT) {
        errors.push(`legacy-post-urls.json keys ${keys.length} !== ${EXPECTED_POST_COUNT}`);
    }

    const urls = Object.values(map);
    const uniqUrls = new Set(urls);
    if (uniqUrls.size !== urls.length) {
        errors.push("legacy-post-urls.json has duplicate URLs");
    }

    for (const f of files) {
        if (!(f in map)) {
            errors.push(`legacy map missing key for post file: ${f}`);
        }
    }
    for (const k of keys) {
        if (!files.includes(k)) {
            errors.push(`legacy map key has no _posts file: ${k}`);
        }
        const u = map[k];
        if (typeof u !== "string" || !u.startsWith("/") || !u.endsWith("/")) {
            errors.push(`bad URL for ${k}: ${u}`);
        }
    }

    // Date mismatch known case: filename day != URL day
    const known = "2017-04-23-14th-ZJ-Programming-Contest.markdown";
    if (map[known] && map[known] !== "/2017/04/24/14th-ZJ-Programming-Contest/") {
        errors.push(`known date-mismatch URL wrong for ${known}: ${map[known]}`);
    }

    if (fs.existsSync(legacyTxt)) {
        const lines = fs
            .readFileSync(legacyTxt, "utf8")
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);
        if (lines.length !== EXPECTED_POST_COUNT) {
            errors.push(`legacy-post-urls.txt lines ${lines.length} !== ${EXPECTED_POST_COUNT}`);
        }
        for (const u of urls) {
            if (!lines.includes(u)) {
                errors.push(`txt missing URL ${u}`);
            }
        }
    } else {
        errors.push(`missing ${path.relative(root, legacyTxt)}`);
    }

    return { ok: errors.length === 0, errors };
}

/**
 * M1 stub: will copy + rewrite front matter / Liquid.
 * Currently refuses to write (skeleton).
 */
export function migratePosts({ dryRun = true } = {}) {
    const { ok, errors } = checkFixtures();
    if (!ok) {
        return { ok: false, errors, written: 0 };
    }
    const files = listPostFiles();
    if (!dryRun) {
        return {
            ok: false,
            errors: [
                "Full migrate write is not implemented in M0 skeleton. Implement in M1 (see mig/05, mig/07).",
            ],
            written: 0,
            planned: files.length,
            outDir,
        };
    }
    return {
        ok: true,
        errors: [],
        written: 0,
        planned: files.length,
        outDir,
        dryRun: true,
        message: `Would migrate ${files.length} posts → ${path.relative(root, outDir)} (M1)`,
    };
}

function parseArgs(argv) {
    const out = { selfTest: false, checkFixtures: false, dryRun: false, write: false };
    for (const a of argv) {
        if (a === "--self-test") out.selfTest = true;
        else if (a === "--check-fixtures") out.checkFixtures = true;
        else if (a === "--dry-run") out.dryRun = true;
        else if (a === "--write") out.write = true;
        else if (a === "--help" || a === "-h") out.help = true;
    }
    return out;
}

function selfTest() {
    const { ok, errors } = checkFixtures();
    if (!ok) {
        console.error("[migrate-posts] fixture check FAILED");
        for (const e of errors) console.error(`  - ${e}`);
        process.exit(1);
    }
    const plan = migratePosts({ dryRun: true });
    if (!plan.ok || plan.planned !== EXPECTED_POST_COUNT) {
        console.error("[migrate-posts] dry-run plan failed", plan);
        process.exit(1);
    }
    console.log(
        `[migrate-posts] self-test OK (${EXPECTED_POST_COUNT} posts, fixtures consistent)`
    );
    process.exit(0);
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
        console.log(
            "Usage: node scripts/migrate-posts.mjs [--self-test|--check-fixtures|--dry-run|--write]"
        );
        process.exit(0);
    }
    if (args.selfTest) {
        selfTest();
        return;
    }
    if (args.checkFixtures || (!args.dryRun && !args.write)) {
        // Default without flags: check fixtures (safe).
        if (!args.dryRun && !args.write && !args.checkFixtures) {
            // fall through if only default — prefer check
        }
    }
    if (args.checkFixtures || (!args.dryRun && !args.write)) {
        const { ok, errors } = checkFixtures();
        if (!ok) {
            console.error("[migrate-posts] fixture check FAILED");
            for (const e of errors) console.error(`  - ${e}`);
            process.exit(1);
        }
        console.log(`[migrate-posts] fixtures OK (${EXPECTED_POST_COUNT})`);
        if (!args.dryRun && !args.write) process.exit(0);
    }

    const result = migratePosts({ dryRun: !args.write });
    if (!result.ok) {
        console.error("[migrate-posts] FAILED");
        for (const e of result.errors) console.error(`  - ${e}`);
        process.exit(1);
    }
    console.log(result.message || `[migrate-posts] wrote ${result.written}`);
    process.exit(0);
}

main();
