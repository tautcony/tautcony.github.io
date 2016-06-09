---
layout:     post
title:      "Dice Notation [ZOJ 3930]"
subtitle:   ""
date:       2016-04-10
author:     "TautCony"
header-img: "img/post-bg-default.png"
tags:
    - 编程
    - ACM
    - C++
---

题目虽然老长老长一大段(应该很大一段都是从[Wiki](https://en.wikipedia.org/wiki/Dice_notation)复制来的)，其实都没多大用，大意就是给你一串形如`((2d6)     +5)*((12*       3d6))`的字符串，字符串中$$NdX$$的部分, $$N$$是指骰子次数，$$X$$指骰子面数，这样的式子需要展开为$$\underbrace{([dX] + … + [dX])}_{N}$$的形式, 同时，只有在`+-*/`的左右有且仅有一个空格。最后在结尾加上` = [Result]`，这么就结束了。

相当有意思，这题[Dice Notation](http://acm.zju.edu.cn/onlinejudge/showProblem.do?problemCode=3930)大概是在最后15分钟左右A出来的, 坑其实不算多, 应该就是以下三点：

- ` "NdX". N and X are variables, separated by the letter "d", which stands for dice. N is the number of dice to be rolled (usually omitted if 1),`

第一点：~~这个N很大，`long long`也存不下，需要使用大数，虽然只需用到累加计数功能。~~ 想来应该是不可能的，或许是我`int` `string`互转写错了？但是没看出什么问题呀。

```cpp
string ToString(long long num)
{
    string res = "";
    while (num != 0) {
        res = ((char)(num % 10 + '0')) + res;
        num /= 10;
    }
    return res;
}

...

numberBeforeDice = numberBeforeDice * 10 + ch - '0';

```

- ` if a game would call for a roll of "d4" or "1d4", this would mean roll a 4-sided dice.`

第二点：当`N==1`或`N`不存在即默认值的时候输出的dice不该套括号。

- `No extra whitespaces characters (including "Tab" and "Space") are allowed in the format string.`

第三点：输入的字符串存在`\t`， 嘛，其实我这种写法其实是可以忽略的，没在`switch`中列出的字符全部略过就行。


```cpp
#include "iostream"
#include "string"
using namespace std;

class Number
{
public:
    string number;
    Number(){}
    Number(string num)//输入的string需包含前导零
    {
        number = num;
    }
    Number& operator++()
    {
        size_t length = number.size();
        for (int i = length - 1; i >= 0; --i)
        {
            number[i] = ((number[i] - '0') + 1) % 10 + '0';
            if (number[i] != '0') break;
        }
        return *this;
    }
    /*以下为非必需代码*/
    bool operator ==(const string &rhs)
    {
        return number == rhs;
    }
    bool operator !=(const string &rhs)
    {
        return !(*this == rhs);
    }
    bool operator !=(const Number &rhs)
    {
        return number != rhs.number;
    }
    void Reset()
    {
        number = "";
    }
    size_t length()
    {
        return number.size();
    }
};

void append(bool &dice, string &answer, Number &numberBeforeDice, string &numberAfterDice)
{
    if (dice)
    {
        string block = "[d" + numberAfterDice + "]";
        if (numberBeforeDice == "" || numberBeforeDice == "1")//一个骰子特判
        {
            answer += block;
        }
        else//否则两边套括号对骰子进行分解
        {
            answer += "(";
            //由于最后一个骰子输出后无" + ", 计数从1开始
            Number i = Number(string(numberBeforeDice.length() - 1, '0') + "1");
            while (i != numberBeforeDice)
            {
                ++i;
                answer += block;
                answer += " + ";
            }
            answer += block;
            answer += ")";
        }
        dice = false;
        numberAfterDice = "";
        numberBeforeDice.Reset();
    }
    else if(numberBeforeDice != "")//无骰子，可能是纯数字
    {
        answer += numberBeforeDice.number;
        numberBeforeDice.Reset();
    }
}


int main()
{
    int T; cin >> T;getchar();
    while(T--)
    {
        string line;
        string answer = "";
        bool dice = false;
        Number numberBeforeDice;
        string numberAfterDice = "";

        getline(cin, line);
        for (size_t i = 0; i < line.size(); i++)
        {
            char ch = line[i];
            switch (ch) {
                case '(':
                case ')':
                    append(dice, answer, numberBeforeDice, numberAfterDice);
                    answer.push_back(ch);
                    break;
                case ' ':
                case '\t':
                    break;
                case '+':
                case '-':
                case '*':
                case '/':
                    append(dice, answer, numberBeforeDice, numberAfterDice);
                    answer.push_back(' ');
                    answer.push_back(ch);
                    answer.push_back(' ');
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    if (dice)//若已经遇到'd',则接下来的数字为骰子的面数
                    {
                        numberAfterDice.push_back(ch);
                    }
                    else//不然为系数或纯数字
                    {
                        numberBeforeDice.number.push_back(ch);
                    }
                    break;
                case 'd':
                    dice = true;
                    break;
                default:
                   throw;
            }
        }
        //可能输入结尾也是一个骰子, 但后面无'+-*/()'，未触发输出
        append(dice, answer, numberBeforeDice, numberAfterDice);
        cout << answer << " = [Result]" << endl;
    }
    return 0;
}
```

我特么悔的是[I](http://acm.zju.edu.cn/onlinejudge/showProblem.do?problemId=5695)题啊，特么给队友讲题意的时候特么漏掉了`leap`哦！！！神特么WA了7次！！！于是毫无悬念的排在了同题数的最后一位……
