> **历史档案**（`mig/archive/`）。现行说明见 [`../README.md`](../README.md)、[`../contracts.md`](../contracts.md)。

# 00 — 目标、约束与成功标准

## 1. 目标

| 优先级 | 目标 |
|--------|------|
| P0 | **视觉冻结**：布局、字体、颜色、间距、代码块外观与现站一致（肉眼/截图可对比） |
| P0 | **URL 冻结**：历史文章路径、分页、`/archive/`、`/about/`、`/tcupdate.html`、`/404.html`、`/feed.xml`、`/sitemap.xml`、`/robots.txt` 不变 |
| P0 | **功能等价**：侧栏目录、标签筛选、语录、KaTeX、PDF embed、utterances、粒子 404、tcupdate 下载页 |
| P1 | **去掉 Ruby**：日常开发与 CI 仅 Node；删除 `Gemfile` / `bin/with-ruby` / Jekyll 依赖 |
| P1 | **工具链统一**：锁定 Astro/集成版本，使用 Astro 内置 Vite；合并现有 `vite.config.mjs` 多入口思路 |
| P2 | 保留可观测性：Sentry、GA（若启用）、构建期 lastmod |

## 2. 非目标

- 不借迁移做 Bootstrap class 重命名 / 设计系统大改
- 不把所有页面改成 Astro Islands 重度交互架构
- 不迁移到子路径 `base`（现 `baseurl: ""`）
- 不解决 fonts 体积（Iosevka 子集）——可并行，不阻塞 Astro

## 3. 硬约束

1. **样式源码只读（迁移期）**
   `styles/**`、`css/fonts.css`、`css/iosevka.css`、`fonts/**` 默认不改语义；仅允许为适配高亮 DOM 做 **syntax 局部** 或 **路径 import** 调整。

2. **DOM class 契约**
   模板输出的关键 class 必须与现 Liquid 一致（见 [03-mapping-tables.md](./03-mapping-tables.md) 与 [04-styles-freeze.md](./04-styles-freeze.md)）。

3. **评论绑定 pathname**
   utterances `issue-term: pathname` → 路径变化 = 评论断裂。

4. **GitHub Pages**
   继续 Actions `upload-pages-artifact` + `deploy-pages`；产物为纯静态目录。

5. **Node ≥ 22.12.0**（Astro 7 的运行时要求；`.nvmrc`、`package.json.engines`、CI、Docker 必须一致）。

6. **双栈不提前搬源**：PR1–PR4 不删除或移动 `_posts`、根静态资源；Astro 使用复制/同步副本。`_config.yml` 临时排除 `src/`、`astro.config.mjs` 等 Astro 文件，避免旧 Jekyll 产物污染。

7. **客户端入口只在浏览器执行**：`blog.ts`、`page404.ts`、`tcupdate.jsx` 必须通过页面 `<script type="module" src="...">` 或明确的 client-only 方式挂载，禁止在 Astro frontmatter import。

## 4. 成功标准（可量化）

| 项 | 标准 |
|----|------|
| URL | 文章 42 条 legacy URL 100% 命中；M3/M4 再对全站路径做精确对比，差集仅允许显式登记的新增/弃用路径 |
| 样式 | 首页 / 文章 / 归档 / 404 / about / tcupdate 六类页截图 diff 可接受（无布局错位） |
| 构建 | `npm run build` 单命令产出完整站点；CI 无 Ruby |
| 内容 | 42 篇文章全部可打开；front matter 字段不丢 |
| 脚本 | 目录、外链标记、tag 筛选、quote、pdf-embed、亮度快捷键可用 |
| 评论 | 抽检 2～3 篇旧帖及 `/about/`，utterances 仍挂到原 issue/pathname |
| 资源 | 全量 `img/attach/fonts/css/json/arknights/CNAME/robots.txt` URL+字节数/hash 对比；Markdown 引用无 404 |
| 验收 | 固定六类页面的桌面/移动截图基线和像素阈值；HTTP smoke 覆盖全路由 |
| 性能 | 主 JS 体积不显著回退（现 `tc-blog` ~155KB 量级） |

## 5. 工期粗估

| 阶段 | 内容 | 人日 |
|------|------|------|
| M0 | 脚手架 + 样式接入 + 壳布局 | 1–2 |
| M1 | 内容集合 + 文章页 + Markdown 对齐 | 2–3 |
| M2 | 首页分页 / 归档 / about / 特殊页 | 2–3 |
| M3 | 脚本挂载 + lastmod + RSS/sitemap | 1–2 |
| M4 | CI/Docker 切换 + 全量验收 + 清理 Jekyll | 1–2 |
| **合计** | | **约 10–16 人日**（含迁移器、对比门禁和回滚演练） |

可拆多个 PR；建议 **feature 分支 `astro-migration`**，主站在切换前仍跑 Jekyll。

## 6. 决策记录（迁移前需确认）

| # | 议题 | 建议默认 |
|---|------|----------|
| D1 | 仓库策略：同仓替换 vs `astro/` 子目录过渡 | **同仓 feature 分支**，完成后根目录即 Astro |
| D2 | Markdown 引擎 | **Astro Content + remark/rehype**；高亮适配现有 class |
| D3 | `tcupdate` Vue | **保留 Vue client 入口**，后续可删 |
| D4 | 双栈并行期 | PR1–PR4 必须运行 Jekyll vs Astro route/resource/content diff；PR5 后保留 fixture compare |
| D5 | `html lang` | 保持 `en`（与现决策一致） |
| D6 | 版本基线 | Astro `7.0.7`、Node `>=22.12.0`；提交 lockfile，依赖升级单独 PR |
| D7 | 输出格式 | `build.format: 'preserve'`；文章使用 `.../[slug]/index.astro`，特殊页的 `.html` 路径逐项断言 |
| D8 | 双栈内容源 | PR1–PR4 保留 `_posts`/根资源；Astro 副本由迁移脚本生成，PR5 切流后才删除旧源 |
