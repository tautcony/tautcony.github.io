# Review Findings Fix Checklist

> 来源: `docs/review-2026-07-13/`  
> 最后更新: 2026-07-13

状态约定: `[ ]` 未开始；`[~]` 部分完成；`[x]` 已完成且有证据；`N/A` 不适用。

## P0-P1-1 — [P1] Astro 版本/API/Node 基线不兼容
- 来源: [phase-0](./phases/phase-0-baseline.md#p0-p1-1)
- 负责人/批次: 未分配 / A；总体状态: [ ]
- Checklist: [ ] 锁定版本与 Node engine；[ ] 更新 Content Layer/schema；[ ] 纳入 `.markdown`；[ ] clean checkout `npm ci`/`astro check`/build；[ ] 记录 lockfile 与 CI 证据。

## P0-P1-2 — [P1] URL 输出形状未闭环
- 来源: [phase-0](./phases/phase-0-baseline.md#p0-p1-2)
- 负责人/批次: 未分配 / A；总体状态: [ ]
- Checklist: [ ] 固定 format/文件布局；[ ] 生成并断言文章、page2-pageN、tcupdate.html、404、feed、sitemap、robots；[ ] 检查错误替代路径；[ ] 更新 route fixture/CI。

## P0-P1-3 — [P1] 双栈搬迁破坏 Jekyll
- 来源: [phase-0](./phases/phase-0-baseline.md#p0-p1-3)
- 负责人/批次: 未分配 / B；总体状态: [ ]
- Checklist: [ ] 选择复制/同步或延迟删除策略；[ ] 双栈构建文章数/资源数检查；[ ] 旧 Jekyll `npm run ci` 通过；[ ] 切流 PR 原子删除旧源并验证回滚。

## P0-P1-4 — [P1] legacy URL key/id 未固定
- 来源: [phase-0](./phases/phase-0-baseline.md#p0-p1-4)
- 负责人/批次: 未分配 / A；总体状态: [ ]
- Checklist: [ ] 定义 sourceFilename/legacyPath；[ ] 生成 42/42 映射；[ ] 断言无重复、无 fallback；[ ] 验证异常日期/大小写 slug/utterances pathname。

## P0-P1-5 — [P1] lastmod/Docker 结果不可靠
- 来源: [phase-0](./phases/phase-0-baseline.md#p0-p1-5)
- 负责人/批次: 未分配 / B；总体状态: [ ]
- Checklist: [ ] 设计 rename-aware lastmod fixture；[ ] 过滤迁移提交或冻结 legacy map；[ ] 明确 Docker provenance；[ ] Pages/Docker/本地输出一致性测试；[ ] 记录错误路径和空 map 行为。

## P0-P1-6 — [P1] front matter schema 失败
- 来源: [phase-0](./phases/phase-0-baseline.md#p0-p1-6)
- 负责人/批次: 未分配 / A；总体状态: [ ]
- Checklist: [ ] 扫描所有 null/空数组/旧键；[ ] 实现迁移与清洗；[ ] 42 篇 parse 回归；[ ] 字段 before/after 快照；[ ] 构建失败时禁止发布。

## P0-P1-7 — [P1] site/page 配置映射遗漏
- 来源: [phase-0](./phases/phase-0-baseline.md#p0-p1-7)
- 负责人/批次: 未分配 / A；总体状态: [ ]
- Checklist: [ ] 逐键映射 `_config.yml`；[ ] 建立 page front matter 数据源；[ ] 保留 about 评论和 404 主站 CSS 依赖；[ ] 验证 sidebar/friends/featured/GA/meta/excerpt；[ ] 六类页面 HTML/meta/视觉快照。

## P0-P1-8 — [P1] 对比门禁不存在且静态资源漏检
- 来源: [phase-0](./phases/phase-0-baseline.md#p0-p1-8)
- 负责人/批次: 未分配 / B；总体状态: [ ]
- Checklist: [ ] 按阶段拆分 M1 文章路由与 M3/M4 全站路由门禁；[ ] 实现 compare 脚本；[ ] 规范化 URL；[ ] 生成全量资源 hash 清单；[ ] 检查 Markdown 资源引用；[ ] 将 compare 设为 required CI check。

## P0-P1-9 — [P1] rollback 无可执行入口
- 来源: [phase-0](./phases/phase-0-baseline.md#p0-p1-9)
- 负责人/批次: 未分配 / C；总体状态: [ ]
- Checklist: [ ] 增加 manual/tag deploy 或保存旧 artifact；[ ] 明确权限/产物；[ ] 非生产环境演练；[ ] 记录恢复时间和全量 smoke 结果。

## P0-P1-10 — [P1] browser-only entry 挂载边界未固定
- 来源: [phase-0](./phases/phase-0-baseline.md#p0-p1-10)
- 负责人/批次: 未分配 / A；总体状态: [ ]
- Checklist: [ ] 统一 client script 挂载方式；[ ] 禁止 SSG frontmatter 执行浏览器代码；[ ] build/preview 验证主站、404、tcupdate 各只执行一次；[ ] 记录 browser smoke 证据。

## P1-P2-1 — [P2] 标题 HTML 策略缺失
- 来源: [phase-1](./phases/phase-1-content-rendering.md#p1-p2-1)
- 负责人/批次: 未分配 / B；总体状态: [ ]
- Checklist: [ ] 选择白名单/结构化字段；[ ] 覆盖含 `<em>` 文章；[ ] HTML/meta/snapshot 回归；[ ] 记录安全边界。

## P1-P2-2 — [P2] Liquid/raw HTML 无强制门禁
- 来源: [phase-1](./phases/phase-1-content-rendering.md#p1-p2-2)
- 负责人/批次: 未分配 / B；总体状态: [ ]
- Checklist: [ ] 扫描并转换所有 Liquid；[ ] 构建拒绝残留模板语法；[ ] raw HTML 白名单；[ ] PDF/iframe/script/公式负向测试。

## P1-P2-3 — [P2] 同日排序未定义
- 来源: [phase-1](./phases/phase-1-content-rendering.md#p1-p2-3)
- 负责人/批次: 未分配 / B；总体状态: [ ]
- Checklist: [ ] 定义 tie-break；[ ] 固化 page/archive/prev-next 序列；[ ] 对全部页面做 fixture diff。

## P1-P2-4 — [P2] 日期时区未定义
- 来源: [phase-1](./phases/phase-1-content-rendering.md#p1-p2-4)
- 负责人/批次: 未分配 / B；总体状态: [ ]
- Checklist: [ ] 固定 date-only/offset 规则；[ ] 固定 CI TZ；[ ] 边界日期测试；[ ] 新文 URL/排序回归。

## P2-P2-1 — [P2] 样式相对图片 URL 失效
- 来源: [phase-2](./phases/phase-2-build-and-crosscutting.md#p2-p2-1)
- 负责人/批次: 未分配 / B；总体状态: [ ]
- Checklist: [ ] 选择留根目录或 public URL；[ ] CSS URL 检查；[ ] 404/search screenshot。

## P2-P2-2 — [P2] astro check/lint 范围未纳入 CI
- 来源: [phase-2](./phases/phase-2-build-and-crosscutting.md#p2-p2-2)
- 负责人/批次: 未分配 / B；总体状态: [ ]
- Checklist: [ ] 安装并锁定 `astro check` 依赖；[ ] 更新最终脚本路径和 lint glob；[ ] 本地/CI 同命令；[ ] 故意引入 `.astro` 类型错误验证 fail。

## P2-P2-3 — [P2] 安装/遗留元数据不可复制
- 来源: [phase-2](./phases/phase-2-build-and-crosscutting.md#p2-p2-3)
- 负责人/批次: 未分配 / D；总体状态: [ ]
- Checklist: [ ] 修正安装命令；[ ] 清理 `.gitmodules`/无效 submodule script；[ ] clean checkout 验证；[ ] 更新 README。

## P2-P2-4 — [P2] 视觉验收没有截图门禁
- 来源: [phase-2](./phases/phase-2-build-and-crosscutting.md#p2-p2-4)
- 负责人/批次: 未分配 / B；总体状态: [ ]
- Checklist: [ ] 固定页面/viewport 基线；[ ] 定义像素差异阈值；[ ] CI 生成并保留 diff；[ ] 在切流 PR required check。
