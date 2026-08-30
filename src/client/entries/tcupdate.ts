interface GitHubAsset {
    browser_download_url: string;
    content_type: string;
}

interface GitHubRelease {
    assets: GitHubAsset[];
    name: string | null;
    node_id: string;
    published_at: string;
    tag_name: string;
    zipball_url: string;
}

interface ReleaseCache {
    releases: GitHubRelease[];
    savedAt: number;
}

const CACHE_PREFIX = "tcupdate:github-releases:";

function readCachedReleases(owner: string, repo: string): GitHubRelease[] | null {
    try {
        const raw = localStorage.getItem(`${CACHE_PREFIX}${owner}/${repo}`);
        if (!raw) {
            return null;
        }
        const cache = JSON.parse(raw) as Partial<ReleaseCache>;
        return Array.isArray(cache.releases) ? cache.releases : null;
    } catch {
        return null;
    }
}

function writeCachedReleases(owner: string, repo: string, releases: GitHubRelease[]): void {
    try {
        const cache: ReleaseCache = { releases, savedAt: Date.now() };
        localStorage.setItem(`${CACHE_PREFIX}${owner}/${repo}`, JSON.stringify(cache));
    } catch {
        // Storage can be unavailable or full; network results still render normally.
    }
}

const BINARY_CONTENT_TYPES = new Set([
    "application/octet-stream",
    "application/x-7z-compressed",
    "application/x-msdownload",
    "application/zip",
]);

async function fetchReleases(owner: string, repo: string): Promise<GitHubRelease[]> {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
        credentials: "omit",
        headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) {
        let message = `GitHub API returned HTTP ${response.status}`;
        try {
            const payload = await response.json() as { message?: unknown };
            if (typeof payload.message === "string" && payload.message.trim()) {
                message = payload.message.trim();
            }
        } catch {
            // Keep the HTTP status when the error response is not JSON.
        }
        throw new Error(message);
    }
    return response.json() as Promise<GitHubRelease[]>;
}

function releaseDownloadUrl(release: GitHubRelease, preferExe: boolean): string {
    const asset = release.assets.find(item =>
        preferExe
            ? item.content_type === "application/x-msdownload"
            : BINARY_CONTENT_TYPES.has(item.content_type)
    );
    return asset?.browser_download_url || release.zipball_url;
}

function formatDisplayDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toDateString();
}

function renderReleases(
    owner: string,
    repo: string,
    releases: GitHubRelease[],
): void {
    const latestElement = document.querySelector<HTMLElement>(
        `[data-latest-release][data-owner="${owner}"][data-repo="${repo}"]`
    );
    const historyElement = document.querySelector<HTMLUListElement>(
        `[data-release-history][data-owner="${owner}"][data-repo="${repo}"]`
    );
    const toggleElement = document.querySelector<HTMLButtonElement>(
        `[data-release-history-toggle][data-owner="${owner}"][data-repo="${repo}"]`
    );
    const latest = releases[0];

    if (latestElement && latest) {
        latestElement.setAttribute("href", releaseDownloadUrl(latest, true));
        const version = latestElement.querySelector("[data-release-version]");
        const date = latestElement.querySelector("[data-release-date]");
        if (version) version.textContent = latest.tag_name;
        if (date) date.textContent = `Updated ${formatDisplayDate(latest.published_at)}.`;
    }
    if (historyElement) {
        const items = releases.map(createHistoryItem);
        let expanded = toggleElement?.getAttribute("aria-expanded") === "true";
        items.forEach((item, index) => {
            item.hidden = index >= 10 && !expanded;
        });
        historyElement.replaceChildren(...items);
        historyElement.hidden = false;
        if (toggleElement) {
            toggleElement.hidden = releases.length <= 10;
            toggleElement.setAttribute("aria-expanded", String(expanded));
            toggleElement.textContent = expanded ? "Hide older releases" : "Show older releases";
            toggleElement.onclick = () => {
                expanded = !expanded;
                items.forEach((item, index) => {
                    item.hidden = index >= 10 && !expanded;
                });
                toggleElement.setAttribute("aria-expanded", String(expanded));
                toggleElement.textContent = expanded ? "Hide older releases" : "Show older releases";
            };
        }
    }
}

function updateStatus(message: string): void {
    const status = document.querySelector<HTMLElement>("#release-status");
    if (status) {
        status.textContent = message;
        status.classList.toggle("is-error", message.includes("GitHub:"));
    }
}

function createHistoryItem(release: GitHubRelease): HTMLLIElement {
    const item = document.createElement("li");
    // Icon is painted by CSS (mask) — no SVG markup in JS.
    const icon = document.createElement("span");
    icon.className = "icon";
    icon.setAttribute("aria-hidden", "true");
    const link = document.createElement("a");
    link.className = "link";
    link.href = releaseDownloadUrl(release, false);
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = release.name || release.tag_name;
    item.append(icon, link, ` (${formatDisplayDate(release.published_at)})`);
    return item;
}

async function loadRepository(owner: string, repo: string): Promise<void> {
    const cached = readCachedReleases(owner, repo);
    if (cached && cached.length > 0) {
        renderReleases(owner, repo, cached);
    }

    try {
        const releases = await fetchReleases(owner, repo);
        renderReleases(owner, repo, releases);
        writeCachedReleases(owner, repo, releases);
        updateStatus("Latest release information retrieved.");
    } catch (error) {
        console.error(`[tcupdate] Failed to load ${owner}/${repo}`, error);
        const latestElement = document.querySelector<HTMLElement>(
            `[data-latest-release][data-owner="${owner}"][data-repo="${repo}"]`
        );
        if (latestElement) {
            const version = latestElement.querySelector("[data-release-version]");
            if (version && version.textContent === "…") {
                version.textContent = "n/a";
            }
        }
        const message = error instanceof Error
            ? error.message
            : "Unable to retrieve release information. Please try again later.";
        updateStatus(cached
            ? `Showing cached release information. GitHub: ${message}`
            : `GitHub: ${message}`);
    }
}

const repositories = new Map<string, { owner: string; repo: string }>();
for (const element of document.querySelectorAll<HTMLElement>("[data-owner][data-repo]")) {
    const { owner, repo } = element.dataset;
    if (owner && repo) {
        repositories.set(`${owner}/${repo}`, { owner, repo });
    }
}

updateStatus("Refreshing GitHub releases...");
void Promise.all(
    [...repositories.values()].map(({ owner, repo }) => loadRepository(owner, repo))
);
