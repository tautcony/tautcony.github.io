# fixtures

迁移实施时生成的对照数据放这里（建议入库，便于 PR  diff）。

| 文件 | 说明 | 何时生成 |
|------|------|----------|
| `legacy-post-urls.json` | 文章 id/文件名 → 最终 URL | M1 开始前（Jekyll 仍可 build） |
| `legacy-post-urls.txt` | 42 条文章 URL（M1 posts scope） | M1 |
| `routes-jekyll.txt` | `_site` 全部 HTML/XML 路径列表 | M3 |
| `routes-astro.txt` | `dist` HTML/XML 路径列表 | 每次 compare |
| `assets-jekyll.json` | 静态资源 URL、字节数、sha256 | M3 |
| `assets-astro.json` | `dist` 静态资源 URL、字节数、sha256 | 每次 compare |
| `content-fixtures.json` | 42 篇 front matter、摘要、排序、标题 HTML 快照 | M1 |
| `excerpts.json` | 42 篇 raw-body 摘要（`<!--more-->` 前、strip HTML、truncate 256） | M1（`migrate-posts --write`） |
| `visual/` | 六类页面桌面/移动 baseline/current/diff | M0/M3 |

## 生成示例

### routes-jekyll.txt

```bash
# 在仓库根，完成一次干净 Jekyll build 后
find _site -type f \( -name '*.html' -o -name '*.xml' \) \
  | sed 's|^_site||' | sort > mig/fixtures/routes-jekyll.txt
```

M1 只用 `legacy-post-urls.txt` 比较文章路由；M3/M4 才比较全站 `routes-*.txt`。比较器必须把 `/foo/index.html` 规范化为 `/foo/`，新增/弃用路径必须进入显式 allowlist。

### legacy-post-urls.json

由 `scripts/migrate-posts.mjs` 从 Jekyll `site.posts` 导出；key 必须是精确文件名（含扩展名和大小写），不能依赖 Astro 默认 id。

格式建议：

```json
{
  "2016-03-22-hello-github-io.markdown": "/2016/03/22/hello-github-io/",
  "2017-04-23-14th-ZJ-Programming-Contest.markdown": "/2017/04/24/14th-ZJ-Programming-Contest/"
}
```

注意第二条：**文件名日期与 URL 日期不一致** 的条目必须靠本表，不能靠算法猜。

资源 manifest 使用稳定排序和 sha256；所有 fixture 记录 source commit、工具版本和生成命令。它们是长期兼容基线，不得在 M5 删除。
