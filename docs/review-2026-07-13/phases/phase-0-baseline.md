# Phase 0 审查报告: 基线与范围

> 日期: 2026-07-13  
> 文件数: mig/ 全部 15 个文档/fixture + 必要的仓库入口  
> 发现: P0(0) / P1(10) / P2(0) / INFO(0)  
> 导航: [返回 review index](../index.md) | [查看修复 checklist](../fix-checklist.md)

## 已审查文件

- `mig/README.md`、`mig/00-overview.md` 至 `mig/09-acceptance-and-risks.md`
- `mig/fixtures/*`
- `package.json`、`.nvmrc`、`_config.yml`、`.github/workflows/build.yml`、`Dockerfile`、`.dockerignore`
- `_posts/*`、`_layouts/*`、`_includes/*`、`ts/*`、`styles/*`、`scripts/*`

## Baseline

当前仓库仍是 Jekyll + Vite，存在 42 篇文章（40 个 `.markdown`、2 个 `.md`）、一个只被方案提及但尚未创建的 `scripts/compare-routes.mjs`，以及现有 Jekyll 的 `/sitemap.xml`、`/robots.txt` 等产物。`mig/` 覆盖面广，目标是 Astro SSG、视觉/URL 冻结和去 Ruby；但多个关键协议仍停留在“或”“必要时”“查阅版本”的选择状态。

本次重点检查了：默认/未知输入、失败与回滚、状态半完成窗口、Markdown/HTML 渲染、URL/文件名/时间隐式协议、构建产物和静态资源差异。

## Findings

### P0-P1-1: [P1] Astro 版本、Content Collections API 与 Node 约束互相不兼容

- 位置: `mig/02-astro-architecture.md:7-17`、`mig/05-content-and-markdown.md:8-38`、`mig/07-phases.md:17-20`、`package.json:14-16`
- 触发条件: 按“最新稳定 major”安装当前 Astro（本次 `npm view astro version` 为 7.0.7），但照方案使用 `src/content/config.ts`、`type: "content"`；本地仍允许 Node 20，`.nvmrc` 只有 `22`。
- 影响: 新版 Content Layer 使用 `src/content.config.ts`/loader；当前 Astro 7 要求 Node `>=22.12.0`。按文档在 Node 20 或旧 API 上会在安装、`astro check` 或 build 阶段失败，无法形成可复现迁移。
- 修复方向: 先锁定 Astro、集成包、Node 的具体版本和 lockfile；二选一，升级最低 Node 并按当前 Content Layer API 实施，或固定兼容旧 API 的 Astro major。loader 必须显式纳入 `.markdown`。

### P0-P1-2: [P1] 文章、分页、tcupdate、sitemap 的目标 URL 没有可执行的统一输出方案

- 位置: `mig/02-astro-architecture.md:65-74,106-122,180-186`、`mig/07-phases.md:84-88,112-116`、`mig/fixtures/routes-jekyll.txt:43-53`
- 触发条件: `build.format: 'directory'` 下使用 `src/pages/page/[n].astro` 不能生成 `/page2/`，只会形成 `/page/2/` 形状；同一设置下 `src/pages/tcupdate.astro` 不能保证 `/tcupdate.html`。sitemap 还允许 `/sitemap-index.xml` 或 `/sitemap.xml`，与 fixture 的精确路径不一致。
- 影响: 分页、工具页、站点地图任一落成默认形状都会破坏冻结 URL、导航或 SEO；`prerender` 不会改变输出文件名。
- 修复方向: 固定输出策略并写成文件布局，例如使用 `preserve`/`file` 配合 `index.astro`、显式 `tcupdate.html.astro` 或确定的 endpoint/integration；锁定 `/sitemap.xml`。在 build 后断言每个精确文件存在且不存在错误替代路径。

### P0-P1-3: [P1] 双栈阶段的资源和文章搬迁会先破坏 Jekyll

