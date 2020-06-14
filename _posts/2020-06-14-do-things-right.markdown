---
layout:     post
title:      "Do Things Right"
subtitle:   "怪怪的 怪怪的 怪怪的 怪怪的"
date:       2020-06-14
author:     "TautCony"
header-img: "img/post-bg-default.png"
image:
  credit: himawari-8
  creditlink: http://himawari8.nict.go.jp/
tags:
    - 路由
    - ledesoft
    - 网络
---

请听柯文哲首张单曲《[Do Things Right](https://www.youtube.com/watch?v=gwxdh4JX9e4)》

<!--more-->

# 请注意，本文非技术类文章，是歌曲推荐来的

今日打开LEDE突然发现时隔多日Koolshare的软件商店从`0.3.9`更新到`0.4.1`了，minor version变动了，有点东西！就点击了更新。

可是[changelog](https://github.com/koolshare/ledesoft/blob/20bedaa70767731c0d488c7d0e65e844cc16b3f3/softcenter/Changelog.txt)并没有什么写内容。那就看看提交历史吧，最近的两个提交分别是：[update](https://github.com/koolshare/ledesoft/commit/d032741c92f0ce56465d6b5a20609d6192051a59), [do the right thing](https://github.com/koolshare/ledesoft/commit/2df4fe915da4529e709f137bcf0017643d8763aa)。再往下的主要都是插件更新的内容了，`update`都是些修修补补，就不贴了。

```diff
diff --git a/softcenter/build.sh b/softcenter/build.sh
index 250609a..b14142b 100755
--- a/softcenter/build.sh
+++ b/softcenter/build.sh
@@ -1,5 +1,5 @@
 #! /bin/sh
-VERSION=0.3.9
+VERSION=0.4.0
 
 cat version
 rm -f softcenter.tar.gz
diff --git a/softcenter/softcenter/scripts/ks_tar_install.sh b/softcenter/softcenter/scripts/ks_tar_install.sh
index 96a0b01..1911ab3 100755
--- a/softcenter/softcenter/scripts/ks_tar_install.sh
+++ b/softcenter/softcenter/scripts/ks_tar_install.sh
@@ -17,7 +17,26 @@ clean(){
 	dbus remove soft_name
 }
 
+detect_package(){
+	local ILLEGAL_KEYWORDS="ss|ssr|shadowsocks|shadowsocksr|v2ray|trojan|clash|wireguard|koolss|brook"
+	local KEY_MATCH=$(echo $soft_name | grep -Eo "$ILLEGAL_KEYWORDS")
+	
+	if [ -n "$KEY_MATCH" ]; then
+		echo_date =======================================================
+		echo_date "检测到离线安装包名：${soft_name} 含有非法关键词！！！"
+		echo_date "根据法律规定，koolshare软件中心将不会安装此插件！！！"
+		echo_date "删除相关文件并退出..."
+		echo_date =======================================================
+		clean
+		exit 1
+	fi
+}
+
 install_tar(){
+
+	# do the right thing
+	detect_package
+
 	name=`echo "$soft_name"|sed 's/.tar.gz//g'|awk -F "_" '{print $1}'|awk -F "-" '{print $1}'`
 	INSTALL_SUFFIX=_install
 	VER_SUFFIX=_version
```

有点意思，虽然商店本身早已不提供各类扶墙工具的下载，但手动安装的路子一直是敞开的，只需到对应的仓库下载安装包并进行离线安装即可，现在似乎出于某些原因需要对其加以限制了。

既然限制的commit message为`do the right thing`，那么我们就应该播放一下对应的歌曲。

<iframe width="560" height="315" src="https://www.youtube.com/embed/gwxdh4JX9e4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

请搭配以下diff收听，听完它就能装了。

```diff
diff --git a/softcenter/softcenter/scripts/ks_tar_install.sh b/softcenter/softcenter/scripts/ks_tar_install.sh
index e0458fe..4e0c8f5 100755
--- a/softcenter/softcenter/scripts/ks_tar_install.sh
+++ b/softcenter/softcenter/scripts/ks_tar_install.sh
@@ -18,6 +18,8 @@ clean(){
 }

 detect_package(){
+       echo_date "Do Things Right"
+       return
        local TEST_WORD="$1"
        local ILLEGAL_KEYWORDS="ss|ssr|shadowsocks|shadowsocksr|v2ray|trojan|clash|wireguard|koolss|brook"
        local KEY_MATCH=$(echo "${TEST_WORD}" | grep -Eo "$ILLEGAL_KEYWORDS")
```

重装了下消失的Clash，并没有被拦截，效果挺好。

