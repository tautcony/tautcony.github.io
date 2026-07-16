# 代码审查汇总 — `src/`

> 日期: 2026-07-16  
> 范围: `src/` 全树  
> 审查标准: 严格 code quality（结构简化 / spaghetti 增长 / 边界契约 / 文件膨胀 / 死层删除）

## 结论

实现从 Jekyll 迁到 Astro 后，**分层意识总体正确**（`client/` vs build-time `lib/` 有文档且大体遵守），但若干子系统的 **所有权边界与复杂度成本** 仍不对齐真实产品需求。

**可维护性审批（审查时）：不通过。**  
**落地状态（同日修复后）：P1/P2 主项已完成** — 见 [`fix-checklist.md`](./fix-checklist.md)。

- 行为大概率正确（读者侧可用）。
- 审查指出的 code-judo 路径已按批次实施（GeoPattern SSG、entry 分 chunk、scss 拆分等）。
- 仍可选：RSS 摘要契约文档化、particle404 再拆（INFO）。

## 统计

| 级别 | 数量 |
|------|-----:|
| P1 | 5 |
| P2 | 4 |
| INFO | 见 findings 次要节 |

| 状态 | 数量 |
|------|-----:|
| 已完成 | 9（P1+P2） |
| 未开始 | 0（主 finding） |

## 高优先级问题（P1）

1. **[SRC-P1-1](./findings.md#src-p1-1)** Geopattern ~2100 行 client 库，仅 `post.ts` 一处 header fallback。
2. **[SRC-P1-2](./findings.md#src-p1-2)** 未接线 feature、死 DOM（`#webgl`）、死 helper、配置键无消费者。
3. **[SRC-P1-3](./findings.md#src-p1-3)** `IntroHeader` post 双分支近乎全文复制。
4. **[SRC-P1-4](./findings.md#src-p1-4)** `blog.ts` 全局 boot 所有 feature，靠 DOM 缺失 no-op。
5. **[SRC-P1-5](./findings.md#src-p1-5)** `page-chrome.ts` 把 catalog / table / scroll chrome 绑在同一模块。

## 次高优先级（P2）

1. **[SRC-P2-1](./findings.md#src-p2-1)** tag 统计、absolute URL、Sidebar friends 重复实现。
2. **[SRC-P2-2](./findings.md#src-p2-2)** `excerptSeparator` 死配置、`as PostEntry[]` cast 泛滥、KaTeX 默认近似全站开启。
3. **[SRC-P2-3](./findings.md#src-p2-3)** 多处 `class + export function init(){ new X().init() }` 薄包装。
4. **[SRC-P2-4](./findings.md#src-p2-4)** `tc-blog.scss` 1426 行，越过 1k 行健康边界。

## 已观察到的优点（避免全盘否定）

- `client/` 与 build-time `lib/` 边界有 README，且大体遵守。
- `posts.ts` / `pagination.ts` 小而直接，路由/排序归属正确。
- Content schema + `postUrl` / `parsePostUrl` 是 URL 的正确规范层。
- `pdf-embed`、archive filter 等单页域逻辑可读。
- particle404 抽出自研 tween，相对引入 TweenJS 是合理裁剪。

问题本质不是「迁移失败」，而是 **完整子系统的所有权与复杂度，已不再匹配其真实用途**。

## 推荐 code-judo 序列（保行为）

1. SSG 生成 header pattern / 从 blog client 删除 geopattern。
2. 折叠 `IntroHeader` post 分支。
3. 删除或真正接线死模块与死 DOM。
4. URL / tags 等 helper 归一。
5. 拆 `page-chrome`、按页收束 blog entry。
6. 修正 KaTeX / `excerptSeparator` 契约。
7. 下次动样式时拆 `tc-blog.scss`。

详见 [`fixes-plan.md`](./fixes-plan.md)。

## 审批门槛对照

| 门槛 | 结果 |
|------|------|
| 无明确结构回退 / 偶然复杂度 | **Fail** — geopattern 在 client、mega-entry、死表面 |
| 无可见的大幅度简化机会被错过 | **Fail** — header pattern + IntroHeader |
| 无不合理 1k+ 膨胀 | **Warn** — `tc-blog.scss` 已超 1k |
| 无 spaghetti / 特判式增长 | **Warn** — DOM 探测 feature bus |
| 无死包装 / 配置说谎 | **Fail** — excerptSeparator、未接线 feature、cast |
| 复用 canonical helper | **Fail** — tag counts、absolute URL |

## 与其他 docs 的关系

| 文档 | 关系 |
|------|------|
| `docs/review-2026-07-13/` | 迁移方案审查（mig）；本审查覆盖 cutover 后实现 |
| `docs/modernization-plan.md` | 方向性计划；本审查给出现状可维护性缺口清单 |
| `mig/archive/` | 历史迁移设计归档；不替代本审查 |

## 限制

- 未以本审查名义声称视觉/一致性门禁已重跑通过。
- 未要求立即改产品行为；优先 **同行为、更简单结构**。
