# Findings — `src/` 代码质量审查

> 日期: 2026-07-16  
> 优先级: P1 结构性 > 错失的大幅度简化 > spaghetti > 边界/类型 > 文件膨胀 > 模块性 > 可读性  
> 原则: 少而高确信；不堆砌低价值 nits。

---

## P1 — 结构性 / 可维护性阻塞

### SRC-P1-1

**Geopattern 约 2.1k LOC，仅为一个 client 调用点服务；层放错了。**

**证据**

- 树: `src/client/lib/geopattern/`（约 30 文件 / ~2100 行）
- 唯一业务调用:

```ts
// src/client/features/post.ts
const pattern = GeoPattern.generate(document.location.href);
banner.style.backgroundImage = pattern.toDataUrl();
```

- 入口链: `BaseLayout` → `entries/blog.ts` → `post.init()` → geopattern
- `Generator<T>` 为无共享行为的抽象基类（薄包装）
- 16 个 structure class + SVG/XML + SHA1 + color，典型 OOP 移植

**问题**

- 产品需求是 **无 header 图时的背景 fallback**，不是交互式运行时域。
- 纯函数（string → SVG）放在 browser 强制读 computed style，并把大体量依赖绑进主站 client 图。
- 抽象层级在「证明能移植库」与「本站真正需要什么」之间错位。

**Code judo（保行为优先）**

1. **SSG 时**对无 `headerImg` 的 post 生成 pattern（或等价 CSS），写入 `IntroHeader`，与真实图片同一路径。
2. 从 blog client **整树删除** geopattern。
3. 若必须保留 hash→pattern：放进 build-time `src/lib/`，不要进 `client/`。
4. 若 parity 不需要 16 种 structure：单文件简化生成器即可。

**验收**

- [ ] 主站 client 图不再包含 `src/client/lib/geopattern`
- [ ] 无 header 图文章视觉与现网等价（或可接受的冻结基线）
- [ ] 有 header 图路径零回归

---

### SRC-P1-2

**死表面（dead surface）仍是一等公民：未接线 feature、僵尸 DOM、死 helper、死配置。**

| 项 | 证据 |
|----|------|
| `features/brightness.ts`、`features/core-value.ts` | `src/client/README.md` 写明尚未接入 entry |
| `dom.shuffle` | 定义于 `src/client/lib/dom.ts`，无 import |
| `PageLayout` `#webgl` + `.content_bg` | 仅有 markup/CSS；无 client 绑定 |
| About `#qr-container`、`#donate`/`#qrcode` CSS | 无生成 QR 的 markup/JS |
| `site.excerptSeparator` | 仅 `site.ts` 定义；`excerpts.ts` 写死 `<!--more-->` |

```astro
<!-- src/layouts/PageLayout.astro -->
<div class="content_bg">
  <canvas id="webgl" ...></canvas>
</div>
```

**问题**

- 不是「无害残留」：读者会默认看到的代码都有效，排查与改动成本被放大。
- 配置键无单一消费者 → 契约漂移（改 site 不生效）。

**Code judo**

- **接线或删除**，禁止半残状态长期占主树。
- 删除：`brightness` / `core-value`（若近期不用）、`shuffle`、`#webgl`/`.content_bg`、about QR 空壳样式。
- `excerptSeparator`：要么 `getExcerpt` 读 `site.excerptSeparator`，要么删配置键。

**验收**

- [ ] README 不再列出「存在但未接线」的主树 feature（或明确标为 experimental 并移出默认路径）
- [ ] `grep` 无孤立 `excerptSeparator` / 无引用 `#webgl` 业务代码却仍留 canvas
- [ ] 死 helper 删除或被测试/调用覆盖

---

### SRC-P1-3

**`IntroHeader.astro` 在 post 路径上完整复制两套 header 树。**

**证据**

- `src/components/IntroHeader.astro`
- `headerStyle === "text"` 与 default：tags / titleHtml / meta / lastmod 近乎相同，约百行复制

**问题**

- 后续改 lastmod 文案、meta 结构、标签链接必须改两处 → 必然漂移。
- 分支表达的只是 class / 少量包装差异，不应用复制整棵树来实现。

**Code judo**

```astro
<header class:list={["intro-header", headerStyle === "text" && "style-text"]}>
  <!-- 单一 post heading body -->
</header>
```

mask / credit / global style 仍可保留；**删除重复 body 即可**。

**验收**

- [ ] post header 正文只存在一份
- [ ] `headerStyle: text` 与默认视觉回归通过
- [ ] lastmod / tags 路径只测一次即可覆盖两 style

