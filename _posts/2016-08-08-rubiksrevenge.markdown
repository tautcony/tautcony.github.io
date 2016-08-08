---
layout:     post
title:      "Rubik’s Revenge in ... 2D!? 3D?"
subtitle:   "2015 Rocky Mountain Regional Contest G"
date:       2016-08-08
author:     "TautCony"
header-img: "img/post-bg-default.png"
image:
  credit: himawari-8
  creditlink: http://himawari8.nict.go.jp/
tags:
    - 编程
    - C++
    - ACM
---

久违的补题（雾

<!--more-->

先看题目：

<iframe src="/js/pdfjs/web/viewer.html?file=/attach/rubiksrevenge/G-rubiksrevenge.pdf" frameborder="0" width="100%" height="500"></iframe>

大意就是有一个类似于二维的魔方，可以上下左右转，转出边界的会出现在对立的那一边。

然后输入给你一个局面，问最少需要操作几次能将它恢复为`RGBY`这样的行顺序，并且告诉你，保证所有情况都会在13步以下得到结果。

[这里](https://open.kattis.com/problems/rubiksrevenge)大概能交题。

----------

最朴素的姿势就是暴力bfs搜索嘛，稍微估计一下复杂度，每一次操作有四个方向、四个位置可选，最多12步，那就是$$16^{12} = 281474976710656 \approx 2.815*10^8s$$，直接爆炸，E5都救不了这方法。

然后大佬指出了这个应该使用双向bfs，两遍各搜一半，在中间交接就好了。于是我们再估计一下复杂度，$$2*16^6 = 33554432 \approx 33s$$，这个应该就是题目时限的由来了

由于只有四种颜色，可以使用2个bit来表示一个颜色从而将整个局面存储到一个`unsigned int`里面，从而便于局面的比较与存储。

但是这个位操作我并不是很熟练，于是先花了好久写了一大坨位操作的函数才开始正式写的题，一开始还脑抽得写成了dfs……

再接着，花了好久写好了bfs，运行时却离奇地慢，单单正向的$$16^6$$就已经超过时限了，想着是不是哪里写挫了，看了老半天，确实改出了点东西，比如：正向bfs时只需要和终态进行比较，没必要往个map里存个终态让正向bfs反复去访问，全是时间啊，访问不存在值`map`会建立新的键值对的哇。

改到自己感觉天衣无缝了，运行时间依然是不能更慢，对于case02的`BYYYYBBBGRRRRGGG >> 12`需要接近3分半才能出结果，这我就不能接受了啊，哪来这么高的时间复杂度啊。

祭出VS的性能探查器跑了一把，惊了，说好的`unordered map` $$\mathcal{O}(1)$$的插入、查询呢，你家$$\mathcal{O}(1)$$操作能占$$63\%$$的时间啊。

![unordered map with debuge mode](/img/in-post/rubiksrevenge/diagsession_debug.png)

突然想到Debug下编译器0优化，还插了一大堆私货，赶紧切换成Release又运行了一遍，结果……

它只花了4秒啊……

这还给不给人活路啊，之前也有考虑到是不是这个原因，但是想着这能差多少啊，总不会有特别大的差距吧……

![unordered map with debuge mode](/img/in-post/rubiksrevenge/diagsession_debug.png)

但是感觉这个耗时还是很不科学，说好的$$\mathcal{O}(1)$$超过半数时间还是在这个`unordered_map`上，太魔法了。

```cpp
#include <unordered_map>
#include <iostream>
#include <string>
#include <vector>
#include <queue>
#include <map>

using namespace std;

class Bit
{
public:
    static inline unsigned int GetMask(int width, bool fill)
    {
        return fill ? _masks[width] : ~_masks[width];
    }

    static inline unsigned int SetBit(unsigned int value, int position)
    {
        value |= (1 << (position % 32));
        return value;
    }

    static inline unsigned int ClearBit(unsigned int value, int postion)
    {
        value &= ~(1 << (postion % 32));
        return value;
    }

    static inline unsigned int ToggleBit(unsigned int value, int postion)
    {
        value ^= (1 << (postion % 32));
        return value;
    }

    static inline bool CheckBit(unsigned int value, int position)
    {
        return (value >> (position % 32)) & 1;
    }

    static inline unsigned int GetBits(unsigned int value, int position, int width)
    {
        unsigned int mask = GetMask(width, true);
        return (value >> (position % 32)) & mask;
    }

    static inline unsigned int ClearBits(unsigned int value, int position, int width)
    {
        unsigned int mask = ~(GetMask(width, true) << position);
        return value & mask;
    }

    static inline unsigned int SetBits(unsigned int value, int position, unsigned int unit, int width)
    {
        return ClearBits(value, position, width) | (unit << position);
    }

    static inline unsigned int ToggleBits(unsigned int value, int position, int width)
    {
        unsigned int mask = (GetMask(width, true) << position);
        return value ^ mask;
    }

private:
    static unsigned int _masks[];
};

unsigned int Bit::_masks[] = { 0x0000000u,
       0x0000001u, 0x0000003u, 0x0000007u, 0x0000000fu, 0x0000001fu, 0x0000003fu, 0x0000007fu, 0x000000ffu,
       0x00001ffu, 0x00003ffu, 0x00007ffu, 0x00000fffu, 0x00001fffu, 0x00003fffu, 0x00007fffu, 0x0000ffffu,
       0x001ffffu, 0x003ffffu, 0x007ffffu, 0x000fffffu, 0x001fffffu, 0x003fffffu, 0x007fffffu, 0x00ffffffu,
       0x1ffffffu, 0x3ffffffu, 0x7ffffffu, 0x0fffffffu, 0x1fffffffu, 0x3fffffffu, 0x7fffffffu, 0xffffffffu };

unsigned int GetInit(string line)
{
    unsigned int ret = 0;
    for (size_t i = 0; i < line.length(); i++)
    {
        switch (line[i])
        {
        case 'G': ret = Bit::SetBits(ret, i * 2, 0x1, 2); break;
        case 'B': ret = Bit::SetBits(ret, i * 2, 0x2, 2); break;
        case 'Y': ret = Bit::SetBits(ret, i * 2, 0x3, 2); break;
        default: break;
        }
    }
    return ret;
}

inline unsigned int UP(unsigned int value, int position)
{
    unsigned int temp = Bit::GetBits(value, position * 2, 2);
    value = Bit::SetBits(value,      position * 2, Bit::GetBits(value,  8 + position * 2, 2), 2);
    value = Bit::SetBits(value,  8 + position * 2, Bit::GetBits(value, 16 + position * 2, 2), 2);
    value = Bit::SetBits(value, 16 + position * 2, Bit::GetBits(value, 24 + position * 2, 2), 2);
    value = Bit::SetBits(value, 24 + position * 2, temp, 2);
    return value;
}

inline unsigned int DO(unsigned int value, int position)
{
    unsigned int temp = Bit::GetBits(value, position * 2, 2);
    value = Bit::SetBits(value,      position * 2, Bit::GetBits(value, 24 + position * 2, 2), 2);
    value = Bit::SetBits(value, 24 + position * 2, Bit::GetBits(value, 16 + position * 2, 2), 2);
    value = Bit::SetBits(value, 16 + position * 2, Bit::GetBits(value,  8 + position * 2, 2), 2);
    value = Bit::SetBits(value,  8 + position * 2, temp, 2);
    return value;
}

inline unsigned int LE(unsigned int value, int position)
{
    unsigned int mask = Bit::GetMask(8, true);
    unsigned int temp = Bit::GetBits(value, 8 * position, 8);
    unsigned int twob = Bit::GetBits(temp, 6, 2);
    temp = ((temp << 2) | twob) & mask;
    value = Bit::SetBits(value, 8 * position, temp, 8);
    return value;
}

inline unsigned int RI(unsigned int value, int position)
{
    unsigned int mask = Bit::GetMask(8, true);
    unsigned int temp = Bit::GetBits(value, 8 * position, 8);
    unsigned int twob = Bit::GetBits(temp, 0, 2);
    temp = ((temp >> 2) | twob << 6) & mask;
    value = Bit::SetBits(value, 8 * position, temp, 8);
    return value;
}

unordered_map<unsigned int, int> Forward;

unsigned int (*operations[])(unsigned int, int) = { UP, DO, LE, RI };

int bfs_F(unsigned int state)
{
    queue<unsigned int> que;
    que.push(state);
    que.push(0xffffffffu);
    int depth = 2;
    while (depth <= 7)
    {
        unsigned int curr = que.front(); que.pop();
        while (curr != 0xffffffffu)
        {
            for (int i = 0; i < 4; ++i)
            {
                for (int j = 0; j < 4; ++j)
                {
                    unsigned int temp = operations[i](curr, j);
                    if (temp == 0xffaa5500) return depth;
                    if (Forward.find(temp) == Forward.end())
                        Forward[temp] = depth;
                    que.push(temp);
                }
            }
            curr = que.front(); que.pop();
        }
        que.push(0xffffffffu);
        if (depth == 7) break;
        ++depth;
    }
    return 23333;
}

int bfs_R(unsigned int state)
{
    queue<unsigned int> que;
    que.push(state);
    que.push(0xffffffffu);
    int depth = 2;
    while (depth <= 7)
    {
        unsigned int curr = que.front(); que.pop();
        while (curr != 0xffffffffu)
        {
            for (int i = 0; i < 4; ++i)
            {
                for (int j = 0; j < 4; ++j)
                {
                    unsigned int temp = operations[i](curr, j);
                    if (Forward[temp] != 0)
                    {
                        return Forward[temp] + depth;
                    }
                    que.push(temp);
                }
            }
            curr = que.front(); que.pop();
        }
        que.push(0xffffffffu);
        if (depth == 7) break;
        ++depth;
    }
    return 23333;
}

int main()
{
    ios::sync_with_stdio(false);
    string line, temp;
    for (int i = 0; i < 4; ++i)
    {
        cin >> temp;
        line += temp;
    }
    unsigned int init = GetInit(line);
    unsigned int fina = GetInit("RRRRGGGGBBBBYYYY");
    if (init == fina)
    {
        cout << 0 << endl;
        return 0;
    }
    int answer = bfs_F(init);
    if (answer != 23333)
    {
        cout << answer - 1 << endl;
        return 0;
    }
    answer = bfs_R(fina);
    cout << answer - 2 << endl;
    return 0;
}
```

虽然说是过了并且每个case的时间远小于时限，但是运行所有样例还是花了超过30s。

----------

悄咪咪看了下大佬的代码……，只有4.4s，膜一下。

```cpp
//max/sum runtime: 1.10/4.44s
#include <iostream>
#include <string>
#include <algorithm>
#include <unordered_map>
#include <queue>

using namespace std;

typedef unsigned int uint;

struct State
{
  // represent the colours as a 2-bit value, list them in row major order.
  // all together 32 bit
  uint rep;
  
  void read()
  {
    const string colours = "RGBY";
    char c;

    rep = 0;
    for (int i = 0; i < 16; i++) {
      cin >> c;
      rep <<= 2;
      rep += colours.find(c);
    }
  }

  void write()
  {
    const string colours = "RGBY";

    for (int i = 0; i < 16; i++) {
      cout << colours[(rep >> (15-i)*2) & 0x3];
      if (i % 4 == 3) cout << endl;
    }
  }

  void goal()
  {
    rep = 0;
    for (int i = 0; i < 4; i++) {
      for (int j = 0; j < 4; j++) {
        rep <<= 2;
        rep += i;
      }
    }
  }

  void rotate_r(int row, int dir)
  {
    int shift = (3-row)*8;
    uint r = (rep >> shift) & 0xFF;
    if (dir > 0) {
      r = (r >> 2) | ((r & 3) << 6);
    } else {
      r = ((r << 2) & 0xFF) | (r >> 6);
    }
    rep = (~(0xFF << shift) & rep) | (r << shift);
  }

  void rotate_c(int col, int dir)
  {
    if (dir > 0) {
      int shift = (3-col)*2;
      uint temp = (rep >> shift) & 0x3;
      for (int r = 3; r >= 0; r--) {
        int d_shift = (3-r)*8 + shift;
        uint from = (r > 0) ? ((rep >> (d_shift + 8)) & 0x3) : temp;
        rep = (~(0x3 << d_shift) & rep) | (from << d_shift);
      }
    } else {
      int shift = (3-col)*2 + 24;
      uint temp = (rep >> shift) & 0x3;
      for (int r = 0; r < 4; r++) {
        int d_shift = shift - r*8;
        uint from = (r < 3) ? ((rep >> (d_shift - 8)) & 0x3) : temp;
        rep = (~(0x3 << d_shift) & rep) | (from << d_shift);
      }
    }
  }

  bool operator==(const State &s) const
  {
    return rep == s.rep;
  }

  bool operator<(const State &s) const
  {
    return rep < s.rep;
  }
};

namespace std {
  template<> struct hash<State> {
    size_t operator()(const State &s) const {
      return s.rep;
    }
  };
}

bool expand(State s, int curr_d, queue<State> &q,
            unordered_map<State, int> &dist,
            unordered_map<State, int> &dist2)
{
  for (int i = 0; i < 4; i++) {
    for (int d = 0; d < 2; d++) {
      State next = s;
      next.rotate_r(i, d);

      if (dist.find(next) == dist.end()) {
        dist[next] = curr_d+1;
        q.push(next);
        if (dist2.find(next) != dist2.end()) {
          cout << curr_d+1+dist2[next] << endl;
          return false;
        }
      }

      next = s;
      next.rotate_c(i, d);

      if (dist.find(next) == dist.end()) {
        dist[next] = curr_d+1;
        q.push(next);
        if (dist2.find(next) != dist2.end()) {
          cout << curr_d+1+dist2[next] << endl;
          return false;
        }
      }
    }
  }

  return true;
}

void solve()
{
  State start, goal;

  start.read();
  goal.goal();

  if (start == goal) {
    cout << 0 << endl;
    return;
  }
  
  unordered_map<State, int> dist_f, dist_b;
  queue<State> q_f, q_b;
  int d_f, d_b;
  
  q_f.push(start);   dist_f[start] = 0;
  q_b.push(goal);    dist_b[goal] = 0;
  d_f = d_b = 0;

  while (!q_f.empty() || !q_b.empty()) {

    // let's move forward by 1 step
    while (!q_f.empty() && dist_f[q_f.front()] == d_f) {
      State s = q_f.front();  q_f.pop();
      if (!expand(s, d_f, q_f, dist_f, dist_b)) {
        return;
      }
    }
    d_f++;

    // let's move backward by 1 step
    while (!q_b.empty() && dist_b[q_b.front()] == d_b) {
      State s = q_b.front();  q_b.pop();
      if (!expand(s, d_b, q_b, dist_b, dist_f)) {
        return;
      }
    }
    d_b++;
  }
}

int main()
{
  // int N;
  // cin >> N;
  // while (N--)
    solve();

  return 0;
}
```

根据dalao的代码稍稍改了下， 把`Forward[temp] != 0` 改成 `Forward.find(temp) != Forward.end()`，又稍稍减了一点点。dalao把两个方向的搜索放到了一起，而我写的时候似乎感觉不是很妥，就分两段搜了。现在想想似乎可以啊。
