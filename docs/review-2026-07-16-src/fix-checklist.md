# Fix Checklist — `src/` 审查

> 主进度记录。状态: `[ ]` 未开始 / `[~]` 进行中 / `[x]` 完成 / `[-]` 不做（需写 justification）。  
> 详细论证见 [`findings.md`](./findings.md)；批次顺序见 [`fixes-plan.md`](./fixes-plan.md)。

## P1

### SRC-P1-1 — Geopattern 移出 blog client

- 状态: [x]
- 负责人: implementation 2026-07-16
- 目标: 无 header 图时的背景在 SSG（或 build-time lib）完成；`src/client/lib/geopattern` 不再进入主站 entry 图
- 步骤:

  - [x] 选定策略：SSG 内联 data URL（`IntroHeader` + `absoluteUrl(pageUrl)` seed）
  - [x] 改 `IntroHeader` / post 渲染路径写入背景
  - [x] `post.ts` 去掉 GeoPattern 与 style 探测
  - [x] 迁移 `src/client/lib/geopattern` → `src/lib/geopattern`
  - [x] 无图 / 有图文章 build 抽样（data URI vs 静态图）

- 备注: 无 `headerImg` 的 post 现用 GeoPattern（比原先误用 `site.headerImg` 更接近历史 credit）

### SRC-P1-2 — 死表面清理

- 状态: [x]
- 负责人: implementation 2026-07-16
- 目标: 主树无「存在但未接线」的 feature/DOM/配置
- 步骤:

  - [x] 删除 brightness / core-value 模块 + README 更新
  - [x] 删除未用 `shuffle`
  - [x] 删除 `PageLayout` `#webgl` + `.content_bg`
  - [x] 清理 about QR 空壳
  - [x] `excerptSeparator` 接入 `excerpts.ts`

- 备注: 另删 tcupdate 垃圾 meta（BaseUrl/假版本号）

### SRC-P1-3 — IntroHeader 去重

- 状态: [x]
- 负责人: implementation 2026-07-16
- 目标: post header 正文单源
- 步骤:

  - [x] 合并 `style-text` / default 两套 DOM
  - [x] 用 `class:list` 表达 style 差异
  - [x] lastmod / tags 单路径

- 备注:

### SRC-P1-4 — Client entry 按页收束

- 状态: [x]
- 负责人: implementation 2026-07-16
- 目标: feature 所有权可从 entry 读出
- 步骤:

  - [x] shell + dynamic import 按 mount point
  - [x] archive / about / pdf / post / catalog 离开默认同步 import
  - [x] 更新 `src/client/README.md` 挂载表
  - [x] build 产出分 chunk（about/archive/catalog/post/…）

- 备注:

### SRC-P1-5 — 拆 page-chrome

- 状态: [x]
- 负责人: implementation 2026-07-16
- 目标: catalog 与 chrome 分文件；table 选择器收紧
- 步骤:

  - [x] 抽出 `features/catalog.ts`
  - [x] `page-chrome` 只保留 scroll / gotop / tables
  - [x] table 限制在 `.post-content` / `.post-container`
  - [x] catalog 经动态 import 挂载

- 备注:

## P2

### SRC-P2-1 — Canonical helpers 归一

- 状态: [x]
- 负责人: implementation 2026-07-16
- 步骤:

  - [x] `src/lib/url.ts` `absoluteUrl`（feed / sitemap / Meta / GeoPattern seed）
  - [x] archive 使用 `collectTagCounts`
  - [x] Sidebar friends 单片段

- 备注:

### SRC-P2-2 — 契约诚实化

- 状态: [x]
- 负责人: implementation 2026-07-16
- 步骤:

  - [x] excerpt 使用 `site.excerptSeparator`；去掉双重 clean
  - [x] `getAllPosts()` 收敛页面 cast
  - [x] KaTeX 改为 `math === true`；5 篇公式文补 `math: true`
  - [x] `src/data/lastmod.ts` 类型边界

- 备注:

### SRC-P2-3 — 薄 class 包装（随改随清）

- 状态: [x]
- 负责人: implementation 2026-07-16
- 步骤:

  - [x] `navbar` / `title` 压平为函数式 init
  - [x] README 仍允许有状态 class（archive 等）

- 备注: ArchiveFilter / QuoteRotator 保留 class（有状态）

### SRC-P2-4 — 拆 tc-blog.scss

- 状态: [x]
- 负责人: implementation 2026-07-16
- 步骤:

  - [x] 拆为 `styles/blog/{base,post,nav,header,home,footer,forms,tags,misc}.scss`
  - [x] `tc-blog.scss` 仅保序 `@use`
  - [x] `npm run build` 通过

- 备注:

## INFO（可选）

| ID | 状态 | 说明 |
|----|------|------|
| SRC-INFO-1 | [x] | About QR 空壳已删；APlayer 仍页内联（可接受） |
| SRC-INFO-2 | [x] | tcupdate 垃圾 meta 已删 |
| SRC-INFO-3 | [ ] | RSS full HTML 保持 parity（明确不改） |
| SRC-INFO-4 | [x] | geopattern 已离 client；tag-cloud 色工具保留 |
| SRC-INFO-5 | [ ] | particle404 scene 暂不拆 |
| SRC-INFO-6 | [x] | table 选择器已收紧 |

## 进度摘要

| 级别 | 总数 | 完成 | 进行中 | 未开始 | 不做 |
|------|-----:|-----:|-------:|-------:|-----:|
| P1 | 5 | 5 | 0 | 0 | 0 |
| P2 | 4 | 4 | 0 | 0 | 0 |
| INFO | 6 | 4 | 0 | 2 | 0 |
