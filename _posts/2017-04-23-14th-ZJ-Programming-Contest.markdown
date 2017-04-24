---
layout:     post
title:      "Seven Segment Display [ZOJ 3962]"
subtitle:   "兼总结"
date:       2017-04-24
author:     "TautCony"
header-img: "img/post-bg-default.png"
image:
  credit: himawari-8
  creditlink: http://himawari8.nict.go.jp/
tags:
    - 编程
    - ACM
    - C++
---

从去年勉强拿到一个铜牌，到今年的勉强拿到一个金牌，对于我而言，究竟有多少长进呢。

<!--more-->

一直以来我并不认为我曾拥有什么惊人的编程的天赋，最多是说比很多人好一些罢了。

放到程序竞赛里更是如此，愈是了解，愈是意识到自己的水平之低劣。

动态规划之类的算法我掌握得可以说非常非常蹩脚，博弈论数论这种就属于看到直接跳掉的程度。搞了这么久，还是只会套套板子，写写模拟题之类的。

说起来，这回的省赛我只给这题提供了一些辅助，写了个暴力的版本来对拍debug以外，剩下的就只有给H题提供了一个会TLE的思路了，感觉完全是队友给力才拿到的金牌。

虽然这个题场上是队友写的，但是当时反复讨论，解题思路还是非常清晰的，也想着自己写个看看。另外网上对于该题的题解，放眼望去全是数位dp，这个风气很不好啊，什么东西都往dp上搞（雾

明明可以模拟过去的（大雾

----

本题模拟的思路就是考虑每一位对于答案的贡献。显然当数字很大时，中间会出现很多的循环显示，那么只要把中间循环的大头解决掉的话，剩下的就是结尾那些各位不足一个循环的部分了，这里只要想清楚每个数字是在什么情况下变更就不容易写错了。

更多的解释详见代码注释，我想应该解释得足够清楚了。

```cpp
#include <algorithm>
#include <iostream>
#include <string>
#include <cmath>

using namespace std;

inline int todec(char c)
{
    return c >= 'A' ? c - 'A' + 10 : c - '0';
}

inline long long todec(string hex)
{
    if (hex.size() == 0) return 0;
    long long ret = 0;
    for(auto iter = hex.begin(); iter != hex.end(); ++iter)
    {
        ret = ret * 16 + todec(*iter);
    }
    return ret;
}
int energy[] = {
    6,2,5,5,4,5,6,3,7,6,6,5,4,5,5,4,
    6,2,5,5,4,5,6,3,7,6,6,5,4,5,5,4
};

const int energy_per_round = 78;
const int digit_count = 16;
const long double one = 1.0;

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T; cin >> T;
    while (T--)
    {
        int n; string s;
        cin >> n >> s;
        long long dur_per_digit = 1;
        long long ans = 0;
        for(int i = 7; i >= 0; --i)
        {
            //计算整段循环的
            long long dur_per_loop = dur_per_digit * digit_count;
            long long loop_cnt = n / dur_per_loop;
            long long loop_energy_consume = loop_cnt * energy_per_round * dur_per_digit;
            ans += loop_energy_consume;

            //计算剩余不足一循环的部分
            //其中第一个值的持续时长为全F与其右边的子串的差 或 剩余时间
            //剩下的除最后一个均为dur_per_digit
            ///处理首个值
            int curr = todec(s[i]);
            //该位右边的子串距离进位所需时间
            long long delta = todec(string(7 - i, 'F')) - todec(s.substr(i + 1)) + 1;
            long long rest_time = n - loop_cnt * dur_per_loop;
            delta = min(rest_time, delta);//判断次数是否满足进位
            ans += energy[curr++] * delta;
            rest_time -= delta;//更新剩余时间
            if (rest_time == 0)
            {
                dur_per_digit *= digit_count;
                continue;//即只有一个值
            }
            //若rest_cnt为0则剩下的时间都是最后一个的
            long long rest_cnt = ceil(rest_time*one / dur_per_digit);//剩余的字符数
            long long last_time;
            if (rest_cnt == 0) last_time = rest_time;
            else last_time = rest_time - (rest_cnt - 1)*dur_per_digit;

            ///处理中间值
            for(long long j = 0; j < rest_cnt - 1; ++j)
            {
                ans += energy[curr++] * dur_per_digit;
            }

            ///处理最后一个值
            ans += energy[curr] * last_time;
            dur_per_digit *= digit_count;
        }
        cout << ans << "\n";
    }
}
```
