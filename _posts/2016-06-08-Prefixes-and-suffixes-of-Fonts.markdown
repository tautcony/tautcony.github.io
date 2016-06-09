---
layout:     post
title:      "日文字体前缀与后缀的意义"
subtitle:   ""
date:       2016-06-08
author:     "TautCony"
header-img: "img/post-bg-default.png"
tags:
    - 字体
---

## 前缀

「A-OTF」「U-OTF」「G-OTF」之间的区别

「A-OTF」全称为 Adobe Japan Character Collection for CID-Keyed Fonts，简要地说就是Adobe规格的字体[[文档](https://partners.adobe.com/public/developer/en/font/5078.Adobe-Japan1-6.pdf)]

「U-OTF」= 包含了[U-PRESS](http://www.morisawa.co.jp/culture/dictionary/1950)规定的文字集的字体。

也就是说U-OTF是针对报社的，相较A-OTF补全了地名和人名的汉字的字体。

所以，一般而言，使用「A-OTF」就已经足够了，如果需要特定的人名或地名的情况下才需使用「U-OTF」。

另外「G-OTF」是在教学上如教科书上，如在要使用使用「正确字形的汉字」的情况下使用这种（[学参フォント](http://www.morisawa.co.jp/culture/dictionary/1906)）。


## 后缀

### 字集

「Std」「Pro」「Pr5」「Pr6」之间的区别

简单而言就是文字数的区别。

> 
> Std = 09,354字 [Adobe-Japan1-3]<br>
> Pro = 15,414字 [Adobe-Japan1-4]<br>
> Pr5 = 20,317字 [Adobe-Japan1-5]<br>
> Pr6 = 23,058字 [Adobe-Japan1-6]<br>
> 

然后，还有一组谜一样的后缀的后缀N，比如这样 「StdN」「ProN」「Pr5N」「Pr6N」，这又是什么呢？

首先，我们来看个对比图：
![后缀N](/img/in-post/Prefixes-and-suffixes-of-Fonts/FontsN.png)

看出区别了么？

不带N的是遵循JIS90的笔划有略写的字形。

带N的则是遵循JIS2004的笔画遵照了旧字形。

[详细对照](http://www.adobe.com/jp/support/winvista/pdfs/JIS2004_Comparison.pdf)
[JIS官网](http://www.jisc.go.jp/newstopics/2005/040220kanjicode.pdf)

### 字重

字重的话我们能看到有些非常齐全的字体会有`W1～W9`9种字重

> ![ヒラギノ角ゴ不同字重](/img/in-post/Prefixes-and-suffixes-of-Fonts/hiraKakugoW.png)
> 不要吐槽文字内容，我懒得搞，搬来的

|  **Weight数值** | **ISO标记与其缩写** | **参考和译** | **惯用表示** |
|  :------: | :------: | :------: | :------: |
|  W1 | Ultra light : UL | 極細 |  |
|  W2 | Extra light : EL | 特細 |  |
|  W3 | Light : L | 細 |  |
|  W4 | Semi light : SL | 中細 | Regular : R |
|  W5 | Medium : M | 中 |  |
|  W6 | Semi bold : SB | 中太 | Demi bold : DB・D |
|  W7 | Bold : B | 太 |  |
|  W8 | Extra bold : EB | 特太 | E |
|  W9 | Ultra bold : UB | 極太 | U |

那么W12、L2、B2之类的字重又是什么呢？

以上的介绍仅仅是字体设计方作为字体名的一部分，并没有严密统一的规范或基准，比如DynaFont就存在有W1到W14字重的字体。


### source
> http://wp.design-studio-t.jp/?p=599 <br>
> http://blog.karasuneko.com/design-dtp/japanese-fonts-std-pro-pr5-pr6/ <br>
> http://fontnavi.jp/zakkuri/206-font_weight.aspx

> 我翻译水平又差，语文又差，文不达意之类的敬请海量，更详细的信息敬请Google。