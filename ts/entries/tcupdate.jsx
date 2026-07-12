/* eslint-disable camelcase */
import "../../less/tcupdate.less";
import { createApp } from "vue";

async function getJSON(url) {
    const response = await fetch(url, { credentials: "omit" });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}

const funcMixin = {
    methods: {
        time2date(timeString) {
            const date = new Date(timeString);
            if (Number.isNaN(date.getTime())) {
                return timeString;
            }
            return date.toDateString();
        },
    },
};

const app = createApp({});
app.component("download-link", {
    props: ["owner", "repo", "width"],
    render() {
        return (
            <a class={this.width} href={this.info2url(this.info)} target="_blank" rel="noopener">
                <div class="icon icon-cloud-download"></div>
                {this.repo.replace(/-/g, "")}
                <br/>
                version {this.info.tag_name}
                <span>Updated {this.time2date(this.info.published_at)}.</span>
            </a>
        );
    },
    data() {
        return {
            info: {
                assets: [{ browser_download_url: "#", name: "Loading..." }],
                name: "Loading...",
                tag_name: "Loading...",
                published_at: "Loading...",
            },
        };
    },
    created() {
        getJSON(`https://api.github.com/repos/${this.owner}/${this.repo}/releases/latest`)
            .then(data => {
                this.info = data;
            })
            .catch(exception => {
                console.error(`[${exception.message}] Failed to load from '${this.owner}/${this.repo}/latest'`);
            });
    },
    mixins: [funcMixin],
    methods: {
        info2url(info) {
            const assets = info.assets.filter(item => item.content_type === "application/x-msdownload");
            if (assets.length === 0) {
                return info.zipball_url;
            }
            return assets[0].browser_download_url;
        },
    },
});
app.component("history-download", {
    props: ["owner", "repo"],
    render() {
        return (
            <ul id={"all-releases_" + this.repo}>
                {
                    this.all_release.map(info => (
                        <li key={info.node_id}>
                            <div class="icon icon-cloud-download"></div>
                            <a class="link" href={this.browser_download_url(info)} target="_blank" rel="noopener">
                                {info.name}
                            </a>
                            {` (${this.time2date(info.published_at)})`}
                        </li>
                    ))
                }
            </ul>
        );
    },
    data() {
        return {
            all_release: [
                {
                    assets: [{ browser_download_url: "#", name: "Loading..." }],
                    node_id: "",
                    name: "Loading...",
                    published_at: "Loading...",
                },
            ],
        };
    },
    created() {
        getJSON(`https://api.github.com/repos/${this.owner}/${this.repo}/releases`)
            .then(data => {
                this.all_release = data;
            })
            .catch(exception => {
                console.error(`[${exception.message}] Failed to load from '${this.owner}/${this.repo}'`);
            });
    },
    mixins: [funcMixin],
    methods: {
        browser_download_url(info) {
            const assets = info.assets.filter(item =>
                item.content_type === "application/octet-stream" ||
                item.content_type === "application/x-7z-compressed" ||
                item.content_type === "application/zip"
            );
            if (assets.length === 0) {
                return info.zipball_url;
            }
            return assets[0].browser_download_url;
        },
    },
});

app.mount("#tool-downloads");
