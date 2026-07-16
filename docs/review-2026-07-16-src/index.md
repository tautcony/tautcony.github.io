# Review Index — `src/` 代码质量审查

> 日期: 2026-07-16  
> 范围: `src/`（Astro layouts/pages、build-time `lib/`、client runtime、styles）  
> 类型: 严格可维护性 / 抽象质量 / code-judo 审查（非纯行为正确性）  
> 结论: 审查项已在 `feat/astro-polish` 落地；见 checklist 进度。

## 从这里开始

1. 了解结论：读 [`summary.md`](./summary.md)。
2. 读完整 finding：[`findings.md`](./findings.md)。
3. 按项修复：[`fix-checklist.md`](./fix-checklist.md)。
4. 批次顺序：[`fixes-plan.md`](./fixes-plan.md)。

## 当前状态

| 级别 | 数量 | 含义 |
|------|-----:|------|
| P1（结构性 / 阻塞可维护性） | 5 | 已全部完成 |
| P2（明确债 / 边界问题） | 4 | 已全部完成 |
| INFO（次要） | 若干 | 部分完成（见 checklist） |

- 已完成: 9（P1+P2 主项） / 未开始: 0

## 优先处理

| Finding | 级别 | 状态 | 问题 | 证据 |
|---------|------|------|------|------|
| SRC-P1-1 | P1 | [x] | Geopattern ~2.1k LOC 仅服务一个 client 调用点 | [findings](./findings.md#src-p1-1) |
| SRC-P1-2 | P1 | [x] | 死代码 / 僵尸 DOM / 无效配置仍一等公民 | [findings](./findings.md#src-p1-2) |
| SRC-P1-3 | P1 | [x] | `IntroHeader` post 分支大段复制 | [findings](./findings.md#src-p1-3) |
| SRC-P1-4 | P1 | [x] | 单一 mega client entry 探测所有页面 feature | [findings](./findings.md#src-p1-4) |
| SRC-P1-5 | P1 | [x] | `page-chrome` 混杂 catalog / table / scroll 三域 | [findings](./findings.md#src-p1-5) |
| SRC-P2-1 | P2 | [x] | 已有 canonical helper 仍被旁路重写 | [findings](./findings.md#src-p2-1) |
| SRC-P2-2 | P2 | [x] | 配置 / 类型契约说谎或泄漏 | [findings](./findings.md#src-p2-2) |
| SRC-P2-3 | P2 | [x] | 薄 class + `init()` 包装层 | [findings](./findings.md#src-p2-3) |
| SRC-P2-4 | P2 | [x] | `tc-blog.scss` 超 1k 行未拆分 | [findings](./findings.md#src-p2-4) |

## 文档地图

| 文档 | 用途 |
|------|------|
| [`summary.md`](./summary.md) | 结论、统计、审批门槛、推荐序列 |
| [`findings.md`](./findings.md) | 完整 finding、证据路径、code-judo 建议 |
| [`fix-checklist.md`](./fix-checklist.md) | 可勾选修复进度主记录 |
| [`fixes-plan.md`](./fixes-plan.md) | 修复批次、依赖顺序、验证方式 |

## 限制

- 本轮为静态代码结构审查 + 已按计划落地的结构性修复。
- 与 `docs/review-2026-07-13/`（迁移方案审查）正交；本目录只覆盖 cutover 后的 `src/` 实现健康度。
