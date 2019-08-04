---
layout:     post
title:      "供NexusPHP上传种子使用的高速咏唱魔法"
subtitle:   ""
date:       2019-08-02
author:     "TautCony"
header-img: "img/post-bg-default.png"
image:
  credit: himawari-8
  creditlink: http://himawari8.nict.go.jp/
tags:
    - PT
    - 重构
    - 编程
    - PHP
---


[`NexusPHP`](https://github.com/ZJUT/NexusPHP)作为一个非常经典的PT程序，虽然受到众多站点使用，但其存在的问题也是同它的使用者一样繁多，本文所记载的仅是解决其中一个问题的高速咏唱魔法。


<!--more-->


# 主观分析


作为PT站点，最不可或缺的，那就是种子了。对于默认的`NexusPHP`程序而言，如果有一个文件数量上万时，就会发现其上传种子的操作往往会以超时告终，上传若通过手动于后台上传修改记录来进行绕行的话，依然会发现其下载动作时也可能面临同样的窘境。


打开[`benc.php`](https://github.com/ZJUT/NexusPHP/blob/master/include/benc.php#L53)观察`bdec`函数和其相关的函数可以发现，其所有的解析结果的值，都是以形如以下的结构来存储的：

```json
{
    "type": "string",
    "value": "bencode",
    "strlen": 9,
    "string": "7:bencode"
}
```

出于PHP是一个只有数组的语言，额外记一个元素类型并没有什么不妥，可后两个看着就很神秘，好啰嗦的样子，接下来仔细看看。由于在种子中，其最外层必然是一个`dictionary`，此处就以`bdec_dict`为入口来尝试分析其运行效率低下的缘由。

```php
function bdec_dict($s) {
    if ($s[0] != "d")
        return;
    $sl = strlen($s);
    $i = 1;
    $v = array();
    $ss = "d";
    for (;;) {
        if ($i >= $sl)
            return;
        if ($s[$i] == "e")
            break;
        $ret = bdec(substr($s, $i));
        if (!isset($ret) || !is_array($ret) || $ret["type"] != "string")
            return;
        $k = $ret["value"];
        $i += $ret["strlen"];
        $ss .= $ret["string"];
        if ($i >= $sl)
            return;
        $ret = bdec(substr($s, $i));
        if (!isset($ret) || !is_array($ret))
            return;
        $v[$k] = $ret;
        $i += $ret["strlen"];
        $ss .= $ret["string"];
    }
    $ss .= "e";
    return array('type' => "dictionary", 'value' => $v, 'strlen' => strlen($ss), 'string' => $ss);
}
```


可以看到，其传入的参数应为一个独立的`dictionary`类型的`bencode`编码的字符串，其他函数也类似，故在做其解码的时候需要将待解码的元素截取子串再递归调用函数来解码，这显然将增大其解码的开销。


此外关注变量`$ss`的相关操作，可以发现其的处理动作非常诡异，在一个解码函数中，对**解码**出结果进行了**重新编码**。通过检索，其目的是在解码`list`, `dictionary`获得其子项的长度，从而正确解析下一个元素。但是这样的思路可以说是非常诡异了，明明解析过程中是可以通过累加获取长度信息的，而作者却通过重新编码元素再计算重新编码后的元素的长度，绕了一大圈才最终达到目的，相当不明智。


另一个可能存在的问题点就是对没必要的地方也无脑使用正则？但应该问题不是特别大。


# 客观分析


以上仅是通过粗略的code review找到的很可能拖累执行效率的问题点，但实际上为什么慢，当然要祭出`Profiler`啦。


但是由于我**其实**并不会`PHP`，电脑上也没有相关的调试环境，还是鸽了吧，由主观判断来指导重构工作吧（笑


# 解决方案


分析完那就到如何解决的环节了，并不想在屎堆上雕花，还是重新写一个比较省事，由于想要尽可能减少其他地方的改动，所以目标是写一个能够生成相同格式结果的`bdec`函数。


虽然`bencode`的规则十分十分简洁，但是还是随便找了一份看着实现得比较优雅的[代码](https://github.com/OPSnet/bencode-torrent/blob/master/src/Bencode.php)参考了一下。


主要的思路就是根据上面分析内容，避免不必要的字符串操作，并且移除无效的字段存储。


```php
/**
 * Bencode decoder for NexusPHP by TautCony(https://github.com/tautcony)
 * Reference from https://github.com/OPSnet/bencode-torrent
 *
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 *
 * @param string $data
 * @param int $pos
 * @return mixed
 */
function bdec($data, &$pos = 0) {
    $is_root = $pos === 0;
    $type = $data[$pos];
    $ret = array();
    switch ($type) {
        case "d": // dict
            ++$pos;
            $dict = array();
            while ($data[$pos] !== "e") {
                $key = bdec($data, $pos);
                $value = bdec($data, $pos);
                if ($key === null || $value === null) {
                    break;
                }
                if ($key["type"] !== "string") {
                    throw new RuntimeException("Invalid key type, must be string: " . $key["type"]);
                }
                $dict[$key["value"]] = $value;
            }
            ++$pos;
            // ksort($dict);
            $ret["type"] = "dictionary";
            $ret["value"] = $dict;
            break;
        case "l": // list
            ++$pos;
            $list = array();
            while($data[$pos] !== "e") {
                $value = bdec($data, $pos);
                $list[] = $value;
            }
            ++$pos;
            $ret["type"] = "list";
            $ret["value"] = $list;
            break;
        case "i": // integer
            ++$pos;
            $digits = strpos($data, "e", $pos) - $pos;
            if ($digits < 0) {
                throw new RuntimeException("Could not fully decode integer value");
            }
            $integer = substr($data, $pos, $digits);
            if ($integer === "-0") {
                throw new RuntimeException("Cannot have integer value -0");
            }
            if (preg_match("/^-?\d+$/", $integer) === 0) {
                throw new RuntimeException("Cannot have non-digit values in integer number: " . $integer);
            }
            $pos += $digits + 1;
            $ret["type"] = "integer";
            $ret["value"] = (int) $integer;
            break;
        default: // string
            $digits = strpos($data, ":", $pos) - $pos;
            if ($digits < 0) {
                throw new RuntimeException("Could not fully decode string value's length");
            }
            $len = (int) substr($data, $pos, $digits);
            $pos += $digits + 1; // $digits + len(":")
            if (strlen($data) < $pos + $len) {
                throw new RuntimeException("Could not fully decode string value");
            }
            $ret["type"] = "string";
            $ret["value"] = substr($data, $pos, $len);
            $pos += $len;
            break;
    }
    if ($is_root && $pos !== strlen($data)) {
        throw new RuntimeException("Could not fully decode bencode string");
    }
    return $ret;
}
```


PHP5.6下对类型标注非常不友好，所参考的代码中的`function decode(string $data, int &$pos = 0)`会花式报错。


经过简单测试，只需[^errata-1]要简单替换[`benc.php`](https://github.com/ZJUT/NexusPHP/blob/master/include/benc.php#L53)处的`bdec`函数即可引入该高速咏唱魔法，将原本可能需要数分钟的种子内容解析缩短到不到一秒，而整体的上传动作也能在个位数的时间内完成。


根据某不愿意透露姓名的废铝提供的日志，单位为秒，此处的结果使用了`file_get_contents`来读取文件并使用SQL批量插入降低数据库操作时间。总的而言，本高速咏唱魔法实际应用效果喜人，未见明显不良反应。


```
0 开始
0 开始处理
1 读文件结束
2 开始反复横跳
4 反复横跳结束
4 开始处理数据库
6 数据库结束
8 开始写log
8 结束
```

# 勘误

[^errata-1]:
    然而并不是，在[`takeupload.php`](https://github.com/ZJUT/NexusPHP/blob/master/takeupload.php#L200)文件中还是存在了唯一一个使用了`string`字段的地方，所以还需要将`$info["string"]`替换为`benc($info)`
