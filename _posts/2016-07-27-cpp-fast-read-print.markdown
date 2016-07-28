---
layout:     post
title:      "C++最快的读入输出方案"
subtitle:   "你猜哪个最快"
date:       2016-07-27
author:     "TautCony"
header-img: "img/post-bg-default.png"
image:
  credit: himawari-8
  creditlink: http://himawari8.nict.go.jp/
tags:
    - 编程
    - C++
---

今天有人问起 GCC 和 VS的编译出来的 x265 在速度上有什么区别。自然，这个问题我无从答复，但是又想起了一个老生常谈的问题，C++里怎么读入数据最快。

<!--more-->


先前有在codeforces上拜读过一篇文章([link](http://codeforces.com/blog/entry/925))，从文中可以看到十分巨大的差距

然后又在byvoid菊苣哪里看到了一篇([link](https://www.byvoid.com/blog/fast-readfile))，也证实了这一观点

但是这两篇文章都相当老了，很巧都是10年的，于是我想着自己也试着测试一下，结果，额，很魔法。

首先是样例的生成，生成了1000000个随机数

```cpp
#include <iostream>
#include <random>

using namespace std;

int main()
{
    freopen("case0.in", "w", stdout);
    random_device seed_gen;
    mt19937 engine(seed_gen());
    for(int i = 0; i < 10000000; ++i)
    {
        cout << engine() << " ";
        if(i != 0 && i % 20 == 0) cout << endl;
    }
    return 0;
}
```

然后就是测试用代码了，取自byvoid菊苣的博客，时间统计使用更精确的方式（或许）

```cpp
#include <iostream>
#include <iomanip>
#include <cstdio>
#include <chrono>
using namespace std;

const int MAXN = 10000000;
const int MAXS = 120*1024*1024;

int numbers[MAXN];
char buf[MAXS];

void scanf_read()
{
    for (int i=0;i<MAXN;i++)
        scanf("%d",&numbers[i]);
}

void cin_read()
{
    for (int i=0;i<MAXN;i++)
        std::cin >> numbers[i];
}

void cin_read_nosync()
{
    std::ios::sync_with_stdio(false);
    for (int i=0;i<MAXN;i++)
        std::cin >> numbers[i];
}

void analyse(char *buf,int len = MAXS)
{
    int i;
    numbers[i=0]=0;
    for (char *p=buf;*p && p-buf<len;p++)
        if (*p == ' ')
            numbers[++i]=0;
        else
            numbers[i] = numbers[i] * 10 + *p - '0';
}

void fread_analyse()
{
    int len = fread(buf,1,MAXS,stdin);
    buf[len] = '\0';
    analyse(buf,len);
}

int main()
{
    int n; scanf("%d", &n);
    freopen("case0.in","rb",stdin);
    chrono::high_resolution_clock::time_point t1 = chrono::high_resolution_clock::now();
    switch(n)
    {
    case 1: scanf_read(); break;
    case 2: cin_read(); break;
    case 3: cin_read_nosync(); break;
    case 4: fread_analyse(); break;
    }
    chrono::high_resolution_clock::time_point t2 = chrono::high_resolution_clock::now();
    auto duration = chrono::duration_cast<chrono::microseconds>( t2 - t1 ).count();
    cout << fixed << setprecision(6) << duration/1000000.0 << "\n";
    return 0;
}
```

编译命令

```bash
g++ -Wall -std=c++1z -O2 test.cc -o gpp.out
gcc -Wall -std=c11 -O2 test.c -o gcc.out
clang -Wall -std=c11 -O2 test.c -o clang.out
clang++ -Wall -std=c++1z -O2 test.cc -o clangpp.out
```

然后，就可以公布神奇的结果了

Windows(Windows10 10586)

|   | scanf | cin | cin(nosync) | fread | version |
|  ------ | ------ | ------ | ------ | ------ | ------ |
|  g++ | 8.765754 | 0.053110 | 0.055810 | 0.259083 | 6.1.0 |
|  clang++ |  |  |  |  | 3.8.1 |
|  vs | 3.958946 | 0.575420 | 0.564431 | 0.279977 | 19.00.24210 |
|   |  |  |  |  |  |
|  gcc | 1.7916 |  |  | 0.2616 | 6.1.0 |
|  clang | 2.4888 |  |  | 0.3624 | 3.8.1 |

> 由于VS升级了一波之后clang++的-fms-compatibility-version=19.00莫名不起作用了，于是clang++编译出的结果就没了(

Linux(ubuntu 16.04)

|   | scanf | cin | cin(nosync) | fread | version |
|  ------ | ------ | ------ | ------ | ------ |
|  g++ | 1.860835 | 0.095274 | 0.090971 | 0.306935 | 5.4.0 |
|  clang++ | 1.849072 | 0.091141 | 0.091244 | 0.322120 | 3.8.0 |
|   |  |  |  |  |
|  gcc | 1.930 |  |  | 0.305 | 5.4.0 |
|  clang | 1.899 |  |  | 0.320 | 3.8.0 |

> 纯C语言的使用`clock()`计时，精确至毫秒

> 上述数据均为5次测试的平均值

那么，一直以来，我们的认知都是：由于`cin`需要与标准C的输入输出同步，导致`cin`是很慢的。

所以，如果没有同步的需求，可以使用`std::ios::sync_with_stdio(false)`来关闭这一功能以提高读入速度，并且实践中也证明了，
直接使用`cin`是会导致TLE，而使用`scanf`读入或者关闭同比的cin是不会导致TLE的。

那这个运行结果该如何解释呢，是编译器的不断升级导致这一结果呢，还是有什么其他的玄学原因。

一般而言，有巨量的输入的同时会有巨量的输出，那么，是不是输出占据了大量的时间呢

那么我又写了个测试程序，由于输出100万个数字在cin下将耗费超过1000s的时间，故这次输出的量仅10万，从1000000到2000000，每20个数换一行。

但是结果更加魔法了

Windows(Windows10 10586)

|   | cout | cout_n | cout_n_nosync | printf | version |
|  ------ | ------ | ------ | ------ | ------ | ------ |
|  g++ | 127.195885 | 124.950397 | 13.686781 | 327.350871 | 6.1.0 |
|  vs | 348.546706 | 416.36035 | 470.464951 | 91.497273 | 19.00.24210 |
|  gcc |  |  |  | 71.04 | 6.1.0 |
|  clang |  |  |  | 65.373 | 3.8.1 |

Linux(ubuntu 16.04)

|   | cout | cout_n | cout_n_nosync | printf | version |
|  ------ | ------ | ------ | ------ | ------ | ------ |
|  g++ | 4.324911 | 4.489047 | 1.158994 | 4.52257 | 5.4.0 |
|  clang++ | 4.589349 | 4.509717 | 4.897229 | 4.675189 | 3.8.0 |
|  gcc |  |  |  | 0.314794(*) | 5.4.0 |
|  clang |  |  |  | 0.283959(*) | 3.8.0 |

> 加*的运行时间明显小于目视时间，故作标注

还是难以理解的魔法结果，于是就在学校OJ上试了下，不出意料，依旧很魔法。

本机运行仅需1.8s的scanf在时限10s的OJ上竟然TLE了(83s)，cin均以50ms通过，fread在gcc与g++下分别以306ms和413ms通过。

以上的各种测试很明显的说明了，在当前测试环境，纯输入或纯输出，都是cin/cout占优。

------

那么一直以来使得cin/cout背负恶名的就不应该是其读入或输出的速度了，而是某些其他的东西。

首先可以想到，是否是输入与输出均在程序运行是发生会造成cin/cout奇慢的原因。

由于本地运行这些挺麻烦的，在OJ上新造了个题来测试，输入数据为:

```cpp
const int MAXN = 1000000;
void case01()
{
    int index = 1;
    for(int i = MAXN; i <= 2*MAXN; ++i)
    {
        printf("%d ", i);
        if(index != 1 && index % 20 == 0)
            printf("\n");
        ++index;
    }
}
```

输出为原样输出

首先测试的是先将数据全部读入数组后进行输出，也即

```cpp
read();
print();
```

然后是边读入边输出，（按常理这应该更快，只有一个for循环），即：

```cpp
void read_print()
{
    int index = 1;
    for(int i = 0; i < MAXN; ++i)
    {
        std::cin >> numbers[i];
        cout << numbers[i] << " ";
        if(index != 1 && index % 20 == 0)
            cout << endl;
        ++index;
    }
}
```

测试结果如下：

| 单位均为ms | print after read | print with read |
|  ------ | ------ | ------ |
|  scanf + printf | 316 | 353 |
|  scanf + cout | 2824 | 351 |
|  scanf + cout_n | 325 | 355 |
|   |  |  |
|  cin + cout | 2819 | 44660 |
|  cin + cout_n  | 533 | 33407 |
|  cin + printf | 315 | 31883 |
|  cin_no + cout | 2559 | 32191 |
|  cin_no + cout_n | 288 | 48395 |
|  cin_no + printf | 277 | 293 |
|   |  |  |
|  cin + cout + tie | 2786 | 781 |
|  cin + cout_n + tie | 531 | 370 |
|  cin + printf + tie | 517 | 1920 |
|  cin_no + cout + tie | 5272 | 196 |
|  cin_no + cout_n + tie | 222 | 240 |
|  cin_no + printf + tie | 273 | 286 |

> 由于以上数据均为一次运行的结果，有部分数据存在不合理的情况，请无视

> g++版本为4.8.2

这回的测试中边读边写的结果就差不多能和网上普遍的说法吻合了。

关于`std::ios_base::sync_with_stdio()`和`std::cin.tie()`的解释我就不去细述了，详见[爆栈](http://stackoverflow.com/questions/31162367/significance-of-ios-basesync-with-stdiofalse-cin-tienull)。

虽然还是有些跳脱的测试数据，反正就先这样了。

可以得出一个草率的结论，使用关闭同步与连接并且不使用`endl`的`cin/cout`是最快的方案。

反正都是<span class="heimu">玄学</span>，怎么样都行啦。


> TODO: 不同编译器版本没测试