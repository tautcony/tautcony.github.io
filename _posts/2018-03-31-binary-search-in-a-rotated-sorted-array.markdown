---
layout:     post
title:      "平移后的有序数组上的二分查找实现"
subtitle:   "If I don't practice one day, I know it; two days, the critics know it; three days, the public knows it."
date:       2018-03-31
author:     "TautCony"
header-img: null
image:
  credit: GeoPattern
  creditlink: https://github.com/btmills/geopattern
tags:
    - 编程
---

永远怀念我的第一次面试。

<!--more-->

以`[12, 13, 16, 18, 1, 3, 5, 6, 8, 10, 11]`这个数组为例，可以发现能从一个有序数组向右循环平移4格得到。

那么问题就是如何在这样一个不完全有序的数组上完成二分查找。

大体有两种方向：
1. [能不能找到平移长度](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/description/)，然后取个余就能当普通二分写了。
2. [能不能直接搞二分](https://leetcode.com/problems/search-in-rotated-sorted-array/description/)。

都是很简单的题目，要么是做过的，要么是leetcode原题，我却一时想不到解法，事后花个5分钟就写出来的东西，却因为紧张而错失机会。

首先找到平移长度，剩下的稍微处理一下就行了，理论复杂度O(Log(n)*Log(n))，也算低于O(n)了。

```cpp
int find(vector<int> &arr, int target)
{
    int l = 0;
    int r = arr.size() - 1;
    while (arr[l] > arr[r])
    {
        int mid = (l + r) / 2;
        if (arr[mid] > arr[r])
            l = mid + 1;
        else
            r = mid;
    }
    int len = arr.size();
    r = arr.size() - 1 + l;
    while (l < r)
    {
        int mid = (l + r) / 2;
        if (arr[mid % len] == target)
            return mid % len;
        if (arr[mid % len] < target)
            l = mid + 1;
        else
            r = mid;
    }
    if (arr[l] == target)
        return l;
    return -1;
}
```

另一种其实就是要充分利用数组的左/右端点能提供的信息，多了两种情况。

```cpp
int find(const std::vector<int> &arr, int target)
{
    int l = 0, r = arr.size() - 1;
    while (l < r)
    {
        int mid = (l + r) / 2;
        if (arr[mid] == target)
            return mid;
        if (arr[mid] > arr[l])
        {
            if (target > arr[mid])
                l = mid+1;
            else
                r = mid;
        }
        else
        {
            if (target > arr[mid])
                r = mid;
            else
                l = mid + 1;
        }
    }
    if (arr[l] == target)
        return l;
    return -1;
}
```
