# Phase 1 审查报告: 内容与渲染协议

> 日期: 2026-07-13  
> 文件数: `mig/05-content-and-markdown.md`、内容 fixture、全部 `_posts` front matter/特殊片段  
> 发现: P0(0) / P1(0) / P2(4) / INFO(0)  
> 导航: [返回 review index](../index.md) | [查看修复 checklist](../fix-checklist.md)

## 已审查文件

- `mig/05-content-and-markdown.md`、`mig/fixtures/legacy-post-urls.json`
- 全部 `_posts/*.{md,markdown}`，重点检查 raw HTML、Liquid、日期、摘要和标题
- `feed.xml`、`index.html`、`_includes/pdf-embed.html`

## Findings

### P1-P2-1: [P2] 标题允许 HTML，但输出策略未定义

- 位置: `mig/05-content-and-markdown.md:16-25`；`_posts/2017-06-17-microserver-gen8-setup.markdown:3`
- 触发条件: 该文章 title 含 `<em class='logo'>hpe</em>`；若 Astro 模板用普通文本插值，会显示字面量标签，若用 `set:html` 又未定义白名单/转义边界。
- 影响: 标题、首页卡片、OG/meta 和导航可能与现站不一致，同时引入不必要的 HTML 注入面。
- 修复方向: 选择结构化 `titleHtml`/受限 inline markup 或迁移为纯文本+专用标记；对标题、subtitle、description 分别定义渲染和快照规则。

### P1-P2-2: [P2] Liquid include 和 raw HTML/script 的迁移没有强制门禁

- 位置: `mig/05-content-and-markdown.md:101-164`、`mig/07-phases.md:104-120`；`_posts/2016-08-08-rubiksrevenge.markdown:23`、`_posts/2020-04-20-enable-copy.markdown:19-22`
- 触发条件: 历史 Markdown 仍有 `{% include pdf-embed.html ... %}` 及 `<script>`/`<iframe>`；方案只写“需替换/抽检”，M1 却宣称全部文章可生成。
- 影响: 未替换时 Liquid 会以正文文本残留或导致处理失败，PDF/脚本/iframe 行为与安全边界不可控。
- 修复方向: M1 前扫描并转换所有 Liquid；构建失败条件为残留 `{%`/`{{`；建立 raw HTML 白名单并对 PDF、公式、iframe、脚本文章做全量渲染断言。

### P1-P2-3: [P2] 同日期文章的排序 tie-break 未定义

- 位置: `mig/02-astro-architecture.md:120-122`、`mig/07-phases.md:56-58`
- 触发条件: 两篇文章均为 2016-03-22；方案只写按 date 排序，未定义同日时按文件名、旧站序或时间戳排序。
- 影响: 首页分页、archive、prev/next 的内容序列可能因 JS sort/loader 遍历顺序改变，URL 虽正确但导航和分页内容回归。
- 修复方向: 固定与 Jekyll 一致的 tie-break，并把每一页的文章 id/URL 序列纳入 fixture diff。

### P1-P2-4: [P2] 新文章日期解析/时区规则未落地

- 位置: `mig/05-content-and-markdown.md:16-20,75-87`
- 触发条件: `z.coerce.date()` 与 JS `Date` 取年月日的行为受 Node/CI TZ 影响；方案只提醒旧文时区陷阱，未规定新文 date-only 与带 offset 的规则。
- 影响: 新文章 URL 和排序可能前后偏一天，旧文 legacy map 能兜底但新文没有同等保护。
- 修复方向: 用 date-only 字符串或显式 offset 解析，固定 CI TZ，并加入边界日期 fixture；禁止未声明时区的隐式 fallback。

## 漏检复盘

- 默认分支/未知输入：检查了空 tags、null header、Liquid 残留和未定义标题类型。
- 异步失败/前提失效：检查 PDF/脚本外部加载的构建边界；运行时失败需在实现后用浏览器复核。
- 半完成状态/重建窗口：检查内容迁移和摘要/分页序列，未发现额外状态写入问题。
- 渲染/导出/编码：已检查 raw HTML、标题 HTML、摘要 separator、RSS 字段；RSS 合同缺口记入跨模块建议。

## 未覆盖区域

- 未对新 Markdown pipeline 运行真实 parser/snapshot；需在版本锁定和迁移器完成后执行。
