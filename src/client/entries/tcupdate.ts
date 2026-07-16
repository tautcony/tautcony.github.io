interface GithubAsset {
    browser_download_url: string;
    content_type: string;
}

interface GithubRelease {
    assets: GithubAsset[];
    name: string | null;
    node_id: string;
    published_at: string;
    tag_name: string;
    zipball_url: string;
}

const binaryTypes = new Set([
    "application/octet-stream",
    "application/x-7z-compressed",
    "application/x-msdownload",
    "application/zip",
]);

async function getReleases(owner: string, repo: string): Promise<GithubRelease[]> {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
        credentials: "omit",
        headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw new Error(`GitHub API returned HTTP ${response.status}`);
    return response.json() as Promise<GithubRelease[]>;
}

function releaseUrl(release: GithubRelease, latest: boolean): string {
    const asset = release.assets.find(item =>
        latest ? item.content_type === "application/x-msdownload" : binaryTypes.has(item.content_type)
    );
    return asset?.browser_download_url || release.zipball_url;
}

function displayDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toDateString();
}

async function loadRepository(owner: string, repo: string): Promise<void> {
    const latestElement = document.querySelector<HTMLElement>(
        `[data-latest-release][data-owner="${owner}"][data-repo="${repo}"]`
    );
    const historyElement = document.querySelector<HTMLUListElement>(
        `[data-release-history][data-owner="${owner}"][data-repo="${repo}"]`
    );

    try {
        const releases = await getReleases(owner, repo);
        const latest = releases[0];
        if (latestElement && latest) {
            latestElement.setAttribute("href", releaseUrl(latest, true));
            const version = latestElement.querySelector("[data-release-version]");
            const date = latestElement.querySelector("[data-release-date]");
            if (version) version.textContent = latest.tag_name;
            if (date) date.textContent = `Updated ${displayDate(latest.published_at)}.`;
            latestElement.hidden = false;
        }

        if (historyElement) {
            historyElement.replaceChildren(
                ...releases.map(release => {
                    const item = document.createElement("li");
                    const icon = document.createElement("div");
                    icon.className = "icon icon-cloud-download";
                    const link = document.createElement("a");
                    link.className = "link";
                    link.href = releaseUrl(release, false);
                    link.target = "_blank";
                    link.rel = "noopener";
                    link.textContent = release.name || release.tag_name;
                    item.append(icon, link, ` (${displayDate(release.published_at)})`);
                    return item;
                })
            );
            historyElement.hidden = false;
        }
    } catch (error) {
        console.error(`[tcupdate] Failed to load ${owner}/${repo}`, error);
    }
}

const repositories = new Map<string, { owner: string; repo: string }>();
for (const element of document.querySelectorAll<HTMLElement>("[data-owner][data-repo]")) {
    const { owner, repo } = element.dataset;
    if (owner && repo) repositories.set(`${owner}/${repo}`, { owner, repo });
}

void Promise.all([...repositories.values()].map(({ owner, repo }) => loadRepository(owner, repo)));
