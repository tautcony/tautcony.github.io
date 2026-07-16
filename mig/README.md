# `mig/` — 档案、契约与可选对照

本目录**不是**日常开发入口（日常见仓库根 [`README.md`](../README.md)）。  
这里放的是：冻结契约数据、历史 Jekyll 档案、以及迁移期留下的对照工具与设计文档。

## 目录

| 路径 | 用途 |
|------|------|
| [`contracts.md`](./contracts.md) | **现行冻结契约**（URL / lastmod / 静态路径 / 样式约定） |
| [`fixtures/`](./fixtures/) | 入库的路由与资源 baseline（小文件，可 diff） |
| [`legacy/`](./legacy/) | 只读 Jekyll 配置与草稿归档（**不参与构建**） |
| [`baselines/`](./baselines/) | 本地可选的完整旧站快照（大体量，默认 gitignore） |
| [`reports/`](./reports/) | 本地 eval 报告输出（gitignore） |
| [`archive/`](./archive/) | 迁移计划与实施造册（历史文档，不再维护为「下一步」） |

## 现行站点要点（摘要）

- 内容唯一源：`src/content/posts/`
- 站点配置：`src/data/site.ts`、`src/data/pages.ts`
- 展示用更新日期：`src/data/lastmod.json`（`npm run lastmod:check`）
- 静态资源：`public/`（稳定 URL）
- 生产构建：`npm run ci` → `dist/` → GitHub Pages / Docker(nginx)

## 可选对照（不进 CI）

package 已不再注册 `verify:*` / `eval:*`。需要时直接跑脚本：

```bash
# 路由 / 资源相对 fixtures
node scripts/test/compare-routes.mjs --scope posts --legacy mig/fixtures/legacy-post-urls.txt --dist dist
node scripts/test/compare-routes.mjs --scope all --legacy mig/fixtures/routes-jekyll.txt --dist dist
node scripts/test/compare-assets.mjs --legacy mig/fixtures/assets-jekyll.json --dist dist

# 相对完整 baseline（需本机 mig/baselines/jekyll-site/）
node scripts/test/eval-consistency.mjs
node scripts/test/eval-visual.mjs
```

有意改 URL 或 `public/` 稳定资源时：**先更新 fixture**，再改代码，避免 silent drift。

## 历史文档

迁移全过程（M0–M6 计划、PROGRESS、一致性评估设计等）在 [`archive/`](./archive/)。  
内容可能与现状不一致；以根 `README.md`、`src/**` 和本目录 `contracts.md` / `fixtures` 为准。
