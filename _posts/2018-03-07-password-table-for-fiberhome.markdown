---
layout:     post
title:      "烽火光猫密码表"
subtitle:   ""
date:       2018-03-07
author:     "TautCony"
header-img: "img/post-bg-default.png"
image:
  credit: himawari-8
  creditlink: http://himawari8.nict.go.jp/
tags:
    - 
---

家里换了一个光猫, 型号是烽火HG2821T-U，还上市公司呢，贵司程序员水平可真的是低。

<!--more-->

一般的，电信提供的`useradmin`权限极少，很多功能都需要`telecomadmin`才能进行进一步的操作。

而很显然的，并没有这个的密码，打10000号一般也能要到，但电信隔一段时间就会改，TR069完全关掉也不大好（？）。

以上各种有的没的还是不赘述了。如果没有改过的话，可以在[这里](http://192.168.1.1:8080/cgi-bin/baseinfoSet.cgi)获得`telecomadmin`密码的密文，形如`"101&102&103&98&99&100&"`，稍加脑洞，可以想象到这应该就是ASCII码，如果直接转换过来，是`"efgbcd"`，尝试登陆可以发现并不对，但看着还是挺合理的，可能是存在某种映射。

暴力可能挺费劲的，但贵司员工非常贴心的提供了`useradmin`的密码的密文，而它的明文显然是知道的，稍微改几遍密码测试以下就能获得密文和明文之间映射关系。

其关系为大小写字符分别循环向后平移4位，也即分别把`WXYZ`和`wxyz`分别移到`ABCD`和`abcd`的前面，其余不变。

既然知道了映射关系，就能写出一个解码程序了，如下：

<input id="ciphertext" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
<button onclick="gao()">gao</button>

用`js`随便写的，具体代码请`Ctrl+U`。

<script type>
const ciphertext = document.getElementById("ciphertext");

ciphertext.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        event.preventDefault();
        gao();
    }
});

function gao() {
    let text = "";
    const length = 26;
    const blocks = [97, 65];
    let shift = 30;
    for (let c of ciphertext.value.split("\u0026")) {
        c = Number.parseInt(c);
        if (Number.isNaN(c)) {
            continue;
        }
        let success = false;
        for (let block of blocks) {
            if (c >= block) {
                success = true;
                c = (c - shift) - block;
                while (c < 0) {
                    c += length;
                }
                c = c % length + block;
            }
            if (success) {
                break;
            }
        }
        text += String.fromCharCode(c);
    }
    ciphertext.value = text;
}
</script>

