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
        throw new Error(`GitHub API returned HTTP ${response.status}`);
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

function createHistoryItem(release: GitHubRelease): HTMLLIElement {
    const item = document.createElement("li");
    const icon = document.createElement("div");
    icon.className = "icon icon-cloud-download";
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
    const latestElement = document.querySelector<HTMLElement>(
        `[data-latest-release][data-owner="${owner}"][data-repo="${repo}"]`
    );
    const historyElement = document.querySelector<HTMLUListElement>(
        `[data-release-history][data-owner="${owner}"][data-repo="${repo}"]`
    );

    try {
        const releases = await fetchReleases(owner, repo);
        const latest = releases[0];
        if (latestElement && latest) {
            latestElement.setAttribute("href", releaseDownloadUrl(latest, true));
            const version = latestElement.querySelector("[data-release-version]");
            const date = latestElement.querySelector("[data-release-date]");
            if (version) {
                version.textContent = latest.tag_name;
            }
            if (date) {
                date.textContent = `Updated ${formatDisplayDate(latest.published_at)}.`;
            }
            latestElement.hidden = false;
        }

        if (historyElement) {
            historyElement.replaceChildren(...releases.map(createHistoryItem));
            historyElement.hidden = false;
        }
    } catch (error) {
        console.error(`[tcupdate] Failed to load ${owner}/${repo}`, error);
    }
}

const repositories = new Map<string, { owner: string; repo: string }>();
for (const element of document.querySelectorAll<HTMLElement>("[data-owner][data-repo]")) {
    const { owner, repo } = element.dataset;
    if (owner && repo) {
        repositories.set(`${owner}/${repo}`, { owner, repo });
    }
}

void Promise.all(
    [...repositories.values()].map(({ owner, repo }) => loadRepository(owner, repo))
);
