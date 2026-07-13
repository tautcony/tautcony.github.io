# 09 — 验收清单与风险

## 1. 功能验收清单

### 路由与 SEO

- [ ] 全部文章 URL 与迁移前一致（legacy 表 diff = 0）
- [ ] `/`、`/page2/`…`/pageN/` 存在且帖序正确
- [ ] `/about/`、`/archive/`、`/tcupdate.html`、`/404.html`
- [ ] `/feed.xml` 可订阅
- [ ] `/sitemap.xml` 可解析，且不存在未登记的 `sitemap-index.xml`/`sitemap-0.xml`
- [ ] `/robots.txt` 存在并包含 `Sitemap: https://tautcony.xyz/sitemap.xml`
- [ ] `CNAME` 在产物根目录
- [ ] canonical / OG 基本正确
- [ ] 42 篇 `sourceFilename`、legacy URL、front matter schema、lastmod 均 100% 命中
- [ ] 全站 route diff、静态资源 URL+size/hash diff、Markdown 引用 404 检查通过

### 样式与布局（冻结）

- [ ] 顶栏滚动 `is-fixed` / `is-visible` 行为
- [ ] 移动端汉堡菜单动画
- [ ] 文章头图、标签 pill、prev/next pager
- [ ] 代码块背景与语言标签
- [ ] 侧栏目录 active 与 fold
- [ ] 字体 Iosevka / 正文字重
- [ ] 404 同时加载 default layout 主站 CSS 与 `404.scss`
- [ ] `1440x900` / `390x844` 截图 diff 在冻结阈值内

### 脚本与交互

- [ ] 外链 `external` 标记
- [ ] `//` 绿色注释段
- [ ] 页脚 quote 轮换
- [ ] archive `?tag=` 筛选与按钮 focus
- [ ] KaTeX 公式（开/关 math）
- [ ] PDF embed 懒加载
- [ ] 404 粒子与 query flags
- [ ] tcupdate 仓库版本卡片
- [ ] utterances 评论加载
- [ ] `/about/` utterances 仍使用 pathname 绑定
- [ ] 回顶按钮

### 工程

- [ ] CI 无 Ruby
- [ ] `npm run ci` 本地通过
- [ ] Docker 镜像可 build（若仍维护）
- [ ] README 与 mig 状态更新

---

## 2. 风险登记

| ID | 风险 | 影响 | 缓解 |
|----|------|------|------|
| R1 | 文章 URL 日期 off-by-one | 死链、评论丢 | legacy URL 表；禁止纯文件名推算 |
| R2 | 高亮 DOM 不一致 | 代码块「换肤」 | S1 兼容层；专项截图 |
| R3 | 标题 id 算法不同 | 锚点/catalog 偏移 | rehype-slug；抽检长文 |
| R4 | `/page2/` vs `/page/2/` | 分页 404 | 专门路由测试 |
| R5 | `tcupdate.html` 后缀难输出 | Tool 链断裂 | 固定 `build.format: preserve` + 产物断言 |
| R6 | rename/Docker 无 Git 导致 lastmod 失真 | 更新日期错误 | frozen map、`--check`、Docker 不生成 lastmod |
| R7 | CSS 双份引入 | 体积翻倍/顺序错乱 | layout vs entry 只留一处 |
| R8 | 双栈源提前移动/分叉 | 旧站失效或数据不一致 | PR1–PR4 复制同步，PR5 原子删除 |
| R9 | Vue adapter/版本冲突 | tcupdate 白屏 | 固定 `@astrojs/vue@7.0.1` + Vue 3.5.24，先隔离页面验证 |
| R10 | Pages artifact 路径错误 | 整站挂 | preview + runbook |
| R11 | Content Layer API/Node 漂移 | clean build 失败 | 版本 exact + lockfile + engine matrix |
| R12 | URL/资源 compare 漏检 | 假绿、运行时 404 | required CI + 全量 manifest |

---

## 3. 回滚方案

| 层级 | 动作 |
|------|------|
| 构建失败未合并 | 修 `astro-migration` 分支即可，`master` 仍是 Jekyll |
| 已合并线上异常 | revert PR5 到 `master`，触发现有 master workflow；旧 Pages artifact 作为备用 |
| 仅部分 URL 错误 | 生成缺失旧路径的静态文件并重新部署；不使用 GitHub Pages 不支持的 `public/_redirects` |
| 数据 | 内容在 git；无 DB |

**不建议**：线上临时再起 Jekyll 与 Astro 双域名长期共存（成本高）。短期对比用 PR preview 即可。

---

## 4. 迁移完成定义（DoD）

1. 生产流量走 Astro `dist`
2. 仓库中无 Jekyll 运行时依赖
3. `mig/README.md` 顶部状态改为 **已完成** + 完成日期
4. `docs/modernization-plan.md` Phase 路径 B 勾选或链到本文
5. 本文件验收清单全部勾选
6. route/resource/content/visual/HTTP smoke 证据已作为 CI artifact 保存
7. 至少一次 tag/artifact 回滚演练完成并记录结果

---

## 5. 后续可选优化（迁移后独立 PR）

- Iosevka 子集 / 字体策略
- tcupdate 去 Vue
- Shiki 现代高亮 + 有意识更新 syntax 样式
- 图片 WebP/AVIF
- Sentry DSN 构建注入
- 删除 SW unregister