---

### SRC-P1-4

**单一 mega client entry 在每一页 boot 全部 feature，靠 DOM 探测 no-op。**

**证据**

```ts
// src/client/entries/blog.ts
function boot(): void {
  navbar.init();
  archive.init();
  pageChrome.init();
  post.init();
  title.init(TITLE_JOKES);
  quote.init({ intervalMs: 10_000 });
  about.init();
  pdfEmbed.init();
  tagCloud.init(...);
  // Heti always
}
```

挂载点：`BaseLayout.astro` 对几乎所有主站页注入同一 entry。

**问题**

- 模型是：**共享 shell = 所有页面行为的并集**。
- 页面归属靠 `querySelector` 失败静默返回，不是所有权图。
- archive / about / pdf / post GeoPattern / catalog 共享生命周期，后续加 feature 只会继续往 `boot()` 堆。

**Code judo（择一）**

1. **Layout 作用域 entry**：`blog-shell` / `archive` / `post` / `about`（所有权最清晰）。
2. **声明式 registry**：`body` 或 `#main-content` 上 `data-features="quote,catalog"`，只 init 列表内。
3. 最低限度：shell entry 不再 import 重/页本地模块（about、archive、pdf、geopattern 路径）。

`if (!el) return` **不是** feature 架构。

**验收**

- [ ] 主站 entry 的依赖图与页面职责可读对齐
- [ ] 首页不加载仅 about/archive 需要的逻辑（或可证明 tree-shake / 分 entry）
- [ ] 新增 feature 有明确挂载点，而不是改全局 `boot()` 默认列表

---

### SRC-P1-5

**`page-chrome.ts` 把三个领域粘在同一文件。**

**证据**

`src/client/features/page-chrome.ts` 同时包含：

1. **Catalog** — heading id 策略、CJK 安全查找、hash 滚动（已 export 非平凡 API）
2. **Table wrapping** — 全站 `table` 包一层
3. **Navbar scroll chrome + gotop**

**问题**

- Catalog 变更被迫读 scroll/table 噪声，反之亦然。
- `document.querySelectorAll("table")` 作用域过宽，是共享路径上的 feature 泄漏风险。
- 已导出的 `findHeadingById` / `ensureHeadingId` 说明 catalog 已是独立域。

**Code judo**

- `features/catalog.ts` — headings + side catalog
- `features/page-chrome.ts` — scroll / navbar / gotop /（可选）tables，且 table 限制在 `.post-content`

**验收**

- [ ] catalog 与 chrome 分文件
- [ ] 文章目录 / 深链 hash / 顶栏滚动行为无回归
- [ ] 非 post 表格不被误包装（若站点存在）

---

## P2 — 边界、重复与膨胀

### SRC-P2-1

**Canonical helper 已存在，却在旁边被重写。**

| 概念 | 规范位置 | 旁路 |
|------|----------|------|
| Tag 计数 | `src/lib/posts.ts` → `collectTagCounts` | `archive/index.astro` 自建 `Map` |
| Absolute URL | 应有 `src/lib/url.ts` | `feed.xml.ts` `absoluteUrl` / `sitemap.xml.ts` `loc` / `Meta.astro` `absolute` |
| Friends 列表 | 应单一片段 | `Sidebar.astro` enable true/false 各写一遍 |

**Code judo**

- 新增 `src/lib/url.ts`（或等价）统一 `absoluteUrl`
- archive 改用 `collectTagCounts`
- Sidebar 抽 friends 为单一片段 / 子组件

**验收**

- [ ] 无第二套 tag 计数循环
- [ ] absolute URL 单实现
- [ ] friends 列表 DOM 生成一处

---

### SRC-P2-2

**配置 / 类型契约说谎或边界泄漏。**

**A. `excerptSeparator` 死配置**

- 定义: `src/data/site.ts`
- 实际: `src/lib/excerpts.ts` 写死 `"<!--more-->"`
- 额外: `getExcerptHtml` 对已 clean 的 excerpt 再次 `cleanExcerptSource`（双重 clean）

**B. `as PostEntry[]` cast 泛滥**

- `index` / `[page]` / `about` / `archive` / `feed` / `sitemap` / post paths 等反复 cast
- 若 content collection 类型正确，cast 是在掩盖边界；若类型不对，应在一处修 typing

**C. KaTeX 默认近似全站开启**

```ts
// Katex.astro
const enabled = site.katex && math !== false;
```

