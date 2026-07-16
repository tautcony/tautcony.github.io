# baselines

可选的**完整旧站快照**目录，供 `scripts/test/eval-*.mjs` 做内容/视觉对照。

| 路径 | 入库？ | 说明 |
|------|--------|------|
| `jekyll-site/` | 否（gitignore） | 切流前 `_site` 冻结树 |
| `jekyll-site.meta.json` | 是 | 血统与捕获时间 |

无法从当前树重新 `jekyll build`。没有本机 baseline 时跳过 eval 即可；路由/资源小门禁用 `mig/fixtures/`。
