> **历史档案**（`mig/archive/`）。现行说明见 [`../README.md`](../README.md)、[`../contracts.md`](../contracts.md)。

# 04 — 样式冻结策略

> **Historical note (2026-07-16)**：高亮 DOM 已改为 Astro Prism 原生 `pre.language-*` / `.token`（见 `src/styles/syntax.scss`）。下文中 `highlighter-rouge` 兼容要求 **已 superseded**，仅作迁移期记录。  
> **W6**：样式目录已迁至 **`src/styles/`**；class 名与 `/img/...` URL 契约不变。

## 1. 原则

> **迁移期把 CSS 当 API：只改「谁引用、从哪打包」，不改「选择器语义与视觉 token」。**

允许：

- 双栈结束后的文件物理搬家（`styles/` → `src/styles/`）与 import 路径修正
- Sass 构建方式从「Vite 多入口」变为「Astro/Vite 页面 import」
- 为高亮 DOM 差异 **仅** 调整 `syntax.scss` 或加一层兼容选择器

禁止（迁移主路径）：

- 重写 layout 栅格、改 brand 色、改字体栈
- 把 BS 遗留 class 改成 Tailwind / 自创 BEM
- 「优化」间距、断点、导航动画

**首迁决策**：PR1–PR5 保留根 `styles/`。样式资源 URL 已统一为 `/img/...`；移动到 `src/styles/` 前仍需通过资源与视觉门禁。

## 2. 接入方式（推荐）

### 主站

在 `BaseLayout.astro`（或仅主站用的 layout）：

```astro
---
import "../styles/tc-blog.scss";
import "heti/lib/heti.scss";
---
```

字体 CSS 继续走 `public/css/*` + `<link>`（与现 `head.html` 一致，含 print/onload 技巧可保留）。

### 404 / tcupdate

```astro
---
import "../styles/404.scss";
// 或 tcupdate.scss
---
```

404 当前继承 default layout，必须加载 **主站 `tc-blog.scss` + `404.scss`**；tcupdate 仍只加载独立样式。不要在其它全局 layout 无条件 import 三套 scss。

## 3. 与 JS 的边界

现 entry 内有：

```ts
import "../../styles/tc-blog.scss";
```

迁移后二选一（推荐 A）：

| 方案 | 做法 | 优点 |
|------|------|------|
| **A. 样式归 layout** | 从 entry 删除 scss import | CSS 与 HTML 同生命周期，清晰 |
| B. 样式归 entry | layout 不 import scss | 更接近现状，但 Astro 页面易漏引 |

选定后全站统一。

## 4. 高亮与 Markdown 输出（唯一高危视觉点）

现依赖（示例）：

- 容器：`div.highlighter-rouge.language-xxx`
- 内部：`.highlight > pre > code`
- 语言角标：`.post-content div.highlighter-rouge::before`

若 Astro 默认输出 Shiki 的 `pre.astro-code` 等，**外观会变**。

**冻结策略（按优先级）**：

1. 配置 rehype/高亮插件，使输出 class **兼容** `highlighter-rouge` + `language-*` + `.highlight`
2. 或增加一层 wrapper 组件，把 rendered HTML 包进现有结构
3. 实在不行：扩展 `syntax.scss` 同时匹配新旧选择器（仍算「样式文件有改动」，但视觉目标不变）

**验收**：挑含 bash/js/cpp/yaml 的文章截图对比。

## 5. 第三方 CSS

| 资源 | 策略 |
|------|------|
| Pace theme | 继续 CDN link（Head.astro） |
| KaTeX css | Katex.astro 原样 |
| APlayer css | about 页原样 |
| heti scss | npm 依赖 import |

## 6. 视觉验收页清单

| # | 页面 | 关注点 |
|---|------|--------|
| 1 | `/` | 顶栏、列表字号、分页 pager、footer quote 区 |
| 2 | 任意长文 + catalog | 侧栏目录、标题层级、代码块、外链 ↗ |
| 3 | `/archive/` | tag 云、筛选列表 |
| 4 | `/about/` | header 图、多语言块、APlayer |
| 5 | `/404.html` | 全屏、粒子、fallback 字 |
| 6 | `/tcupdate.html` | 独立字体与下载按钮布局 |
| 7 | 含 PDF embed 文 | 占位按钮、原生 PDF viewer、打开/下载 fallback |
| 8 | 含公式文 | KaTeX 字号与行距 |

工具：Playwright 截图 diff（**切流前必须**）。基线至少固定 `1440x900`、`390x844` 两个 viewport；CI 保存 baseline/current/diff，像素阈值在首次基线 PR 中冻结。人工并排仅作为补充。

## 7. 回归时的「允许误差」

| 可接受 | 不可接受 |
|--------|----------|
| CSS 文件 hash / 加载顺序导致的 1 帧 FOUC | 导航折叠动画丢失、栅格错位 |
| 子像素圆角/字体 hinting 平台差 | 代码块背景/语言标签消失 |
| sourcemap 有无 | 主色、正文 measure 明显变化 |
