---
layout:     post
title:      "<em class='logo'>hpe</em> ProLiant MicroServer Gen8 入手"
subtitle:   ""
date:       2017-06-17
author:     "TautCony"
catalog:    true
header-img: "img/post-bg-microserver-gen8.jpg"
image:
  credit: TautCony
  creditlink: /
tags:
    - 生活
    - 电子垃圾
---
<style>
.logo {
  font-family: HP-Slant;
  font-weight: 200;
  font-size: 200%;
}
</style>
自从之前的硬盘座翻车之后，我的两块硬盘就长期处于离线状态，下载东西靠着树莓派+一个2T的移动硬盘苟延残喘（不是

前几日硬盘钱终于到手，想着就算不买电子辣鸡到最后就是变成吃的或者变成塑料片，那还是买吧。

<!--more-->

<div style="height:15em;"></div>

### 开箱
    
请在这里想象一个俄罗斯套娃（并没有开箱图

### 系统的安装

看了下装系统盘大概可以分为两种，一种是装在光驱位上，由于需要禁用板载的RAID，缺点其实挺多的
- 需要准备一个U盘作为引导盘来引导这个系统盘
- 硬盘的温度检测也会失效，导致风扇转速偏高
- 无法使用`RAID`
- 接口仅为`SATA2`


另一种则是从主板的`SAS`口下手，把`SAS1`和`SATA5`对调，然后就没有上述缺点了，但要额外花钱（于是可以预见到我所用的是哪种了

整个的流程大概就是
- 插上转接线和`SATA`线，接上SSD
- 给iLO端口接上网线
- 使用iLO客户端开机设置SATA控制器，`BIOS->System Options->SATA Controller Options->Embedded SATA configuration->Enable SATA AHCI Support`
- 载入系统镜像，按`F10`进入相关界面按指示安装
- 将[ServerBoot.iso](/attach/ServerBoot.7z)烧录到一个U盘里，插到主板上 （[镜像来源](https://www.chiphell.com/thread-1470090-1-1.html)
- 往硬盘笼放硬盘
- 接上网线，开机

事后买了卷`3M`的海绵胶把SSD粘了一下，这回整洁多了。

//iLO的这个`Virtual Devices`的速度迷之慢，只有30Mbps，于是安装系统里准备文件步骤要花20几分钟，然后安装过程却不到20秒。第一次安装没有盯着看，以为是莫名其妙重启了，于是又重新装了一遍。。。

### 系统的配置

安装的是Windows Server 2016，序列号是从梦想炸裂那里来的，正版确实是方便啊，不用想着搞这搞那的。

安装系统后在计算机内可以看见两个不想看到的盘符，一个是引导盘的，在磁盘管理里面把盘符删了就行。还有一个名字叫`VID`，是个只读盘，没法进行操作，查了下全称是`Virtual Install Disk`，可以在`BIOS->Advanced Options->Advanced System ROM Options->Virtual Install Disk`处关闭。

然后可以在iLO的配置页面`Network->Shared Network Port->General`里设置一下iLO端口共享，这样的话就不用同时插两根网线了。

hmmmm，据称正规手段是用内建的`Intelligent Provisioning`进行系统安装，我直接通过镜像安装了，设备管理器里的其他设备里有个基本系统设备没有被正确安装驱动，具体是什么设备不是很清楚，用`SPP`全装之后就没有报错了。

[驱动](http://h20566.www2.hpe.com/hpsc/swd/public/readIndex?sp4ts.oid=5390291&lang=en&cc=us)的话杂七杂八很多，然后完整的包含BIOS等的更新的驱动包叫做[`Service Pack for ProLiant`](https://spp.hpe.com/custom/)，只有在保修期内才能下载，贼坑。

> 从四月往后，Gen8已经进入了完全过气的`Post Production`状态。hpe还于九月发布了`Service Pack for ProLiant Gen8.0`，其中仅包含Gen8所用的驱动与固件，以后也将不会有什么大的更新了，非常的稳健，建议下载备用。

### 后记

仔细一想，这玩意我现在的用法纯粹是高档硬盘盒啊，`600+`一个槽。之前试用的世特力约合`400+`一个槽，这样看似乎也不是特别贵哦，还带下载功能是吧（

后续可能暂时没什么时间折腾了（反正也没钱折腾了），暂时先这样吧。

给logo加字体的时候突然想到现在这公司是hpe哦，分拆出来了的，往标题加个e。
