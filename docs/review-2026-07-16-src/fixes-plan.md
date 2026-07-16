# Fixes Plan — `src/` 审查

> 目标: 在 **不改变对外产品行为**（或仅在明确产品决策下改变）的前提下，按杠杆顺序删除复杂度。  
> 进度勾选以 [`fix-checklist.md`](./fix-checklist.md) 为准。

## 原则

1. **先删层，再收拾枝节** — 能去掉子系统就不要先做命名级清理。
2. **每批可独立合并** — 每批有清晰 diff 边界与回归范围。
3. **行为默认冻结** — 视觉 / URL / 摘要切分 / catalog 深链与现网一致，除非 checklist 写明产品变更（如 KaTeX opt-in）。
4. **不把死代码「暂时留着」** — 接线或删除，禁止半残。

## 批次

### Batch A — 最大删除杠杆（P1-1, P1-3）

**意图:** 立刻减少 client 体积与组件漂移面。

| 项 | Finding |
|----|---------|
| Geopattern → SSG / 离 client | SRC-P1-1 |
| IntroHeader post 去重 | SRC-P1-3 |

**建议顺序:** 先 IntroHeader（小、纯模板），再 geopattern 迁移（触达 build + client）。

**验证**

- `npm run ci`（或至少 `check:astro` + `build`）
- 抽样：有 `headerImg` post、无 `headerImg` post、`headerStyle: text` post
- 若有 visual 基线：对比 header 区域

**风险**

- GeoPattern 与 URL/hash 输入必须与旧 client 一致，否则背景图案变化（通常可接受若文档声明；严格 parity 需固定 seed = `location.href` 同规则）

---

### Batch B — 死表面清扫（P1-2）

**意图:** 降低「假活代码」信噪比；可与 A 并行（不同文件时）。

| 项 | Finding |
|----|---------|
| 未接线 feature / 死 DOM / 死 helper / 死配置 | SRC-P1-2 |
| excerptSeparator 接入或删除 | 含于 P1-2 / 与 P2-2 重叠部分可本批做完 excerpt |

**验证**

- 全站 smoke：home / about / archive / post / 404 / tcupdate
- grep 确认无残留 import

**风险**

- 删除 `#webgl` 前确认无隐藏样式依赖（当前无 client 绑定，风险低）
- brightness 若曾有用户本地习惯，删除属产品决策（现未接线则无运行时影响）

---

### Batch C — 运行时所有权（P1-4, P1-5）

**意图:** 让 feature 归属可读，避免继续往 `blog.ts` 堆 init。

| 项 | Finding |
|----|---------|
| entry 分页 / registry | SRC-P1-4 |
| catalog 与 page-chrome 拆分 | SRC-P1-5 |

**建议顺序:** 先拆 `page-chrome`（文件移动为主），再改 entry 挂载（行为编排）。

**验证**

- archive 标签筛选 + `?tag=`
- post catalog 点击与 hash 刷新
- 顶栏 fixed / gotop
- about 语言块
- PDF embed 页（若有）

**风险**

- 分 entry 时注意共享 chunk 与重复 Sentry/Heti init；registry 方案可减少重复

---

### Batch D — 契约与 DRY（P2-1, P2-2）

**意图:** 单源配置与 helper，去掉 cast/默认值谎言。

| 项 | Finding |
|----|---------|
| URL / tags / friends 归一 | SRC-P2-1 |
| excerpt / PostEntry / KaTeX / lastmod | SRC-P2-2 |

**产品决策点**

- **KaTeX:** 若改为 `math === true`，无 front matter 的旧文将不再加载 KaTeX — 需扫一遍含公式文章是否都标了 `math: true`。
- 若必须全站 KaTeX：在 `site.ts` / 文档写明「默认全站」，去掉「看似 optional」的误导。

**验证**

- `quotes` / `lastmod` / `math:check` 等现有脚本
- feed / sitemap URL 形状与基线对比（若有 fixture）
- 摘要：`<!--more-->` 前后与超长无 separator 截断

---

### Batch E — 样式与惯例（P2-3, P2-4）

**意图:** 降低后续 CSS 冲突；固化 client 写法惯例。

| 项 | Finding |
|----|---------|
| 薄 class 随改随清 | SRC-P2-3 |
| 拆 `tc-blog.scss` | SRC-P2-4 |

**建议:** 样式拆分单独 PR，避免与行为重构同 PR 难以 review。

**验证**

- visual 门禁或关键页面截图抽样
- 无行为变更预期

---

### Batch F — INFO 清扫（可选）

- About 所有权、tcupdate meta、RSS 契约文档、particle404 再拆
- 无阻塞；插入空窗期即可

## 依赖图（简化）

```text
Batch A (IntroHeader, Geopattern)
    │
    ├─► Batch B (dead surface)     [可并行 A]
    │
    └─► Batch C (entry + chrome)   [geopattern 离 client 后 post.ts 更瘦，C 更干净]
              │
              └─► Batch D (DRY + contracts)
                        │
                        └─► Batch E (scss + style conventions)
                                  │
                                  └─► Batch F (INFO)
```

## 建议 PR 切片

| PR | 内容 | 规模预期 |
|----|------|----------|
| PR1 | IntroHeader 去重 | S |
| PR2 | 死代码/DOM/配置清理 | S–M |
| PR3 | Geopattern SSG + 删 client 库 | M–L |
| PR4 | catalog 拆分 + table 选择器 | S–M |
| PR5 | entry 收束 | M |
| PR6 | url/tags/friends + excerpt/types/KaTeX | M |
| PR7 | scss 拆分 | M（diff 大但逻辑少） |

## 每批完成定义（DoD）

- [ ] `fix-checklist` 对应项勾选并写备注
- [ ] CI 脚本集通过（与仓库 `npm run ci` 对齐）
- [ ] 无新增「暂时」「以后再接」的半残模块进入 `src/client/features`
- [ ] README / 本目录 summary 统计在里程碑结束时更新

## 明确不在本计划内

- 新功能（搜索、暗色主题等）
- 内容写作与 draft 发布
- 重做 particle404 视觉
- 迁移方案文档（`review-2026-07-13`）的历史 P1 — 除非与本次实现债直接重叠
