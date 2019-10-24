require("../less/tcupdate");

if (typeof(Vue) !== "undefined") {
    Vue.filter("time2date", (time_string) => {
        const date = new Date(time_string);
        if (Number.isNaN(date.getTime())) {
            return time_string;
        }
        return date.toDateString();
    });
    Vue.filter("info2url", (info) => {
        const assets = info.assets.filter(item => item.content_type === "application/x-msdownload");
        if (assets.length === 0) {
            return info.zipball_url;
        }
        return assets[0].browser_download_url;
    });
    Vue.component("download-link", {
        props: ["owner", "repo", "width"],
        template:   `<a :class="width" :href="info | info2url" target="_blank" rel="noopener">
                        <div class="icon icon-cloud-download"></div>
                        {{this.repo.replace(/-/g, '')}}
                        <br>
                        version {{this.info.tag_name}}
                        <span>Updated {{this.info.published_at | time2date}}.</span>
                    </a>`,
        data() {
            return {
                info: {
                    assets: [{browser_download_url: "#", name: "Loading..."}],
                    name: "Loading...",
                    tag_name: "Loading...",
                    published_at: "Loading...",
                }
            };
        },
        created() {
            this.$http.get(`https://api.github.com/repos/${this.owner}/${this.repo}/releases/latest`).then(response => {
                this.info = response.data;
                // console.log(response);
            }).catch(exception => {
                console.error(`[${exception.status}] Failed to load from '${this.owner}/${this.repo}/latest'`);
            });
        }
    });
    Vue.component("history-download-link", {
        props: ["name", "published_at", "info"],
        template:   `<li>
                        <div class="icon icon-cloud-download"></div>
                        <a class="link" :href="browser_download_url" target="_blank" rel="noopener">
                            {{name}}
                        </a>
                        ({{published_at}})
                    </li>`,
        computed: {
            browser_download_url() {
                const assets = this.info.assets.filter(item => item.content_type === "application/octet-stream");
                if (assets.length === 0) {
                    return this.info.zipball_url;
                }
                return assets[0].browser_download_url;
            }
        }
    });
    Vue.component("history-download", {
        props: ["owner", "repo"],
        template: `
        <ul id="all-releases_ct">
            <history-download-link v-for="info in (this.all_release)"
                :key="info.node_id"
                :name="info.name"
                :published_at="info.published_at | time2date"
                :info="info"
            />
        </ul>`,
        data() {
            return {
                all_release: [
                    {
                        assets: [{browser_download_url: "#", name: "Loading..."}],
                        node_id: "",
                        name: "Loading...",
                        published_at: "Loading..."
                    }
                ]
            };
        },
        created() {
            this.$http.get(`https://api.github.com/repos/${this.owner}/${this.repo}/releases`).then(response => {
                this.all_release = response.data;
            }).catch(exception => {
                console.error(`[${exception.status}] Failed to load from '${this.owner}/${this.repo}'`);
            });
        }
    });
    window.tcupdate = new Vue({
        el: "#tool-downloads"
    });
}
