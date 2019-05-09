---
layout:     post
title:      "在openwrt下配置基于Cloudflare的ddns服务"
subtitle:   "脚本注释里才找到参数格式可还行"
date:       2019-05-09
author:     "TautCony"
header-img: null
image:
  credit: GeoPattern
  creditlink: https://github.com/btmills/geopattern
tags:
    - 网络
    - 路由
    - 生活
---

用Hyper-V装了个LEDE，发现luci有自带的ddns配置功能，支持的服务商还挺全的，试着配置了一下。

<!--more-->

相关设置界面如下，打开了ipv6的设定档截了个初始的参数。

![基础设置](/img/in-post/openwrt-ddns/setting-basic.png)

本以为这个按界面的提示操作一下就完事了，先不论这个有点神秘的中文，也不论为啥我需要填写两遍域名，这检查域名和域名又是啥关系（重点）

用户名填写Cloudflare的邮箱，密码填写从这里[获取](https://support.Cloudflare.com/hc/en-us/articles/200167836-Where-do-I-find-my-Cloudflare-API-key-)的API Key。

---

值得注意的是，需要将IP地址来源设置为URL，否则从端口获取的IP应该就是一个内网地址了，我这个LEDE软路由并不是直接接入的互联网，前面还套了一个光猫（弱电箱太小塞不进交换机，不然就桥接了）。

![高级设置](/img/in-post/openwrt-ddns/setting-advance.png)

设置搞完，点击保存并应用，点击启动，查看日志，duang，失败了，撇去无关的部分，主要报错信息如下：

```log
 183421       : parsing script '/usr/lib/ddns/update_Cloudflare_com_v4.sh'
 183421       : #> /usr/bin/curl -RsS -o /var/run/ddns/myddns_ipv4.dat --stderr /var/run/ddns/myddns_ipv4.err --noproxy '*' --header 'X-Auth-Email: email@address.com'  --header 'X-Auth-Key: ***PW***'  --header 'Content-Type: application/json'  --request GET 'https://api.Cloudflare.com/client/v4/zones?name=honstname.domain.TLD'
 183422  WARN : Could not detect 'zone id' for domain.tld: 'honstname.domain.TLD'
 183422 ERROR : No update send to DDNS Provider
 183422       : Waiting 600 seconds (Check Interval)
```

仔细一看`WARN : Could not detect 'zone id' for domain.tld`，`domain.tld`的`zone id`被我填上了`honstname.domain.TLD`，简单排查后发现即下面的一个域名框内容，那么改成`domain.TLD`呢？然而也不顶用，百思不得其解，搜搜网上也没怎么看到配置用这个的。那自己瞎试试咯，再改改上面那个，看日志以前设置的IP取不到了，那前一个问题就有回答了。

这个界面上上半截为ddns的通用设置，`检查域名`是指用来从DNS服务商处获取当前IP地址用的，然后同实时获取的IP进行对比，看是否有更新IP的必要。而下面`域名`一个则是在向DNS服务商（在本文中即指Cloudflare）设置新的IP时使用的。

那么这个到底该用什么格式填呢？我确实是用了同预先填充的默认参数格式写的，遇事不决看实现，界面上的提示显然在现阶段无法满足需求了，搜搜脚本到底[怎么写的](https://github.com/openwrt/packages/blob/openwrt-18.06/net/ddns-scripts/files/update_Cloudflare_com_v4.sh)，好嘛，在文件头的注释里就写上了，如下。

```bash
# using following options from /etc/config/ddns
# option username  - your Cloudflare e-mail
# option password  - Cloudflare api key, you can get it from Cloudflare.com/my-account/
# option domain    - "hostname@yourdomain.TLD"	# syntax changed to remove split_FQDN() function and tld_names.dat.gz
```

`hostname@yourdomain.TLD`！需要用`@`分隔！这同界面上填充的不一样啊。

再往下看看，原来是为了分割域名方便才用了这么个不同的字符，某种程度上也能理解吧……

更改保存启动日志！更新成功！浏览器关闭！

自此艰难的ddns设置就完成了，说回来自己遭劫写了脚本来定时执行了，这么折腾好像……
