# Review Index

> 日期: 2026-07-13  
> 范围: `mig/` 迁移方案及必要上下游  
> 结论: 方案覆盖面较好，但存在 10 个 P1 执行/验收/回滚缺口，当前不宜直接进入 M0。

## 从这里开始

1. 了解结论：读 [`summary.md`](./summary.md)。
2. 开始修复：按 [`fix-checklist.md`](./fix-checklist.md) 逐项处理，再参考 [`fixes-plan.md`](./fixes-plan.md) 的批次顺序。
3. 追查证据：进入 [`phases/`](./phases/) 的 baseline、内容、构建报告。
4. 核验审查过程：读 [`agent-findings.md`](./agent-findings.md)。

## 当前状态

- P0: 0 / P1: 10 / P2: 8 / INFO: 0
- 已完成: 0 / 部分完成: 0 / 未开始: 18 / N/A: 0

## 优先处理

| Finding | 级别 | 状态 | 问题 | 证据 |
|---|---|---|---|---|
| P0-P1-1 | P1 | [ ] | 版本/API/Node 基线 | [Phase 0](./phases/phase-0-baseline.md#p0-p1-1) |
| P0-P1-2 | P1 | [ ] | URL 输出形状 | [Phase 0](./phases/phase-0-baseline.md#p0-p1-2) |
| P0-P1-3 | P1 | [ ] | 双栈搬迁顺序 | [Phase 0](./phases/phase-0-baseline.md#p0-p1-3) |
| P0-P1-4 | P1 | [ ] | URL key/id 协议 | [Phase 0](./phases/phase-0-baseline.md#p0-p1-4) |
| P0-P1-5 | P1 | [ ] | lastmod/Docker | [Phase 0](./phases/phase-0-baseline.md#p0-p1-5) |
| P0-P1-6 | P1 | [ ] | front matter schema | [Phase 0](./phases/phase-0-baseline.md#p0-p1-6) |
| P0-P1-7 | P1 | [ ] | 配置/page 数据 | [Phase 0](./phases/phase-0-baseline.md#p0-p1-7) |
| P0-P1-8 | P1 | [ ] | 对比门禁/资源 | [Phase 0](./phases/phase-0-baseline.md#p0-p1-8) |
| P0-P1-9 | P1 | [ ] | 回滚 runbook | [Phase 0](./phases/phase-0-baseline.md#p0-p1-9) |
| P0-P1-10 | P1 | [ ] | client entry 挂载边界 | [Phase 0](./phases/phase-0-baseline.md#p0-p1-10) |

## 文档地图

| 文档 | 用途 |
|---|---|
| [`summary.md`](./summary.md) | 结论、统计和跨模块复盘 |
| [`fix-checklist.md`](./fix-checklist.md) | 每个 finding 的修复进度主记录 |
| [`fixes-plan.md`](./fixes-plan.md) | 修复批次、顺序和验证方式 |
| [`phases/`](./phases/) | 文件证据、触发条件、漏检复盘 |
| [`agent-findings.md`](./agent-findings.md) | 候选发现、采纳/降级和双人核验 |

## 限制

尚未运行目标 Astro 实现、Docker、Actions 或浏览器视觉验证；当前结论是对方案可执行性和现有仓库上下文的审查，不代表迁移后的行为已通过。
