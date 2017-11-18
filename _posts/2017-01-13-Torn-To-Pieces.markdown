---
layout:     post
title:      "Torn To Pieces"
subtitle:   "2015 ICPC North American Qualifier Contest"
date:       2017-01-13
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

所谓恶意，不过如此……

<!--more-->

今天做到的这个题目，真的是恶意满满，可以观望见出题人丑恶的嘴脸（雾

先上题目链接: [Torn To Pieces – Kattis](https://open.kattis.com/problems/torn2pieces)

大致的题意呢，就是：你有一叠撕成碎片的地图，*很巧*，每张碎片上只有一个站点，并且标明了这个站点能够到达的其他站点，
最后给你一个起点站和终点站，问你有没有一条路径能够从起点站到终点站，如果有，则输出该路径。

题目看完，好家伙，带路径的最短路嘛，就是给定的节点都是字符串有点麻烦。这时候，有两个解决方法：

1. 将站名映射成一个id
2. 直接map套map搞起

我选择的是直接map套map，瞬间口头AC。

写起来发现并不比映射id方便，因为容器里`int`的默认值是0，而使用`Dijkstra`所期望的是`inf`。

嘛，当然都不是不能解决的，在我样例都通过了之后，交了一把，TLE了。

一开始没找到数据，用`throw`大法测试了一下，在某个样例输出路径的时候死循环了，这就很迷了，
最短路径长度都求出来了，怎么会打不出路径呢。

不信邪，死循环的时候直接输出`no route found`，就AC了…… 就AC了…… 就AC了……

难以想象什么数据能出最短路却打不出路径，找来数据一看：

```
3
A B
B A C
C B
G H
```

哇，何等的阴险，起点和终点根本没有在上面给定的信息里……

可以一定要说的话，题目也算是隐含了这个意思：`If there are not enough pieces of the map to find a route from the starting station to the destination station then output “no route found”.`

然后也正因为`map`中默认的`int`值为`0`，当映射从`1`开始的话，就会无意识地避开这个坑……

```cpp
#include <algorithm>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
#include <stack>
#include <map>
#include <set>
using namespace std;

std::vector<std::string> split(const std::string &s, char delim) {
    std::vector<std::string> elems;
    std::stringstream ss; ss.str(s); std::string item;
    while (std::getline(ss, item, delim)) elems.push_back(item);
    return elems;
}

const int inf = 1000000000;
set<string> values;

void Dijkstra(map<string, map<string, int> > &w,
              map<string, string> &prev,
              map<string, int> &dist,
              string start) {
    map<string, bool> found;
    prev.clear(); dist.clear();
    dist[start] = 0;
    while (start != "") {
        found[start] = true;
        string best = "";
        for (string k: values) if (!found[k]) {
            if (dist.find(k) == dist.end()) dist[k] = inf;
            if (w.find(start) == w.end()) w[start][k] = inf;
            else if (w[start].find(k) == w[start].end()) w[start][k] = inf;
                
            if (dist[k] > dist[start] + w[start][k]) {
                dist[k] = dist[start] + w[start][k];
                prev[k] = start;
            }
            if (best == "" || dist[k] < dist[best])
                best = k;
        }
        start = best;
    }
}

int main() {
    map<string, map<string, int> > w;
    int n; string line;
    cin >> n;
    getline(cin, line);
    for (int i = 0; i < n; ++i) {
        getline(cin, line);
        vector<string> nodes = split(line, ' ');
        values.insert(nodes[0]);
        for (size_t i = 1; i < nodes.size(); ++i) {
            w[nodes[0]][nodes[i]] = 1;
            w[nodes[i]][nodes[0]] = 1;
            values.insert(nodes[i]);
        }
    }
    string start, end;
    cin >> start >> end;
    map<string, string> prev;
    map<string, int> dist;
    Dijkstra(w, prev, dist, start);
    if (dist[end] == inf ||
        values.find(start) == values.end() ||
        values.find(end) == values.end()) {
        cout << "no route found\n";
        return 0;
    }

    vector<string> ans;
    bool tle = false;
    while (end != start) {
        ans.push_back(end);
        end = prev[end];
    }
    ans.push_back(start);
    for(int i = (int)ans.size() - 1; i >= 0; --i) {
        if (i == 0) cout << ans[i];
        else cout << ans[i] << " ";
    }
    cout << endl;
    return 0;
}
```

[所有数据](/attach/torn2pieces.7z)
