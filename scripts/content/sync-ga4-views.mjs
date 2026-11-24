#!/usr/bin/env node
/**
 * Syncs historical + current page-view counts from Google Analytics 4 Data API
 * into `src/data/views.json` using Node built-in crypto & fetch (zero deps).
 *
 * Required env vars:
 * - GA4_PROPERTY_ID: Numeric GA4 property ID (e.g. "123456789", NOT "G-XXXX")
 * - GA4_SERVICE_ACCOUNT_JSON: Service account JSON string or path to JSON file
 *
 * Optional env vars:
 * - GA4_START_DATE: Start date for historical query (default: "2020-01-01")
 */

import { execFileSync } from "node:child_process";
import { createSign } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const PROPERTY_ID = process.env.GA4_PROPERTY_ID?.trim();
const SA_INPUT = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim();
const START_DATE = process.env.GA4_START_DATE?.trim() || "2020-01-01";
const OUTPUT_PATH = resolve("src/data/views.json");

function hasProxyEnv() {
    return Boolean(
        process.env.HTTPS_PROXY
        || process.env.https_proxy
        || process.env.HTTP_PROXY
        || process.env.http_proxy
        || process.env.ALL_PROXY
        || process.env.all_proxy
    );
}

async function postRequest(url, headers, body) {
    // Node's built-in fetch ignores proxy env vars unless NODE_USE_ENV_PROXY=1;
    // when proxy env vars are present locally, delegate to curl which handles HTTP & SOCKS5 proxies.
    if (!hasProxyEnv() || process.env.NODE_USE_ENV_PROXY === "1") {
        const res = await fetch(url, { method: "POST", headers, body });
        const text = await res.text();
        return { ok: res.ok, status: res.status, text };
    }

    const args = ["-sS", "-X", "POST", "-w", "\n%{http_code}"];
    for (const [k, v] of Object.entries(headers)) {
        args.push("-H", `${k}: ${v}`);
    }
    args.push("--data-binary", "@-", url);

    const stdout = execFileSync("curl", args, {
        input: typeof body === "string" ? body : body.toString(),
        encoding: "utf8",
        maxBuffer: 20 * 1024 * 1024,
    });
    const lastNl = stdout.lastIndexOf("\n");
    const text = lastNl >= 0 ? stdout.slice(0, lastNl) : "";
    const status = Number(lastNl >= 0 ? stdout.slice(lastNl + 1).trim() : 0);
    return { ok: status >= 200 && status < 300, status, text };
}

function base64UrlEncode(input) {
    return Buffer.from(input)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function loadServiceAccount(rawOrPath) {
    const jsonStr = existsSync(rawOrPath)
        ? readFileSync(rawOrPath, "utf8")
        : rawOrPath;
    const parsed = JSON.parse(jsonStr);
    if (!parsed.client_email || !parsed.private_key) {
        throw new Error("Invalid GA4_SERVICE_ACCOUNT_JSON: missing client_email or private_key.");
    }
    return parsed;
}

async function fetchAccessToken(serviceAccount) {
    const now = Math.floor(Date.now() / 1000);
    const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const payload = base64UrlEncode(JSON.stringify({
        iss: serviceAccount.client_email,
        scope: "https://www.googleapis.com/auth/analytics.readonly",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
    }));

    const signingInput = `${header}.${payload}`;
    const signer = createSign("RSA-SHA256");
    signer.update(signingInput);
    const signature = signer
        .sign(serviceAccount.private_key, "base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    const assertion = `${signingInput}.${signature}`;
    const res = await postRequest(
        "https://oauth2.googleapis.com/token",
        { "Content-Type": "application/x-www-form-urlencoded" },
        new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion,
        }).toString()
    );

    if (!res.ok) {
        throw new Error(`OAuth token exchange failed (${res.status}): ${res.text}`);
    }
    const data = JSON.parse(res.text);
    return data.access_token;
}

async function runReport(accessToken, body) {
    const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`;
    const res = await postRequest(
        endpoint,
        {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        JSON.stringify(body)
    );

    if (!res.ok) {
        throw new Error(`GA4 runReport failed (${res.status}): ${res.text}`);
    }
    return JSON.parse(res.text);
}

function collectValidPaths() {
    const valid = new Set(["/", "/about/", "/archive/", "/tcupdate/"]);
    const postsDir = resolve("src/content/posts");
    if (existsSync(postsDir)) {
        for (const file of readdirSync(postsDir)) {
            const match = file.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.(md|markdown)$/i);
            if (match) {
                valid.add(`/${match[1]}/${match[2]}/${match[3]}/${match[4]}/`);
            }
        }
    }
    return valid;
}

function normalizePath(rawPath) {
    let clean = (rawPath || "/").split(/[?#]/)[0] || "/";
    // Strip accidental scheme+host prefix recorded by crawlers (e.g. /https://tautcony.xyz/...)
    clean = clean.replace(/^\/https?:\/\/[^/]+/i, "") || "/";
    if (clean === "/tcupdate.html") {
        return "/tcupdate/";
    }
    if (clean.endsWith("/index.html")) {
        clean = clean.slice(0, -"/index.html".length) || "/";
    }
    if (!clean.startsWith("/")) {
        clean = `/${clean}`;
    }
    if (clean !== "/" && !clean.endsWith("/") && !/\.[a-z0-9]+$/i.test(clean)) {
        clean = `${clean}/`;
    }
    return clean;
}

async function main() {
    if (!PROPERTY_ID || !SA_INPUT) {
        console.error("Missing GA4_PROPERTY_ID or GA4_SERVICE_ACCOUNT_JSON environment variable.");
        process.exit(1);
    }

    const serviceAccount = loadServiceAccount(SA_INPUT);
    const accessToken = await fetchAccessToken(serviceAccount);

    // 1. Site-wide totals
    const summary = await runReport(accessToken, {
        dateRanges: [{ startDate: START_DATE, endDate: "today" }],
        metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
    });
    const summaryMetrics = summary.rows?.[0]?.metricValues ?? [];
    const totalViews = Number(summaryMetrics[0]?.value ?? 0);
    const totalUsers = Number(summaryMetrics[1]?.value ?? 0);

    // 2. Per-path page views (paginated, filtered to valid site routes)
    const validPaths = collectValidPaths();
    const pathCounts = new Map();
    const limit = 10000;
    let offset = 0;

    while (true) {
        const report = await runReport(accessToken, {
            dateRanges: [{ startDate: START_DATE, endDate: "today" }],
            dimensions: [{ name: "pagePath" }],
            metrics: [{ name: "screenPageViews" }],
            limit,
            offset,
        });

        const rows = report.rows ?? [];
        for (const row of rows) {
            const rawPath = row.dimensionValues?.[0]?.value ?? "/";
            const views = Number(row.metricValues?.[0]?.value ?? 0);
            if (views <= 0) continue;
            const key = normalizePath(rawPath);
            if (!validPaths.has(key) && !/^\/page\d+\/$/.test(key)) {
                continue;
            }
            pathCounts.set(key, (pathCounts.get(key) ?? 0) + views);
        }

        if (rows.length < limit) {
            break;
        }
        offset += limit;
    }

    const sortedPaths = Object.fromEntries(
        [...pathCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    );

    const snapshot = {
        totalViews,
        totalUsers,
        updatedAt: new Date().toISOString(),
        paths: sortedPaths,
    };

    writeFileSync(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    console.log(
        `Synced GA4 views: ${totalViews} total views, ${totalUsers} total users, ${Object.keys(sortedPaths).length} paths.`
    );
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
