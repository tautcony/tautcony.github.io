---
layout:     post
title:      "出现在 劇場版 蒼き鋼のアルペジオ –アルス・ノヴァ- Cadenza 中的C/C++代码"
subtitle:   "代码恒久远，两段永流传"
date:       2016-03-26
author:     "TautCony"
header-img: "img/post-bg-cadenza.jpg"
tags:
    - 动画
    - 编程
    - C
    - C++
---

今天苍蓝钢铁的琶音的剧场版的下半部[Ars Nova Cadenza](http://vcb-s.com/archives/5164)先行版发布了. 算是`1day`吧. 嘛, 这些不是关键, 在视频很多地方, 如4分30秒左右(大和)、19分35秒左右（那智）、23分左右(401)等等, 出现了一坨C++代码, 甚是好奇, 于是就往Google上写了一部分上去搜, 不出意外, 搜到了……

[「蒼き鋼のアルペジオ ‐アルス・ノヴァ‐」におけるC言語/C++ネタについて](http://qiita.com/YSRKEN/items/6fc784d4f7f9206537fc), 喵了眼, 靠, TV版的时候就出现了. 甚至作者在考证TV各集出现的代码的时候,

第二话:

> ……あれ、つまり<b>使い回し</b>？　この後のイオナのシーンでも同じだったし……。<br>
> //欸, 也就是说又用了一遍? 这之后的 Iona 出现的场景也是这个

第三话至结尾:

> 第12話まで一通り確認しましたが、上記の2コード以外は見受けられませんでした。<br>
> //一直确认到第12话, 除了以上两段代码没见到别的

对上一部的剧场版:

> <b>なんでヒエイも上2つのコードしか無いんだよ！！</b><br>
> //为什么比叡也只出现了这两段代码啊!!

这一部剧场版:

> もう一つの劇場版は……円盤出てから検証を書くかな。<br>
> //还有一个剧场版的话, 等出原盘确认了之后再记下来吧

很遗憾, 这两段代码贯穿了整个动画.

片中一共出现的两段代码如下

 [第一段](http://www.officeuchida.com/pcp/cppintro6.html#Sample6-4), 使用了模板的Point类

```cpp
#include<iostream>
using namespace std;

template <class Type>
class Point
{
    Type x, y;

public:
    Point( Type, Type );

    void pr();
};

template <class Type>
Point<Type>::Point( Type ax, Type ay )
{
    this->x = ax;
    this->y = ay;
}

template <class Type>
void Point<Type>::pr()
{
    cout << "(" << this->x << "," << this->y << ")" << endl;
}

int main()
{
    Point<int> pint( 0, 1 );
    Point<double> pdouble( 1.2, 3.4 );
    Point<char> pchar( 'a', 'b' );

    pint.pr();
    pdouble.pr();
    pchar.pr();

    return 0;
}
```

[第二段](http://www7b.biglobe.ne.jp/~kcy05t/nicipro.html), 氦原子轨道的计算

```c
#include <stdio.h>
#include <math.h>

int main(void)
{
    int i;
    double r,E,rm;
    double vya,vyb,poten,VX,VY,prexx,preyy,WN,ra,rb;
    double xx,yy,vk,preVY,preWN,midWN,leng,wav,ac;
    double me=9.1093826e-31;
    double pai=3.141592653589793;
    double epsi=8.85418781787346e-12;
    double h=6.62606896e-34;
    double ele=1.60217653e-19;
    double Z = 2.0;
    double nucle = 6.64465650e-27;

    rm = (2.0*me*nucle) / (2.0*me + nucle);  /*reduced mass of helium*/
    rm = rm*0.5;
    /*input  r1 and |E|*/

    printf("r1 between nucleus and electron 1 (MM)？ ");
    scanf("%lf", &r);

    printf("total energy |E| of helium atom (eV) ? ");
    scanf("%lf", &E);

    for (i = 1; i < 100; i++)
    {
        /*repeat until r1=initial r1+100*/

        /*poten = potential energy*/
        poten = -(2.0*Z*ele*ele) / (4.0*pai*epsi*r) + (ele*ele) / (4.0*pai*epsi*2.0*r);

        /*vya= total E-potential energy*/
        vya = -(E*1.60217646e-19) - poten*1.0e14;
        if (vya > 0)
        {
            /*vyb=electron initial velocity (m/sec)*/
            vyb = sqrt(vya / me);
            VY = vyb*1.0e-9;           /*change m/sec to MM/SS*/
            prexx = r;  VX = 0.0; WN = 0.0; preyy = 0.0;

            do
            {
                xx = prexx + VX; yy = preyy + VY;        /*electron 1 position after 1SS*/
                preVY = VY; preWN = WN;
                vk = VX*VX + VY*VY;
                leng = sqrt(vk) * 1.0e-14;               /*moving length (m) for 1 SS*/
                wav = h / (rm*sqrt(vk) * 1.0e9);         /*de Broglie wavelength (m)*/
                WN = WN + leng / wav;                    /*add de Broglie wavelength*/
                                                         /*calculation of VX,VY from Coulomb force*/
                ra = sqrt(prexx*prexx + preyy*preyy);    /*between nucleus and electron*/
                rb = sqrt(4.0*prexx*prexx + 2.0*preyy*preyy); /*between two electrons*/

                ra = ra*1.0e-14; rb = rb*1.0e-14;        /*change MM to meter*/
                prexx = prexx*1.0e-14; preyy = preyy*1.0e-14;
                ac = (ele*ele) / (4.0*pai*epsi*rm);
                /*acceleration (MM/SS^2)*/
                VX = VX + 1.0e-32*ac*prexx*(-Z / (ra*ra*ra) + 2.0 / (rb*rb*rb));
                VY = VY + 1.0e-32*ac*preyy*(-Z / (ra*ra*ra) + 1.0 / (rb*rb*rb));
                prexx = xx; preyy = yy;
            }
            while (xx >= 0);    /*electron has moved one quater of an orbit?*/
            if (VY > -0.0001 && VY < 0.0001)
            {
                /*last VY condition*/
                printf("r1= %.2f ", r);
                printf("VX= %.6f ", VX);
                printf("VY= %.6f ", VY);
                printf("preVY= %.6f ", preVY);
                midWN = (preWN + WN) / 2.0; printf("midWN= %.6f\n", midWN);
            }
        }
        r = r + 1;
    }
    return 0;
}
```

啊 Iona 消失了, 不大爽.
