---
layout:     post
title:      "图像移除水印的实现"
subtitle:   ""
date:       2016-03-27
author:     "TautCony"
header-img: "img/post-bg-remove-watermark.png"
tags:
    - 编程
    - 图像处理
---

大概算一篇译文, 在找到苍蓝钢铁的琶音的代码考据的网站上看到了[一篇有趣的文章](http://qiita.com/YSRKEN/items/b0ab9c956f928ffdb483).

这个思路的除水印方法之前我也有在PS上试过, 当时的困惑是, 在水印颜色覆盖之后, 我该如何才能知道这个水印本来的颜色和透明度呢.

当然, 如果单单是翻译一下的话, 我也懒得搞, 原文的代码是用jawa写成的, 显然, 我并不待见jawa, 也不会(这才是真相吧喂！). 在一番尝试之后, 我成功地在C#中实现了一遍. 额, GUI没有(毕竟拖框框也要时间).

#### 原理

[Alpha Blending](https://en.wikipedia.org/wiki/Alpha_compositing)

若将原色记为$$X$$, 将mask的颜色记为$$Y$$, 原色与mask重叠后的颜色记为$$Z$$, 并将mask的alpha值记作$$A$$的话, 这几个变量之间的关系能用式子$$Z=(1-A)X+AY$$来表示

那么，当我们获得一张带水印的图片的时候, 在这几个变量之中所未知的变量也就是$$[A,Y]$$. 于是, 只要我们准备两组$$[X,Z]$$, 就能通解一个二元一次方程组得出原先未知的$$[A,Y]$$.

这些值都有了的话, 我们就能对上式进行变形, 得: $$Z=\frac{Z-AY}{1-A}$$, 将被水印覆盖的部分的每一个像素的三个分量如此操作, 就能实现一个去水印的效果了.

#### 效果
<blockquote>
源图像
</blockquote>
![源图像](/img/in-post/remove-watermark/source.png)

<blockquote>
Mask
</blockquote>
![Mask](/img/in-post/remove-watermark/mask.png)

<blockquote>
结果
</blockquote>
![效果](/img/in-post/remove-watermark/output.png)

由于所选定的颜色对效果有较大影响, 所以选的颜色不佳会导致效果不理想.

#### 实现

原作者是通过jawa实现的, 源码可以在[这里](/attach/anti_sg10.zip)下到, 此处仅包含原码与编译后的jar文件, 完整的请移步至原页面下载.

先说说实现时遇到的坑点吧

```java
/* マスク画像のRGBおよび透過度の値を推測する */
void calcMaskColor(){
    // 元の色、および本当の色のRGB値を読み込む
    int[] color_before = new int[kPicColors], color_after = new int[kPicColors];

...

```

这里的`color_before`指的是被mask覆盖后现在的颜色, 而`color_after`才是真正原来的颜色, 然后我就弄反了, alpha指总是一个负数……, 虽然这个注释里说有说, 但是这个变量名……, 颇有误导性, 大概是要表述前景色, 这种感觉.


```cs
internal static class RemoveWaterMark
{
    private static Bitmap _imageSource;
    private static Bitmap _imageMask;

    private struct MaskInfo
    {
        public Color MaskColor;
        public double MaskAlpha;
    }

    private static MaskInfo _mask;

    private static bool CalculateMaskInfo(IReadOnlyList<int> colorMasked, IReadOnlyList<int> colorSource)
    {
        var maskColor = new int[3];
        double maskAlpha = 0.0;
        for (int p = 0; p < 3; ++p)
        {
            int source1 = (colorSource[0] >> ((2 - p) * 8)) & 0xFF;
            int source2 = (colorSource[1] >> ((2 - p) * 8)) & 0xFF;
            int masked1 = (colorMasked[0] >> ((2 - p) * 8)) & 0xFF;
            int masked2 = (colorMasked[1] >> ((2 - p) * 8)) & 0xFF;
            int diff = (source2 - source1) - (masked2 - masked1);
            if (diff == 0)
            {
                Console.WriteLine("ERROR: Faild to calcute the mask info !");
                return false;
            }
            double m = (1.0 * (masked1 * source2 - masked2 * source1)) / (source2 - source1 - masked2 + masked1);
            if (Math.Abs(m - source1) < 1e-5)
            {
                Console.WriteLine("ERROR: Faild to calcute the mask info !");
                return false;
            }
            maskAlpha += (1.0 * (masked1 - source1)) / (m - source1);
            maskColor[p] = (int)Math.Round(m);
            if (maskColor[p] < 0x00) maskColor[p] = 0x00;
            if (maskColor[p] > 0xFF) maskColor[p] = 0xFF;
        }
        maskAlpha /= 3.0;
        if (maskAlpha < 0.0) maskAlpha = 0.0;
        if (maskAlpha > 1.0) maskAlpha = 1.0;

        _mask = new MaskInfo
        {
            MaskAlpha = maskAlpha,
            MaskColor = Color.FromArgb(maskColor[0], maskColor[1], maskColor[2])
        };
        Console.WriteLine("+MaskInfo:");
        Console.WriteLine($"|    Color: {_mask.MaskColor}");
        Console.WriteLine($"|    Alpha: {_mask.MaskAlpha:F3}");
        return true;
    }

    private static bool LoadImage(string sourcePath, string maskPath)
    {
        try
        {
            _imageSource = new Bitmap(sourcePath);
            _imageMask = new Bitmap(maskPath);
            return true;
        }
        catch (Exception exception)
        {
            Console.WriteLine($"ERROR: {exception.Message}");
            return false;
        }
    }

    private static void ModifyImage(string targetPath)
    {
        int imageWidth = _imageSource.Width, imageHeight = _imageSource.Height;
        if (imageWidth != _imageMask.Width || imageHeight != _imageMask.Height)
        {
            Console.WriteLine("Resolutions of source and mask unMatch");
            return;
        }

        Bitmap imageOutput = new Bitmap(_imageSource);

        double maskAlpha = _mask.MaskAlpha;
        Color maskColor = _mask.MaskColor;

        for (int x = 0; x < imageWidth; ++x)
        {
            for (int y = 0; y < imageHeight; ++y)
            {
                bool isMask = (_imageMask.GetPixel(x, y).ToArgb() & 0xFFFFFF) < 0x111111;
                if (!isMask) continue;
                int color = _imageSource.GetPixel(x, y).ToArgb() & 0xFFFFFF;
                double r = (color >> 16) & 0xFF, g = (color >> 8) & 0xFF, b = color & 0xFF;
                int newR = (int)Math.Round((r - maskAlpha * maskColor.R) / (1.0 - maskAlpha));
                int newG = (int)Math.Round((g - maskAlpha * maskColor.G) / (1.0 - maskAlpha));
                int newB = (int)Math.Round((b - maskAlpha * maskColor.B) / (1.0 - maskAlpha));
                if (newR < 0x00) newR = 0x00; if (newR > 0xFF) newR = 0xFF;
                if (newG < 0x00) newG = 0x00; if (newG > 0xFF) newG = 0xFF;
                if (newB < 0x00) newB = 0x00; if (newB > 0xFF) newB = 0xFF;
                Color newColor = Color.FromArgb(newR, newG, newB);
                imageOutput.SetPixel(x, y, newColor);
            }
        }
        try
        {
            imageOutput.Save(targetPath);
            Console.WriteLine("Save Success!");
        }
        catch (Exception exception)
        {
            Console.WriteLine(exception.Message);
        }
    }

    public static void DeWaterMark(string sourcePath, string maskPath,
        IReadOnlyList<int> colorMasked, IReadOnlyList<int> colorSource,
        string targetPath)
    {
        if (!CalculateMaskInfo(colorMasked, colorSource)) return;
        if (!LoadImage(sourcePath, maskPath)) return;
        ModifyImage(targetPath);
    }
}
```
