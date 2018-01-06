---
layout:     post
title:      "代码查重系统MOSS与SIM小测"
subtitle:   "理论无限美，实践菜如鸡"
date:       2018-01-06
author:     "TautCony"
header-img: null
image:
  credit: GeoPattern
  creditlink: https://github.com/btmills/geopattern
tags:
    - 编程
---

由于和毕设有些关系，于是找了两个常见的代码查重系统测试了下。

<!--more-->

最早是在HUSTOJ的介绍里得知该OJ用[SIM](https://dickgrune.com/Programs/similarity_tester/)作为查重工具。还是词法级别的，唬住了当时什么都不懂的我，也没有去试着去测测这个相似性的边界到底在哪里，只是想着这么高级，肯定什么改变量名，改先后顺序，插入无效代码什么的都是无效的。并且在实践中确实挺不错的样子。

另一个比较有名的应该是[MOSS](http://theory.stanford.edu/~aiken/moss/)，你看人家助教真的是[赞赏有加](https://www.zhihu.com/question/53401092/answer/134860661)，还是斯坦福大学出品，网页的标题都写着`Plagiarism Detection`了，而且还是有正经[论文](http://theory.stanford.edu/~aiken/publications/papers/sigmod03.pdf)作为理论支撑的，无数加成之下，想必也是一个极为厉害的一个系统。

起先，我是准备直接相信`SIM`给出的相似度作为前提的，结果到底有多相似这一念头在心中始终萦绕，老师建议我先看一下`SIM`的实现，不建议我什么都想着从头开始自己搞。

在一番操作搞好`Makefile`使得源代码能够正常编译之后，看着自带的test结果给着也挺合理的，就去看源代码了。非常头疼的是，这个作者倒真的是什么都是自己实现的，给我的阅读带来了一定的困扰。可是细细一读，这玩意不对劲啊，用`flex`解析出`Token`流存到数组里面之后，就开始`LCA`了……，其他大多数的代码都是在提供各式各样的比较选项，并不会对结果造成多大的影响。

可这样岂不是很不妙，在光鲜的表面下并没有什么神奇的实现，那结果可以想象也不会神奇到哪里去了，于是着手构造样例测试，随便写了个从控制台读取n个数字并求和的简单程序作为`被抄袭`的样本，并逐步修改一点点。

> sample1.c

```c
#include <stdio.h>

int main()
{
    int n;
    scanf("%d", &n);
    int ans = 0;
    for(int i = 1; i <= n; ++i)
    {
        int b;
        scanf("%d", &b);
        ans += b;
    }
    printf("%d\n", ans);
    return 0;
}
```

> sample2.c(将`ans`更名为`c`)

```c
#include <stdio.h>

int main()
{
    int n;
    scanf("%d", &n);
    int c = 0;
    for(int i = 1; i <= n; ++i)
    {
        int b;
        scanf("%d", &b);
        c += b;
    }
    printf("%d\n", c);
    return 0;
}
```

> sample3.c(将`c`的声明与`n`合并)

```c
#include <stdio.h>

int main()
{
    int n, c = 0;
    scanf("%d", &n);

    for(int i = 1; i <= n; ++i)
    {
        int b;
        scanf("%d", &b);
        c += b;
    }
    printf("%d\n", c);
    return 0;
}
```

> sample4.c(将`c`的初始化赋值放回到与`sample1.c`相同的位置)

```c
#include <stdio.h>

int main()
{
    int n, c;
    scanf("%d", &n);
    c = 0;
    for(int i = 1; i <= n; ++i)
    {
        int b;
        scanf("%d", &b);
        c += b;
    }
    printf("%d\n", c);
    return 0;
}
```

> sample5.c(将`+=`运算符拆成`=`和`+`)

```c
#include <stdio.h>

int main()
{
    int n, c;
    scanf("%d", &n);
    c = 0;
    for(int i = 1; i <= n; ++i)
    {
        int b;
        scanf("%d", &b);
        c = c + b;
    }
    printf("%d\n", c);
    return 0;
}
```

> sample6.c(全部变量重新命名)

```c
#include <stdio.h>

int main()
{
    int a, b;
    scanf("%d", &a);
    b = 0;
    for(int c = 1; c <= a; ++c)
    {
        int d;
        scanf("%d", &d);
        b = b + d;
    }
    printf("%d\n", b);
    return 0;
}
```

> SIM(Version: 2.89 Options: "-p")的结果

|      File 1     |      File 2     |   Percentage  |
| --------------- | --------------- | ------------- |
|    sample1.c    |    sample2.c    |  100% / 100%  |
|    sample1.c    |    sample3.c    |   67% /  67%  |
|    sample1.c    |    sample4.c    |   73% /  71%  |
|    sample1.c    |    sample5.c    |   48% /  46%  |
|    sample1.c    |    sample6.c    |   48% /  46%  |
| --------------- | --------------- | ------------- |
|    sample2.c    |    sample3.c    |   67% /  67%  |
|    sample2.c    |    sample4.c    |   73% /  71%  |
|    sample2.c    |    sample5.c    |   48% /  46%  |
|    sample2.c    |    sample6.c    |   48% /  46%  |
| --------------- | --------------- | ------------- |
|    sample3.c    |    sample4.c    |   67% /  66%  |
|    sample3.c    |    sample5.c    |   42% /  41%  |
|    sample3.c    |    sample6.c    |   42% /  41%  |
| --------------- | --------------- | ------------- |
|    sample4.c    |    sample5.c    |   75% /  74%  |
|    sample4.c    |    sample6.c    |   75% /  41%  |
| --------------- | --------------- | ------------- |
|    sample5.c    |    sample6.c    |  100% /  100% |

`SIM`比较的选项相当多，但对结果数量级上并没有影响。

> MOSS(Options: "-l c -m 10")的结果

|      File 1     |      File 2     | Lines Matched |
| --------------- | --------------- | ------------- |
| sample1.c (97%) | sample2.c (97%) | 13            |
| sample1.c (62%) | sample3.c (62%) |  8            |
| sample1.c (62%) | sample4.c (60%) |  8            |
| --------------- | --------------- | ------------- |
| sample2.c (62%) | sample3.c (62%) |  8            |
| sample2.c (62%) | sample4.c (60%) |  8            |
| --------------- | --------------- | ------------- |
| sample3.c (62%) | sample4.c (60%) |  8            |
| --------------- | --------------- | ------------- |
| sample4.c (75%) | sample6.c (73%) | 10            |
| sample4.c (75%) | sample5.c (73%) | 10            |
| --------------- | --------------- | ------------- |
| sample5.c (95%) | sample6.c (95%) | 13            |

这里`MOSS`的表格少了几项，是因为在MOSS看来，剩下的几组被判定为`No matches were found in your submission.`

稍微对比一下就可以发现，两个系统给出的值都相当接近，想必而它们两者背后的实现也差不到哪里去。`SIM`判定相似度在50%以下的代码组，`MOSS`的评判标准下差不对就是直接当作完全摆除抄袭嫌疑的了。

那么情况就很糟糕了，我想作为任何一个一个会写点代码的人而言，这六个代码文件可以说是一模一样。而在我的曾经美好的预想里，这些应该都能被打出相当高的相似度。

但是这两个久经沙场的系统都给出了相近的结果，真的是很意外，在我看来，这更不拦不住想要抄袭的人，随随便便改一改名字，插几句话，连整体结构都不用变，就能逃过该系统的监察了。

或许这就是所谓的一开始预期调得越高，到出结果就越失望么？

当然，有[知乎大神](https://www.zhihu.com/question/53401092/answer/134840794)似乎相当完美地解决了我现在所提出的问题，然而并没有开源，是吧。

另外还有个看起来非常有前途的[论文](https://www.cs.utexas.edu/~bbeth/files/AComparisonOfSimilarityTechniquesForDetectingSourceCodePlagiarism.pdf)，提供了`AST`、`CFG`、`IR`层级上的相似度比较，看起来与知乎上的那个思路相近，但是，也没有看到哪里有可用的实现，而实现这个，作为硕士论文也不为过吧，像我这种连编译原理都没学过的人，现时应该是没可能做到了的。