- schema: `math` optional → `undefined` 时仍加载 KaTeX CSS/JS
- 看起来像 opt-in，实际是 **除非显式 `math: false` 否则开启**

**D. `lastmodMap as Record<string, LastmodEntry>`**

- UI 边界靠 cast；应生成/导入 typed lastmod 模块

**Code judo**

- excerpt 读 `site.excerptSeparator`，只 clean 一次
- 修 collection 类型，去掉页面层 cast
- KaTeX 改为 `math === true`（或 schema default `false`），除非产品明确要求全站数学
- lastmod 类型从生成脚本产出

**验收**

- [ ] 改 `excerptSeparator` 能改变摘要切分
- [ ] 页面无 `as PostEntry[]`（或仅剩一处 justified 适配层）
- [ ] 无 `math` 的 post 不加载 KaTeX（若采用 opt-in）

---

### SRC-P2-3

**薄 class + `export function init(){ new X().init() }` 模式。**

**证据（示例）**

- `Navbar`、`TitleSwitcher`、`ArchiveFilter`、`CoreValueOverlay` 等
- 无第二实例、无 DI、无 teardown，class 仅打包 private 方法

**问题**

- 不是单独 blocker，但在整个 client 层叠加 boilerplate。
- 有长期资源/状态的模块可保留 class；多数一次 init 的行为用 **函数 + 闭包** 更直接。

**建议**

- 新代码默认函数式 init
- 存量在改动该文件时顺手压平，不单独为「去 class」开大 PR

---

### SRC-P2-4

**`tc-blog.scss` 1426 行，越过 1k 行健康边界。**

**证据**

- `src/styles/tc-blog.scss` — 主站样式单体
- 另有 `layout.scss` 450 行等，但主文件已超阈值

**问题**

- 视觉改动 diff 噪声大、冲突多、职责不清（nav / post / footer / utilities 混居）。

**Code judo**

- 按职责拆分后由 `tc-blog.scss` 保序 `@use`/`@import`（冻结视觉合同时保持层叠顺序）
- 建议切分: variables/mixins（已有）→ base / nav / post / sidebar / footer / utilities

**验收**

- [ ] 单文件不再显著超过 1k（或主入口仅 re-export）
- [ ] 视觉一致性门禁 / 抽样截图无回归

---

## INFO — 次要（不单独阻塞，记录在案）

### SRC-INFO-1 — About 页所有权分裂

- `about/index.astro` 内联 APlayer 脚本；`about.ts` 只负责 K-ON 语言块
- QR 空壳见 SRC-P1-2

### SRC-INFO-2 — tcupdate 元数据与 slug 锐边

- `meta name="BaseUrl" content="example.com"` 疑似垃圾元数据
- 下载卡与 history 的 repo 大小写不一致（`Auto-Torrent-Inspection` vs `auto-torrent-inspection`）依赖 GitHub 容忍

### SRC-INFO-3 — RSS description 塞全文 HTML

- `feed.xml.ts` 使用完整 rendered HTML；若为 Jekyll  parity 可保留
- 若未来要「摘要 feed」，需显式契约，避免 silent 半改

### SRC-INFO-4 — 颜色工具重复

- `tag-cloud.ts` 与 `geopattern/color.ts` 不同 `Rgb` 形状
- geopattern 离 client 后自然消失一侧

### SRC-INFO-5 — particle404 `scene.ts` 单体 init

- 491 行可接受；模块级可变 `explosionPoint`、GUI 部分 color hook 为空操作
- 非 1k 规则问题；改动 404 时再拆即可

### SRC-INFO-6 — `page-chrome` 包装全站 table

- 见 SRC-P1-5；独立记一条以免拆文件时漏收紧选择器

---

## 文件体量快照（审查时）

| 路径 | 约行数 | 备注 |
|------|-------:|------|
| `src/styles/tc-blog.scss` | 1426 | P2-4 |
| `src/client/lib/geopattern/**` | ~2100 | P1-1 |
| `src/client/features/particle404/scene.ts` | 491 | INFO-5 |
| `src/components/IntroHeader.astro` | 243 | P1-3 |
| `src/client/features/page-chrome.ts` | 215 | P1-5 |
| `src/client/lib/dom.ts` | 219 | 含未用 `shuffle` |

---

## 明确不作为 finding 的项

- Content 文章 Markdown 质量、文风（非本审查范围）。
- Sentry DSN 出现在前端（公开前端常见；非结构问题）。
- 42 篇文章规模下 `getPrevNext` 每次 sort 的性能（SSG 可忽略）。
- 仅「可以再多写点注释」类 nits。
