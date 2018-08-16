if (typeof(Vue) !== "undefined") {
    Vue.component("download-link", {
        props: ["name", "info", "site", "width"],
        template:   `<a :class="width" :href="href" target="_blank" rel="noopener">
                        <div class="icon icon-cloud-download"></div>
                        {{name}}<br>version {{(info.version)}}
                        <span>Updated {{info.date}}.</span>
                    </a>`,
        computed: {
            href() {
                return `http://${this.site}/bin/${this.name}.v${this.info.version}.exe`;
            }
        }
    });
    Vue.component("history-download-link", {
        props: ["name", "url", "info", "site"],
        template:   `<li>
                        <div class="icon icon-cloud-download"></div>
                        <a class="link" :href="href" target="_blank" rel="noopener">
                            {{name}} {{info.version}}
                        </a>
                        ({{info.date}})
                    </li>`,
        computed: {
            href() {
                return `http://${this.site}/${this.url}/${this.name}.v${this.info.version}.7z`;
            }
        }
    });
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/json/tcupdate.json", true);
    xhr.onload = () => {
        if (xhr.readyState === 4 && xhr.getResponseHeader("content-type").indexOf("application/json") !== -1) {
            window.tcupdate = new Vue({
                el: "#tool-downloads",
                data: {
                    site: "7xsjmh.com2.z0.glb.clouddn.com",
                    data: JSON.parse(xhr.responseText)
                }
            });
        } else {
            console.error(xhr);
        }
    };
    xhr.onerror = () => {
        console.error(xhr.statusText);
    };
    xhr.send();
}
