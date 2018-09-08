---
layout:     post
title:      "Node.js安装一揽子解决方案"
subtitle:   "（并不是"
date:       2018-09-08
author:     "TautCony"
header-img: null
image:
  credit: GeoPattern
  creditlink: https://github.com/btmills/geopattern
tags:
    - 编程
---

Node.js版本号刷新飞快，诸如Ubuntu的包管理下的版本早已跟不上时代(?)，那么如何以最自然简便的方法及时跟上时代呢？

<!--more-->

## 1)新增源

按[这里](https://github.com/nodesource/distributions)的指示做就行了，但是这个依然按大版本分了一下，想一直是latest还得是不是重新执行一下，不够优雅。

## 2)使用版本管理

在这里使用到的是一个名为[n](https://github.com/tj/n)的Node.js版本管理软件，详情可参阅其README，在此仅简述其中一种。

```bash
» sudo apt install node npm # 安装旧版本的 Node.js
» sudo npm config set registry https://registry.npm.taobao.org # 更改国内源
» sudo npm install npm@latset -g # 更新 npm
» sudo npm install n -g # 安装版本管理
» sudo n latest # 安装最新版 Node.js
» sudo apt purge -y nodejs # 移除旧版本的 Node.js
```

为什么最后会有鬼畜的删除Nodejs操作呢？

```bash
» whereis node
node: /usr/bin/node /usr/local/bin/node /usr/share/man/man1/node.1.gz
```

因为`n`所安装的node并没有覆盖旧的Nodejs，所以如果在环境变量中先找到了旧的，就会很尴尬。

当然，如果`n`的安装没有通过`npm`的话，那就没有这个问题了。
