# 修复计划

## 批次 A: 先收敛不可变协议

- 目标问题: `P0-P1-1`、`P0-P1-2`、`P0-P1-4`、`P0-P1-6`、`P0-P1-7`、`P0-P1-10`
- 内容: 锁定 Astro/Node/API；确定 `preserve/file` 与所有 URL；定义 sourcePath/legacyMap 合同；写 front matter 迁移器与全量 schema；补齐 site/page 配置。
- 验证: clean checkout 下 `npm ci`、`astro check`、42 篇 parse；生成 42 个唯一 URL，精确存在 `tcupdate.html`、`sitemap.xml`、`robots.txt`。

## 批次 B: 保持双栈并建立可证明的对比

- 目标问题: `P0-P1-3`、`P0-P1-5`、`P0-P1-8`、`P1-P2-1..4`、`P2-P2-1..4`
- 内容: 复制/同步而非提前删除旧源；实现 route/resource/content compare；修复 lastmod 和 Docker provenance；转换 Liquid/raw HTML；固定排序、时区、RSS、标题和 CSS URL；把 `astro check` 纳入 CI。
- 验证: Jekyll/Astro 双构建；HTML/XML/静态资源 URL+hash diff；42 篇渲染快照；关键页面 Playwright；Docker 与 Pages lastmod 一致。

## 批次 C: 切流与可演练回滚

- 目标问题: `P0-P1-9`
- 内容: 增加受保护的 manual/tag deploy 或保存旧 artifact；更新 runbook、权限、验证清单；切流前演练一次回滚。
- 验证: 在非生产 Pages 环境部署旧 artifact，确认 `/`、文章、`tcupdate.html`、`feed.xml`、sitemap、robots、资源和评论路径。

## 批次 D: 文档收口

- 更新 `mig/README.md` 状态、`docs/modernization-plan.md` 的 A/B 决策、README/`.gitmodules`/submodule 脚本遗留说明。
- 删除“最新 major”“必要时”“可选但验收必需”等不可执行措辞，所有命令和产物路径固定到 lockfile/CI。
