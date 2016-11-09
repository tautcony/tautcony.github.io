---
title: ACM-ICPC Asia Hong Kong Regional
layout: post
date: '2016-11-09'
author: TautCony
header-img: img/post-bg-default.png
image:
  credit: himawari-8
  creditlink: http://himawari8.nict.go.jp/
tags:
- '编程 '
- ACM
---

垃圾如我，好不容易去了资本主义地区<ruby>比赛<rt>观光</rt></ruby>。却依然脑子不灵光，抄歪模板，特判特判再特判，使得唯一有点机会的首A奖都完全没戏了。

<!--more-->

但是回过来说，还好没爆零出局，那样就太尴尬了……

背完锅写正文(其实并不是)，刚刚搜`__gcd`在哪个头文件里搜着搜着看到了一些有趣的技巧，在这记录一下。

-----

### 负数下标

有的时候，我们会遇到数组下标需要是负数的情况。一般地，我们可以通过使用`arr[i+offset]`来使得实际下标为正。

如果不是很考虑效率的话，`map<int, int>`也是个不错的选择。

但是，这里其实有个更好的办法：就是用一个新的指针指到数组的中间去。

```cpp
int main()
{
    const int MAX = 1000;
    int __arr[2*MAX + 1];

    // [-MAX, MAX]
    int *arr = __arr + MAX;

    arr[-1] = 3;
    printf("%d\n", arr[-1]);
    return 0;
}
```

-----

### 全局`long long`

还有很多时候，我们为int所困、所坑，恨不得直接将所有的`int`变成`long long`。

一般地，`#define int long long`并不能奏效，因为C++规定了`main`函数必须为`int`类型的。

其实呢，我们都知道，`unsigned int`是无符号32位整数，那么`signed int`就是带符号32位整数，而另一方面`signed int`其实就是个`int`，并且，它可以缩写成`signed`。

那么，一个将所有`int`变成`long long`的方法就出现了。

```cpp
#define int long long
signed main()
{
    int sum = 0;
    for(int i = 0; i < 1000000; i++)
    {
        sum += i;
    }
    cout << sum << endl;
}
```

然后再也不会因为`int`而溢出了（然后`long long`有的时候速度会慢的
