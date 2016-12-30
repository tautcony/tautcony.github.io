---
layout:     post
title:      "在TypeScript中使用jQuery所需的准备"
subtitle:   ""
date:       2016-12-29
author:     "TautCony"
header-img: "img/post-bg-default.png"
image:
  credit: himawari-8
  creditlink: http://himawari8.nict.go.jp/
tags:
    - 
---

周知`TypeScript`为`JavaScript`的超集，在我看来，最为明显的区别就是增加了强类型。那么，对于使用`JavaScript`实现的各种库，就有点麻烦了。

需要增加一个定义文件`*.d.ts`才能正常使用，本文讲以jQuery为例讲述获取该文件整个流程。

<!--more-->

太长不看的话: `typings install dt~jquery --save --global`, 下一个。

-----

其实在早先，这个声明文件是通过[`tsd`](https://github.com/DefinitelyTyped/tsd)来管理的，但是这个工具已经被[抛弃](https://github.com/DefinitelyTyped/tsd/issues/269)了

现在推荐使用的是[`typings`](https://github.com/typings/typings)，其实这个链接点进去就够了的（

如果尚未安装，可通过`npm install typings --global`来获取，如果连npm都没有的话，请安装[Node.js](https://nodejs.org/)

- 在项目所在文件夹执行`typings init`(可省略，安装后会自动生成)

- 搜索所需的库，如

```
> typings search jquery --ambient
Viewing 20 of 110

NAME                 SOURCE HOMEPAGE                                                DESCRIPTION VERSIONS UPDATED
chai-jquery          dt     https://github.com/chaijs/chai-jquery                               2        2016-12-29T04:01:00.000Z
jasmine-jquery       dt     https://github.com/velesin/jasmine-jquery                           1        2016-11-28T18:40:45.000Z
jquery               dt     http://jquery.com/                                                  2        2016-11-19T04:42:46.000Z
jquery-ajax-chain    dt     https://github.com/humana-fragilitas/jQuery-Ajax-Chain/             1        2016-05-10T01:06:27.000Z
jquery-alertable     dt     https://github.com/claviska/jquery-alertable                        1        2016-10-05T18:40:00.000Z
jquery-backstretch   dt     https://github.com/srobbin/jquery-backstretch                       1        2016-05-10T01:06:27.000Z

...
```
会获得近似上述的结果

如果曾经有使用`tsd`的经验，可能使用这样的命令来安装，然而在`typings`里这样是不对的

```
> typings install jquery --save --global
typings ERR! message Unable to find "jquery" ("npm") in the registry.
typings ERR! message However, we found "jquery" for 1 other source: "dt"
typings ERR! message You can install these using the "source" option.
typings ERR! message We could use your help adding these typings to the registry: https://github.com/typings/registry
typings ERR! caused by https://api.typings.org/entries/npm/jquery/versions/latest responded with 404, expected it to equal 200

...
```
报错大概长这样，其实，仔细查看文档就可得知，

- 正确的安装命令如下

```
> typings install dt~jquery --save --global
jquery
`-- (No dependencies)
```
然后就可获得这样的反馈表示安装成功

至此，项目文件夹下的结构大致如下

```
.
├── sample.ts
├── tsconfig.json
├── typings
│   ├── globals
│   │   └── jquery
│   │       ├── index.d.ts
│   │       └── typings.json
│   └── index.d.ts
└── typings.json
```
于是我们就能在`TypeScript`中引用它了

```ts
/// <reference path="typings/globals/jquery/index.d.ts" />

function foo(message: string) {
    var jq: JQuery = $("#debug");
    jq.append(message + '<br>');
}
```