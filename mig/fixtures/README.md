# fixtures

入库的**小体积 baseline**，用于可选路由/资源对照（见 [`../README.md`](../README.md)）。

| 文件 | 说明 |
|------|------|
| `legacy-post-urls.txt` | 42 条文章最终 URL |
| `routes-jekyll.txt` | 切流前全站 HTML/XML 路径快照 |
| `assets-jekyll.json` | 稳定静态资源 URL + size + sha256 |
| `consistency-allowlist.json` | 内容/DOM 已知差异登记（eval 用） |
| `visual/` | 视觉截图 baseline/current/diff（大体量，多半 gitignore） |

## 使用

```bash
npm run build

node scripts/test/compare-routes.mjs \
  --scope posts --legacy mig/fixtures/legacy-post-urls.txt --dist dist

node scripts/test/compare-routes.mjs \
  --scope all --legacy mig/fixtures/routes-jekyll.txt --dist dist

node scripts/test/compare-assets.mjs \
  --legacy mig/fixtures/assets-jekyll.json --dist dist
```

路径比较会把 `/foo/index.html` 规范为 `/foo/`。  
有意增删路径或改稳定静态文件时，请同步更新对应 fixture。

> 文件名里的 `jekyll` 只表示「切流前快照来源」，不是可再构建的 Jekyll 工程。
