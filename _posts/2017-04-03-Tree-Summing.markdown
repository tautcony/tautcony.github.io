---
layout:     post
title:      "Tree Summing"
subtitle:   "OpenJ_Bailian - 1145"
date:       2017-04-03
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

这个题目其实是一个非常基础的LISP抽象语法树的构建，在这里占一篇文章的位置是为了提醒我一点：题目没说只有正数，怎么就把负数当不存在了呢。

<!--more-->

正经描述[题目](http://bailian.openjudge.cn/practice/1145)：

给定如下的[S-expression](https://en.wikipedia.org/wiki/S-expression)形式的树的定义：

```
empty tree ::= ()
tree       ::= empty tree (integer tree tree)
```

然后根据输入的数据`T`构建树并寻找树上是否存在一条从树根到叶子节点的，和为`I`的通路。

由于题目给定的输入中并不保证一棵树在一行就输入完成，所以增加了`depth`来确保树已经确实进行了构建完成可以进行下一个的输入的处理。

输入的判断写好之后就是树的构建了，其实也就几句话：

1. 若为左括号，`++depth`，往`num`数组中增加一个新的`string`用以接受该节点的值，创建一个新的节点并挂到当前节点下，然后将新建的节点设置为当前节点。
2. 若为右括号，`--depth`，从`num`数组中取出尾部的`string`设置为当前结点的值，弹出该`string`，并回退到当前节点的父节点。
3. 若为数字的组成部分，则加到`num`数组的尾部`string`中。
4. 除此以外的都是非必须字符，全部跳过。

唔，`toNumber`乱用了点模板，其实自己`for`一个更快。哎呀，这个`stringstream`虽然好用但是着实是慢啊。

如果在读到左括号就把存在的节点的值给赋值进去的话，应该能做到在构建树的时候维护每一条路的和，那样的话就在构建完之后就能得知答案而不需要再进行一边dfs了，写起来有点麻烦，没写（逃

```cpp
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

using namespace std;

const int inf = 0x3f3f3f3f;

struct node
{
    int v;
    node *l, *r, *p;
    int cnt;
    node(): v(0), l(nullptr), r(nullptr), p(nullptr), cnt(0) {}

    explicit node(node *pa) : v(0), l(nullptr), r(nullptr), cnt(0)
    {
        p = pa;
    }

    node *add(node *n)
    {
        ++cnt;
        if (cnt == 1) l = n;
        else if (cnt == 2) r = n;
        return n;
    }

    ~node()
    {
        delete l;
        delete r;
    }

    string toString() const
    {
        if (v == -inf) return "()";
        stringstream stream; stream << v;
        string val; stream >> val;
        return "(" + val +
            (l == nullptr ? string("()") : l->toString()) +
            (r == nullptr ? string("()") : r->toString()) + ")";
    }
};

template<typename OutType, OutType defaultValue = 0>
OutType toNumber(const string &s)
{
    if (s.size() == 0) return defaultValue;
    OutType ret;
    stringstream stream(s); stream >> ret;
    return ret;
}

int sum;
bool dfs(node * curr, int currSum = 0)
{
    if (curr == nullptr) return false;
    if (curr->l == nullptr && curr->r == nullptr) return currSum + curr->v == sum;
    return dfs(curr->l, currSum + curr->v) || dfs(curr->r, currSum + curr->v);
}

int main()
{
    while (cin >> sum)
    {
        char c; int depth = 0;
        node *curr = new node();
        vector<string> num;
        while (cin >> c)
        {
            switch (c)
            {
            case '(':
            {
                ++depth;
                num.push_back(string());
                node *tmp = new node(curr);
                curr->add(tmp);
                curr = tmp;
            }
            break;
            case ')':
                --depth;
                curr->v = toNumber<int, -inf>(num.back());
                num.pop_back();
                curr = curr->p;
                if (curr->cnt == 2)
                {
                    if (curr->l->v == -inf)
                    {
                        delete curr->l;
                        curr->l = nullptr;
                    }
                    if (curr->r->v == -inf)
                    {
                        delete curr->r;
                        curr->r = nullptr;
                    }
                }
            break;
            case '-':
            case '1': case '2': case '3': case '4': case '5':
            case '6': case '7': case '8': case '9': case '0':
                num.back() += c;
            break;
            default: break;
            }
            if (depth == 0)
            {
                node *root = curr->l;
                cerr << sum << " " << root->toString() << endl;
                cout << (root->v != -inf && dfs(root) ? "yes" : "no") << endl;
                delete curr;
                break;
            }
        }
    }
}
```

看完了这个辣鸡代码，不考虑来试着实现一个完整一点的LISP吧？

[90 分钟实现一门编程语言——极简解释器教程](http://zh.lucida.me/blog/how-to-implement-an-interpreter-in-csharp/)