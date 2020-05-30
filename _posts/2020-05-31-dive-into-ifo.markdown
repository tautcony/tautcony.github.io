---
layout:     post
title:      "DVD回放章节时间为何总是飘"
subtitle:   "是人性的扭曲还是道德的沦丧"
date:       2020-05-31
author:     "TautCony"
header-img: "img/post-bg-default.png"
image:
  credit: himawari-8
  creditlink: http://himawari8.nict.go.jp/
tags:
    - DVD
    - 视频
    - 压制
    - ChapterTool
catalog: true
---

敬请关注今天走进IFO（感觉记忆已经模糊了，再不记下来，那很快就会忘光吧）

<!--more-->

## 背景

虽然在现在这个流媒体的时代，BD都快不受人待见了，DVD就更不用说了，而依然有一系列的厂商依然我行我素，发行DVD，或是上古老坑，只有DVD，只能捏着鼻子处理。

以往的压制教程中，往往有提及使用了[`DVDDecrypt`](http://www.dvddecrypter.org.uk/)进行提取的话，其获得的IFO文件的时间戳往往是存在问题的，需要将时间乘以一个`1.001`的系数才行。

可是这个呢，又不是必然的，有时又是没问题的(指`PAL`)，作为一个稍有追求的人，怎么能容许这样的不确定性呢，于是进行了一番研究（大概是一年前）。

## 查证

DVD仅支持`NTSC`和`PAL`两个帧率标准，分别为`30000/1001`fps和`25`fps，对于动画或电影更常见的`24000/1001`fps视频，通常时使用[telecine](https://en.wikipedia.org/wiki/Telecine)进行处理塞进DVD的，由于`PAL`并没有`1.001`问题，故下文提及的均为`NTSC`的视频。

既然要了解为什么时间会不准确，首先要了解的就是IFO文件中其时间到底是如何存储的，因为往往这种理解上的不一致，导致了误差的出现，就比如cue文件中的时间，小数点后的部分是以帧`1/75`s为单位而不是想当然的毫秒。

[IFO](http://dvd.sourceforge.net/dvdinfo/ifo.html)在DVD中，主要提供的是额外的元数据，诸如区域、音频语言、菜单、播放顺序等信息，其中章节在IFO中被定义为[`Program Chain`](http://dvd.sourceforge.net/dvdinfo/pgc.html)。


> cell playback time, BCD, hh:mm:ss:ff with bits 7&6 of frame (last) byte indicating frame rate 11 = 30 fps, 10 = illegal, 01 = 25 fps, 00 = illegal

每一个时间戳都由4个字节构成，布局如下，使用BCD码编码

| offset | bit-length | description | comment |
| -- | -- | -- | -- |
| 0 | 8 | hours in bcd format | [0, 100) |
| 8 | 8 | minutes in bcd format | [0, 100) |
| 16 | 8 | seconds in bcd format | [0, 100) |
| 24 | 2 | frame rate | 0b01==PAL 0b11==NTSC |
| 26 | 6 | frames in bcd format | [0, 40) |

## 实现

然后呢来看一下我们常见工具中是怎么实现的

### [MediaInfo](https://github.com/MediaArea/MediaInfoLib/blob/master/Source/MediaInfo/Multiple/File_Dvdv.cpp#L1155)

```c++
void File_Dvdv::Get_Duration(int64u  &Duration, const Ztring &Name)
{
    int32u FrameRate, FF;
    int8u HH, MM, Sec;
    Element_Begin1(Name);
        Get_B1 (HH,                                     "Hours (BCD)");
        Get_B1 (MM,                                     "Minutes (BCD)");
        Get_B1 (Sec,                                     "Seconds (BCD)");
        BS_Begin();
        Get_BS (2, FrameRate,                           "Frame rate"); Param_Info2(IFO_PlaybackTime_FrameRate[FrameRate], " fps");
        Get_BS (6, FF,                                  "Frames (BCD)");
        BS_End();

        Duration= Ztring::ToZtring(HH, 16).To_int64u() * 60 * 60 * 1000 //BCD
                + Ztring::ToZtring(MM, 16).To_int64u()      * 60 * 1000 //BCD
                + Ztring::ToZtring(Sec, 16).To_int64u()          * 1000 //BCD
                + Ztring::ToZtring(FF, 16).To_int64u()           * 1000/IFO_PlaybackTime_FrameRate[FrameRate]; //BCD

        Element_Info1(Ztring::ToZtring(Duration));
    Element_End0();
}
```

### [MeGUI](https://sourceforge.net/projects/megui/)

```cs
internal static TimeSpan? ReadTimeSpan(byte[] playbackBytes, out double fps)
{
    short? frames = GetFrames(playbackBytes[3]);
    int fpsMask = playbackBytes[3] >> 6;
    fps = fpsMask == 0x01 ? 25D : fpsMask == 0x03 ? (30D / 1.001D) : 0;
    if (frames == null)
        return null;
    try
    {
        int hours = AsHex(playbackBytes[0]);
        int minutes = AsHex(playbackBytes[1]);
        int seconds = AsHex(playbackBytes[2]);
        TimeSpan ret = new TimeSpan(hours, minutes, seconds);
        if (fps != 0)
            ret = ret.Add(TimeSpan.FromSeconds((double)frames / fps));
        return ret;
    }
    catch { return null; }
}
```

可以看到，两者计算的思路时一致的，撇除精度误差的话，所得的值也是一样的，如下是港版K-ON剧场版的[章节数据](/attach/ifo-sample/kon.zip)：

| mediainfo | MeGUI | Exact |
| -- | -- | -- |
| 00:00:00.000 | 00:00:00.000 | 00:00:00.000 |
| 00:17:42.500 | 00:17:42.501 | 00:17:42.500 |
| 00:37:14.766 | 00:37:14.769 | 00:37:14.767 |
| 00:56:24.166 | 00:56:24.170 | 00:56:23.166 |
| 01:12:36.699 | 01:12:36.705 | 01:12:36.700 |
| 01:32:26.265 | 01:32:26.273 | 01:32:25.266 |
| 01:49:06.131 | 01:49:06.142 | 01:49:05.133 |

每个时间戳均指代一个区块的长度，章节为累加得出，故精度误差存在累加，准确值在第三列中列出，可自行与上述仓库中的代码进行比对。

乍一看怎么那么科学呢，没有哪行代码是需要指摘的。同时，使用播放器直接播放该DVD，显示的也是同上述两个软件一致的时间，跳转也正常。多方印证一致，为什么压制之后就不对了呢？

## 分析

| hour | minute | second | frame | total frame |
| -- | -- | -- | -- |   --   |
| 00 | 17 | 42 | 15 |  31875 | 
| 00 | 19 | 32 | 08 |  67043 |
| 00 | 19 | 09 | 12 | 101525 |
| 00 | 16 | 12 | 16 | 130701 |
| 00 | 19 | 49 | 17 | 166388 |
| 00 | 16 | 39 | 26 | 196384 |
| 00 | 00 | 00 | 15 | 196399 |

经过播放器的跳转、帧数的确认，只有全程通过`30`fps进行跳转/转换，才能让帧数、时间、和章节信息匹配一致，而我们最终压制的成品，要么是24000/1001fps的，要么是30000/1001fps的，那这样，其偏差的来源大致上可以确认了。

以这么一个数据块为例`0x00|0x17|0x42|0x75`

其00:17:42是使用帧率`30`fps得来的，而我们这里关注的时间，对应的帧率是`30000/1001`fps，所以应该如下面的代码片段所示，使用帧数进行中转，以获取正确的时间。

```cs
var _30 = 30;
var _29_97 = 30000D / 1001D;

var hour = 0;
var minute = 17;
var second = 42;
var frame = 15;

// incorrect: 00:17:42:500
var megui = new TimeSpan(hour, minute, second).Add(TimeSpan.FromSeconds(frame / _29_97));

//correct 00:17:43.562
var totalFrame = (hour * 3600 + minute * 60 + second) * _30 + frame;
var time = TimeSpan.FromSeconds(totalFrame / _29_97);
```

## 结论

总的来说，IFO于其内部储存的，实质都是帧数的形式的。所以，它虽然数据上在小数位直接用帧数表示，并不意味着只要把小数部分用实际的帧率(30000/1001fps)转换回秒数加到本体上就可以了。计算的本体，首先得是帧数。必须先将它用整数的帧率(30)完整转回帧数，再根据视频实际的帧率(30000/1001fps)重新算回时间。而MediaInfo中一定程度上是忠实重现DVD中的数据，仅能指代原视频的帧数而已。

但在压制中就不能直接使用那个数据了，更关注的是它实际播放到这里的时间，因为不管套上什么IVTC，VFR，帧数变得天翻地覆，时间一旦确定准了，就没有问题。最多说处理完之后，可以让原本的章节时间戳是向新的视频中最近的帧数靠近。

整体上来说，曾经的办法把每个时间乘以`1.001`的系数，是可用的。但理论上来分析的话，每个章节，最多会有29帧的时长相当于被乘了两遍`1.001`，这个偏差有多大呢？假设一个NTSC的视频每个章节都截至在`29`帧处，总计有50个章节的话，能有`(29/(30/1.001))*50*0.001`(`0.0483816̅`s)那么多，大约一帧半，相当可观的差距了，说不准就下一帧就转场完了呢。

但考虑到一般没有那么大的巧合次次`29`，同时正常电影都不会有50个章节之多，更别说是DVD了，K-ON BD版有16个章节而到了DVD版就只剩7个章节了。所以完全是一个可用的思路。

当然了，如果使用[ChapterTool](https://github.com/tautcony/ChapterTool)的话，当然是可以正确处理这个情况的（硬广）。
