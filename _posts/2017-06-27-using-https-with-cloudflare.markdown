---
layout:     post
title:      "在自定义域名的Github Page上启用HTTPS"
subtitle:   "以本站为例（"
date:       2017-06-27
author:     "TautCony"
header-img: "img/post-bg-using-https-with-cloudflare.svg"
image:
  credit: public
  creditlink: 
tags:
    - 前端
---

突然不想学习，倒腾了一下[`Service worker`](https://developers.google.com/web/fundamentals/getting-started/primers/service-workers)。。。

<!--more-->

[`Service worker`](https://developers.google.com/web/fundamentals/getting-started/primers/service-workers)着实是一个相当有趣的功能，它使得网页在离线状态下也具备一定的可用性。

> 追记：似乎玩坏了，瞎改了下代码，每次打开网页都都缓存着旧的页面了，改了`sw.js`还不会重新部署，我还是关了吧……

但是只有在`HTTPS`环境下可以使用，使用默认的Github Page的地址的话是自带`HTTPS`的，但是如果你使用了自定义的域名，就不能享受这个签名了。

> 使用服务工作线程，您可以劫持连接、编撰以及过滤响应。 这是一个很强大的工具。您可能会善意地使用这些功能，但中间人可会将其用于不良目的。 为避免这种情况，可仅在通过 HTTPS 提供的页面上注册服务工作线程，如此我们便知道浏览器接收的服务工作线程在整个网络传输过程中都没有被篡改。

此时，可以使用[CloudFlare](https://www.cloudflare.com/)提供的服务，其`Free website`的Plan就完全够用了，囊括了CDN、SSL证书、缓存等等的设置。

其实早前就已经看到了这个，但不知为什么当时下意识认为配置会非常复杂，就一直没有搞，实际……相当方便。

仅仅需三个步骤：

- 注册CloudFlare账号
- 输入域名
- 在域名注册商的管理页面把Name Server改成CloudFlare给定的地址

然后等小绿锁生效就行了。

此外还可以在Page Rules里配置一下`Always use HTTPS`。

这种被CloudFlare称为Flexible SSL。

![Type of SSL](https://www.cloudflare.com/a/static/images/ssl/ssl.png)

也即从CloudFlare到实际服务器那段是没有SSL的，但是我们已经知道背后的静态页面有多安全了，我只是想要小绿锁（

配置好HTTPS后就可以开始搞[`Service worker`](https://developers.google.com/web/fundamentals/getting-started/primers/service-workers)了，Google提供的介绍已经颇为详细了，所以就不赘述了。

我这里用的是我这个主题上游所写的`sw.js`，稍微修正了点东西，稍微加了些缓存的内容。

于是现在只要打开过本博客往后在离线状态下也会有缓存页面/断网提示页面，而不是只能陪小恐龙跳仙人掌了（考虑把小恐龙也搬进来）。

但是很奇怪的是，我本机上有一段时间并没有正确获取页面的证书，而是读到了Github给的那个证书，相当迷。

经由ss打开了下页面之后就一切正常了，怕不是之前证书更新不下来。