- 位置: `mig/07-phases.md:21-32,48-52`、`mig/02-astro-architecture.md:23-35`
- 触发条件: M0 允许把根目录 `img/attach/fonts/css/json/...` `git mv` 到 `public/`，M1 又建议把 `_posts` `git mv` 到 `src/content/posts`，但同一阶段要求 Jekyll 仍可用、CI 与双产物对比仍运行。
- 影响: Jekyll 只扫描 `_posts`，且当前 `_config.yml` 没有把 `public/` 作为旧站资源源；旧构建会出现零文章或资源 404，双栈对比失去基线。
- 修复方向: 双栈期间保留单一根目录源并用同步脚本，或先复制到 Astro、保持旧目录直到切流，再在最后一个 PR 原子删除；每阶段检查 Jekyll/Astro 文章数、静态资源数和关键资源 HTTP 200。

### P0-P1-4: [P1] legacy URL 表的 key 与 Astro entry id 没有稳定协议

- 位置: `mig/05-content-and-markdown.md:75-99`、`mig/fixtures/legacy-post-urls.json:2-43`、`mig/07-phases.md:48-55`
- 触发条件: 伪代码直接使用 `legacyMap[post.id]`，fixture key 是带 `.markdown`/`.md` 的原文件名；Astro Content Layer 的默认 id 是基于文件名生成的 URL-friendly id，通常去扩展名且可能变大小写。
- 影响: 42 篇映射可能全部 miss，随后静默回退到日期/文件名推算；已知 `2017-04-23` 文件对应 `2017/04/24` 的异常、大小写 slug 和评论 pathname 都可能回归。
- 修复方向: 迁移脚本生成显式 `legacyPath`/`sourceFilename`，或用 `glob.generateId` 固定包含扩展名的 key；构建时要求 42/42 命中、无重复 URL、无 fallback，失败即退出。

### P0-P1-5: [P1] lastmod 在 rename、Docker 和 CI 场景下会产生错误或空数据

- 位置: `scripts/generate-lastmod.mjs:28-33,61-74`、`mig/05-content-and-markdown.md:140-150`、`mig/08-ci-deploy-docker.md:47-59`
- 触发条件: 方案仅要求 `git mv`，但脚本没有 `--follow`，而 rename 提交本身会成为新路径的最新提交；Docker 又按计划排除 `.git` 后执行包含 lastmod 的 build。
- 影响: 全部文章显示迁移提交日期，或 Docker 产物收到空 lastmod map；Pages、Docker 与本地 preview 的内容不一致。
- 修复方向: 在迁移前冻结 legacy lastmod fixture，或实现按旧路径/rename commit 过滤的可测试脚本；Docker 显式注入已生成 map/版本元数据，不要依赖被 `.dockerignore` 删除的 Git 历史。

### P0-P1-6: [P1] 建议 schema 无法直接解析现有 42 篇 front matter

- 位置: `mig/05-content-and-markdown.md:8-38,41-73`；例 `_posts/2018-03-31-binary-search-in-a-rotated-sorted-array.markdown:7`、`_posts/2021-12-05-chinagoldcoin-lottery-preview.markdown:11-12`
- 触发条件: schema 将 `headerImg` 设为 string、`tags` 设为 string 数组，但现有文章有 `header-img: null`，至少三篇 tags 含 YAML 空项（解析为 null）；旧键到新键的 transform 也没有 null 清洗规则。
- 影响: Content Collection 在 M1 全量构建时直接校验失败，或清洗不一致导致页面头图/标签语义变化，42 篇“全部 200”无法达到。
- 修复方向: 先运行 front matter 迁移器并保存 before/after；schema 明确 nullable/空项策略，统一 `header-img` 映射；加入 42 篇逐篇 parse 门禁和字段快照。

### P0-P1-7: [P1] 站点配置、逐页 front matter 和页面依赖映射不完整

- 位置: `mig/02-astro-architecture.md:158-177`、`mig/03-mapping-tables.md:48-63`；对照 `_config.yml:15-37,93-121,125-170`、`about.html:1-7`、`archive.html:1-6`、`404.html:1-10`
- 触发条件: site.ts 草图/映射表未覆盖 sidebar、friends、featured-tags 阈值、GA、Google verification、RSS、excerpt separator 等；posts schema 也没有 about/archive/404 的 page-level `header-img`/description 数据方案。about 还显式包含评论，404 现状同时依赖 default layout 的主站 CSS，均未在页面步骤中锁定。
- 影响: 侧栏、朋友链接、统计/验证 meta、摘要分隔符、about/archive/404 头图/文案、about 评论和 404 布局可能静默退化，视觉冻结和 SEO 目标失效。
- 修复方向: 建立逐键配置清单和 page schema/props；每个键标注保留、删除或替代，并对六类页面做 HTML/meta 快照断言。

