---
layout:     post
title:      "图像移除水印的实现"
subtitle:   ""
date:       2016-03-27
author:     "TautCony"
header-img: "img/post-bg-remove-watermark.png"
image:
  credit: ゆるゆり
  creditlink: http://yuruyuri.com/
tags:
    - 编程
    - 图像处理
    - C#
    - Python
---

大概算一篇译文, 在找到苍蓝钢铁的琶音的代码考据的网站上看到了[一篇有趣的文章](http://qiita.com/YSRKEN/items/b0ab9c956f928ffdb483).

这个思路的除水印方法之前我也有在PS上试过, 当时的困惑是, 在水印颜色覆盖之后, 我该如何才能知道这个水印本来的颜色和透明度呢. 这个问题, 在读了本篇文章之后就知道方法了.

当然, 如果单单是翻译一下的话, 我也懒得搞, 原文的代码是用jawa写成的, 显然, 我并不待见jawa, 也不会(这才是真相吧喂 !). 在一番尝试之后, 我成功地在C#和Python中实现了一遍. 额, GUI并没有(毕竟拖框框也要时间).

#### 原理

[Alpha Blending](https://en.wikipedia.org/wiki/Alpha_compositing)

若将原色记为$$X$$, 将mask的颜色记为$$Y$$, 原色与mask重叠后的颜色记为$$Z$$, 并将mask的alpha值记作$$A$$的话, 这几个变量之间的关系能用式子$$Z=(1-A)X+AY$$来表示

那么，当我们获得一张带水印的图片的时候, 在这几个变量之中所未知的变量也就是$$[A,Y]$$. 于是, 只要我们准备两组$$[X,Z]$$, 就能通解一个二元一次方程组得出原先未知的$$[A,Y]$$.

这些值都有了的话, 我们就能对上式进行变形, 得: $$Z=\frac{Z-AY}{1-A}$$, 将被水印覆盖的部分的每一个像素的三个分量如此操作, 就能实现一个去水印的效果了.

#### 效果

> 源图像

![源图像](/img/in-post/remove-watermark/source.png)

> Mask

![Mask](/img/in-post/remove-watermark/mask.png)

> 结果

![效果](/img/in-post/remove-watermark/output.png)

由于所选定的颜色对效果有较大影响, 所以选的颜色不佳(~~其实也不能说是不佳, 就是是人品不好~~)会导致效果不理想, 如颜色偏深等.

#### 实现

原作者是通过jawa实现的, 源码可以在[这里](/attach/anti_sg10.7z)下到, 此处仅包含原码与编译后的jar文件, 完整的请移步至原页面下载.

先说说实现时遇到的坑点吧

```java
/* マスク画像のRGBおよび透過度の値を推測する */
void calcMaskColor(){
    // 元の色、および本当の色のRGB値を読み込む
    int[] color_before = new int[kPicColors], color_after = new int[kPicColors];

...

}
```

这里的`color_before`指的是被mask覆盖后现在的颜色, 而`color_after`才是真正原来的颜色, 然后我就弄反了, alpha值总是一个负数……, 虽然这个注释里说有说, 但是这个变量名……, 颇有误导性, 大概是要表述前景色, 这种感觉.

#### 改进

`if((image_mask.getRGB(x, y) & 0xFFFFFF) != 0x000000) continue;`原作者仅将mask文件中的纯黑色所在的像素作为需要处理的对象, 而就在他给出的例子中就能够发现一个问题, 不论是mask, 还是图像, 都存在着一个由于字体抗锯齿而导致的额外的透明度, 而这些不在处理范围内, 所以效果图上的水印的边框位置会留存一些尚未处理的残留.

所以在这里, 需要将mask中灰色的像素也纳入处理范围, 由于此处的灰色是通过对黑色增加一个alpha值的处理而的到的. 很容易得出, 其附加的透明度$$alpha_{extra}=1-\frac{color}{255}$$, 将它与之前得到的水印的alpha值相乘, 得到最终的alpha值并用这个值来处理图像, 就能将残留的部分也处理掉了.

> 优化后的结果

![效果2](/img/in-post/remove-watermark/output1.png)

#### 代码

> C# Version

```cs
internal static class RemoveWaterMark
{
    private struct MaskInfo
    {
        public Color MaskColor;
        public double MaskAlpha;
    }

    public class ColorPair
    {
        public ColorPair()
        {
        }

        public ColorPair(Color masked, Color source)
        {
            Masked = masked;
            Source = source;
        }

        public Color Masked { get; set; }
        public Color Source { get; set; }
    };

    private static Bitmap _imageSource;
    private static Bitmap _imageMask;

    private static MaskInfo _mask;

    private static bool CalculateMaskInfo(ColorPair pair1, ColorPair pair2)
    {
        var maskColor = new int[3];
        double maskAlpha = 0.0;
        for (int p = 0; p < 3; ++p)
        {
            int source1 = (pair1.Source.ToArgb() >> ((2 - p) * 8)) & 0xFF;
            int source2 = (pair2.Source.ToArgb() >> ((2 - p) * 8)) & 0xFF;
            int masked1 = (pair1.Masked.ToArgb() >> ((2 - p) * 8)) & 0xFF;
            int masked2 = (pair2.Masked.ToArgb() >> ((2 - p) * 8)) & 0xFF;
            int solvable = (source2 - source1) - (masked2 - masked1);
            if (solvable == 0)
            {
                Console.WriteLine("ERROR: Faild to calculate the mask info !");
                return false;
            }
            double alpha = 1 - ((double)(masked1 - masked2) / (source1 - source2));
            maskAlpha += alpha;
            maskColor[p] = (int)Math.Round((masked1 - (1 - alpha) * source1) / alpha);
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
        Console.WriteLine("MaskInfo:");
        Console.WriteLine($"    Color: {_mask.MaskColor}");
        Console.WriteLine($"    Alpha: {_mask.MaskAlpha:F3}");
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
            Console.WriteLine("Resolutions of source and mask unmatch");
            return;
        }

        Bitmap imageOutput = new Bitmap(_imageSource);

        double maskAlpha = _mask.MaskAlpha;
        Color maskColor = _mask.MaskColor;

        Func<double, double> maskGrayValue = c => 1 - c / 255.0;

        for (int x = 0; x < imageWidth; ++x)
        {
            for (int y = 0; y < imageHeight; ++y)
            {
                Color maskPixel = _imageMask.GetPixel(x, y);
                if (maskPixel.R != maskPixel.G || maskPixel.G != maskPixel.B) continue;// not grayscale
                double grayAlpha = maskGrayValue(maskPixel.R);// extra alpha value for mask, 0 as white
                double alpha = maskAlpha * grayAlpha;
                if (Math.Abs(alpha) < 1e-5) continue;// White

                int color = _imageSource.GetPixel(x, y).ToArgb() & 0xFFFFFF;
                double r = (color >> 16) & 0xFF, g = (color >> 8) & 0xFF, b = color & 0xFF;
                int newR = (int)Math.Round((r - alpha * maskColor.R) / (1.0 - alpha));
                int newG = (int)Math.Round((g - alpha * maskColor.G) / (1.0 - alpha));
                int newB = (int)Math.Round((b - alpha * maskColor.B) / (1.0 - alpha));
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
                     ColorPair pair1, ColorPair pair2, string targetPath)
    {
        if (!CalculateMaskInfo(pair1, pair2)) return;
        if (!LoadImage(sourcePath, maskPath)) return;
        ModifyImage(targetPath);
    }

    private static void Main(string[] args)
    {
        ColorPair pair1 = new ColorPair(Color.FromArgb(0xa1c9dd), Color.FromArgb(0xfff0e0));
        ColorPair pair2 = new ColorPair(Color.FromArgb(0x988faf), Color.FromArgb(0xea6a77));
        DeWaterMark("sample.png", "mask.png", pair1, pair2, "output.png");
    }
}

```

顺便, Atom的Markdown高亮有问题啊, ~~object initializer 里是不需要分号的, 但是Atom里无法正确渲染, 加个分号的话后续的内容才能正确高亮.~~

嗯, 不是这个问题, 是顶上的那个jawa代码大括号没有封闭, 可是, 代码块内的东西, 是不该影响到后序的的文本的高亮的, 所以还是Atom的锅.

在花了两节课之后, pyhton版也写出来了, 对python的全局变量还是不大了解, 总是失效, 于是靠返回值解决, 当然, 代码还是同一个套路……

> Python Version

```python
from PIL import Image

def LoadImage(sourcePath, maskPath):
    try:
        imageSource = Image.open(sourcePath)
        imageMask   = Image.open(maskPath)
        return [imageSource, imageMask]
    except:
        print("ERROR: Unable to load image")
        return []

def CalculateMaskInfo(pair1, pair2):
    maskColor = [0,0,0]
    maskAlpha = 0.0

    for p in range(3):
        source1 = (pair1[0] >> ((2-p)*8)) & 0xFF
        source2 = (pair2[0] >> ((2-p)*8)) & 0xFF
        masked1 = (pair1[1] >> ((2-p)*8)) & 0xFF
        masked2 = (pair2[1] >> ((2-p)*8)) & 0xFF

        solvable = (source2 - source1) - (masked2 - masked1)
        if solvable == 0:
            print("ERROR: Faild to calculate the mask info !")
            return []
        alpha = 1 - ((float)(masked1 - masked2) / (source1 - source2))
        maskAlpha += alpha
        maskColor[p] = round((masked1 - (1 - alpha) * source1) / alpha)
        if(maskColor[p] < 0x00): maskColor[p] = 0x00
        if(maskColor[p] > 0xFF): maskColor[p] = 0xFF

    maskAlpha = maskAlpha / 3
    if maskAlpha < 0.0: maskAlpha = 0.0
    if maskAlpha > 1.0: maskAlpha = 1.0

    print("MaskInfo:")
    print("    Color ",maskColor)
    print("    Alpha ",maskAlpha)
    return [maskColor, maskAlpha]

def ModifyImage(imageSource, imageMask, maskInfo, targetPath):
    sourceSize = imageSource.size
    imageWidth = sourceSize[0]
    imageHeight = sourceSize[1]
    if (imageWidth != imageMask.size[0] or imageHeight != imageMask.size[1]):
        print("ERROR: Resolutions of source and mask unmatch")
        return
    maskColor = maskInfo[0]
    maskAlpha = maskInfo[1]
    imageTarget = imageSource

    for x in range(imageWidth):
        for y in range(imageHeight):
            maskPixel =  imageMask.getpixel((x, y))
            if(maskPixel[0] != maskPixel[1] or maskPixel[1] != maskPixel[2]): continue
            grayAlpha = 1-maskPixel[0]/255.0
            alpha = maskAlpha * grayAlpha
            if(abs(alpha) < 1e-5): continue

            pixel = imageSource.getpixel((x,y))
            newR = round((pixel[0] - alpha*maskColor[0])/(1.0 - alpha))
            newG = round((pixel[1] - alpha*maskColor[1])/(1.0 - alpha))
            newB = round((pixel[2] - alpha*maskColor[2])/(1.0 - alpha))
            if(newR < 0x00): newR = 0x00
            if(newR > 0xFF): newR = 0xFF
            if(newG < 0x00): newG = 0x00
            if(newG > 0xFF): newG = 0xFF
            if(newB < 0x00): newB = 0x00
            if(newB > 0xFF): newB = 0xFF
            imageTarget.putpixel((x,y), (newR,newG,newB))
    #imageTarget.show()
    try:
        imageTarget.save(targetPath, 'PNG')
        print("Save Success!")
    except:
        print("ERROR: Save Failed")

def DeWaterMark(sourcePath, maskPath, pair1, pair2,targetPath):
    info = CalculateMaskInfo(pair1, pair2)
    if(len(info) < 2): return
    images = LoadImage(sourcePath, maskPath)
    if(len(images) < 2): return
    ModifyImage(images[0], images[1], info, targetPath)

###
p1 = (0xfff0e0, 0xa1c9dd)
p2 = (0xea6a77, 0x988faf)
DeWaterMark('sample.png', 'mask.png', p1, p2, 'pyOutput.png')
###

```

#### 总结

其实, 看了这个除水印所需的素材就能知道, 这个方法由于需要预先准备一个mask, 实际使用并不是很方便.
