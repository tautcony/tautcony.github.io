---
layout:     post
title:      "gdb简易操作指南"
subtitle:   "其实是给自己做个备忘"
date:       2016-07-09
author:     "TautCony"
header-img: "img/post-bg-default.png"
image:
  credit: himawari-8
  creditlink: http://himawari8.nict.go.jp/
tags:
    - 编程
---

Windows上用VS, Linux 上用qt creator, 编程、调试，似乎没有什么不妥。

但如果某个电脑上没有顺手的IDE怎么办，难不成就靠打log完成调试，考虑到多一门技巧多一门路，于是对gdb的使用进行了简单的学习。

<!--more-->

<a href="https://en.wikipedia.org/wiki/Archerfish" target="_blank" >
<img style="float:right; cursor: pointer;" src="/img/in-post/gdb-tutorial/archer.png" alt="GDB's Mascot" />
</a>

应该，绝大多数IDE本质上就是在调用gdb达到调试的效果的

首先要做的自然是编译，需要注意的是，编译参数中需要加入 `-g` 使编译器一并生成所需的调试信息，如 `g++ -std=c++11 -Wall -g -O0 a.cc -o a.out`。编译完成后就可以执行gdb进行调试了。

通过命令 `gdb a.out` or <ruby><rb>`gdb -tui a.out`</rb><rp>(</rp><rt class="heimu">非常洋气的图形界面</rt><rp>)</rp></ruby> 启动gdb

> Windows下MinGW的gdb并没有-tui这个选项 (喂，为什么想不开不用VS)

![gdb](/img/in-post/gdb-tutorial/gdb1.png)

使用`list [line|function]`命令显示代码，若指定函数名或行号，则从指定位置开始显示

使用 `break [line|function] [if condition]` 设定断点或条件断点

使用 `tbreak` 设定一次性断点

使用 `disp [var]` 在程序中断时显示变量内容，此时其输出前所带的序号在

使用 `undisplay [variable number]` 来解除显示

使用 `print var` 来显示当前指定变量的内容

使用 `print var = new value` 或 `set variable var = new value` 来变更变量值（功能比较有限，比如变更整个字符串、更改map中的某个键值对，都是做不到的）

使用 `info [cmd]` 来显示各种指令设置的内容，

使用 `run` 来启动或重启程序，显然，若没有下断点则会一直执行下去

当击中断点，可使用 `next` 和 `step` 来执行下一行或下一条语句（会跟进函数）

使用 `continue` 来继续执行程序

使用 `disable/enable [breakpoint number]` 来关闭或打开断点而不是删除它

使用 `clear [line|function]` 来删除断点

使用 `call foo()` 来直接调用其中某个函数

使用 `quit` 来退出 gdb

> 以上的指令很多都能只打首字母来执行，并且回车为执行上一次的命令

由于这样近乎盲操的debug自我感觉不是很好用，于是还是来用tui版吧，此时它会把控制台的上半部分分割为代码显示区，于是代码内容为何，运行到何出，该于第几行打断点都比较容易处理了

![gdb-tui](/img/in-post/gdb-tutorial/gdb2.png)

虽然不及VS的好用，但是总比devC++那类顺手（