### P0-P1-8: [P1] URL/资源对比门禁尚未存在且验收时机/fixture 覆盖不足

- 位置: `mig/02-astro-architecture.md:90-92`、`mig/07-phases.md:63-72`、`mig/fixtures/README.md:7-24`
- 触发条件: M1 的交付要求完整 `routes-jekyll.txt` 与 dist 差集为 0，但 about/archive/page/feed/sitemap/tcupdate 分别到 M2/M3 才实施；同时验收命令调用当前不存在的 `scripts/compare-routes.mjs`，已有 fixture 只生成 `*.html`/`*.xml`，没有 `img/attach/fonts/css/json/arknights/CNAME/robots.txt` 的清单或 hash。
- 影响: M1 验收时机不可达，命令会直接 ENOENT，或仅比较 HTML/XML 时漏掉字体、PDF、quote、404 背景和 robots 等运行时故障，形成“差集为 0”的假绿。
- 修复方向: M0/M1 实现并固定 compare 脚本，规范化 `index.html`/尾斜杠/允许弃用路径；同时生成全量静态资源 URL+size/hash 清单，并将其作为 required CI check。

### P0-P1-9: [P1] 切流回滚 runbook 没有可执行入口

- 位置: `mig/08-ci-deploy-docker.md:88-106`、`mig/09-acceptance-and-risks.md:63-72`、`.github/workflows/build.yml:3-7,61-75`
- 触发条件: runbook 说“重新跑 pre-astro tag 对应 workflow”，但当前 workflow 仅监听 master push/PR，没有 `workflow_dispatch` 或 tag deploy job；也没有在切流前保存可部署的旧 Pages artifact。局部 URL 分支提到的 `public/_redirects` 也不是 GitHub Pages 的通用重定向机制。
- 影响: 线上异常时 tag 不会自动触发 deploy，单靠“git revert”还需重新通过构建和审批，回滚时间与结果不确定。
- 修复方向: 切流前预构建并保留旧 artifact，或增加受保护的 tag/manual deploy workflow；写明权限、产物、验证和演练结果，至少完成一次真实回滚演练。

### P0-P1-10: [P1] browser-only entry 的 Astro 挂载边界未固定

- 位置: `mig/02-astro-architecture.md:139-143,190-197`、`mig/06-frontend-scripts.md:5-10,67-74`；`ts/entries/blog.ts:17-22,68-75`、`ts/entries/page404.ts:15-18`、`ts/entries/tcupdate.jsx:25-125`
- 触发条件: 方案同时允许在 Astro layout 中 `import` entry 和输出 `<script src>`；这些 entry 顶层访问 `location`/`navigator`/`document` 或直接 mount Vue。若被放入 Astro frontmatter，SSG 构建会执行浏览器代码。
- 影响: build 阶段 ReferenceError，或页面脚本重复执行/挂载；特殊页和主站可能无法产出。
- 修复方向: 统一使用 Astro client `<script type="module" src>`/隔离 client entry，禁止 frontmatter import；或为所有入口加明确的 browser guard，并用 build + preview smoke 验证只挂载一次。

## 漏检复盘

- 默认分支/未知输入：检查了路由参数、缺失 front matter 和 sitemap/robots 的默认路径。
- 异步失败/前提失效：检查了 tcupdate GitHub API、PDF/quote 等客户端入口及构建前提；未发现新的 P1 async 缺陷。
- 半完成状态/重建窗口：重点检查了双栈搬迁、lastmod、Docker 构建和 rollback。
- 渲染/导出/编码：检查了 Markdown raw HTML、Liquid include、front matter 解析、静态资源和 RSS；细节问题见后续 phase。

## 未覆盖区域

- 尚未运行 Astro 实际迁移构建，因为目标实现尚不存在；浏览器视觉和第三方 CDN 运行时需在实现后验证。
