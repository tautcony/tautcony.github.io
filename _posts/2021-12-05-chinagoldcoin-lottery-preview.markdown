---
layout:     post
title:      "金币云商抽签结果预览"
subtitle:   ""
date:       2021-12-05
author:     "TautCony"
header-img: "img/post-bg-default.png"
image:
  credit: himawari-8
  creditlink: http://himawari8.nict.go.jp/
tags:
    - 
---

全款抽签，只换不退，车门焊死，不准跳车。

<!--more-->

最近在金币云商参与的抽签次次都不中，不中也就算了，开奖还不及时，连死都不让人死得痛快点，于是就尝试一下提前开奖。

由于其抽签规则为公开提供且具体的初始化参数也为公开数值，完全可以在其截止报名后不久就能确认本次抽签是否中签。

规则如下简单明了，但是至少也得用上Excel拉拉公式，不然手算挺费事的。

注：A：基数；B：翻转数；X：报名次数；Y：种子号，即起始中签号；Z：阶数；

1. `A`=(抽签日的上一个工作日的深圳证券交易所深证成指"今收"指数×100)×(抽签日的上一个工作日的深证券交易所中小100指数"今收"指数×100)×10000；
 - 注：可登录深圳证券交易所网站历史指数行情查询，详见下文附录。A为整数，不能有小数位。
2. `B`=将基数`A`对应的数字倒序排列（如首位是0，则直接抹去)
3. `Y`=`B`/`X`后所得的余数加1；
4. `Z`=`X`/`中签数量`取整数（去掉小数点后的整数）；
5. 最终全部中签的报名号，如下：
- 第一个中签号=`Y`；
- 第二个中签号=`Y`+`Z`；
- 第三个中签号=`Y`+`Z`×2；
- 第`N`个中签=`Y`+`Z`×(`N`-1)；
- 如果第`N`个中签号码>`总报名次数`，那么第`N`个中签号码=`Y`+`Z`×(`N`-1)-`总报名次数`。

下图默认参数为金币云商提供的测试数据，样例都过了，直接进行一个提交。

-----

深证指数：<input id="SZSE_input" value="962249" style="width: 100px" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
<br>
中小指数：<input id="SZSE100_input" value="601323" style="width: 100px" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
<br>
从<input id="X_input" value="38674" style="width: 80px" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">位报名用户中
<button onclick="try{gao()}catch{alert('输入不合法')}">给我抽</button>
<input id="TARGET_input" value="1500" style="width: 50px" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">位，而你的号码
<input id="TICKET_input" value="8144" style="width: 50px" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
<span id="lottery_result">中了么？</span>
<br>

<pre id="lottery_list"></pre>


<script>
function gao() {
    const SZSE = BigInt(document.getElementById('SZSE_input').value.replace(/\./g, ''));
    const SZSE100 = BigInt(document.getElementById('SZSE100_input').value.replace(/\./g, ''));
    const X = BigInt(document.getElementById('X_input').value);
    const TARGET = BigInt(document.getElementById('TARGET_input').value);

    const A = SZSE * SZSE100 * 10000n;
    const B = BigInt(String(A).split('').reverse().join(''));
    const Y = B % X + 1n;
    const Z = X / TARGET;

    const ret = [];
    for (let N = 1n; N <= TARGET; N++) {
        let num = Y + Z * (N - 1n);
        if (num > X) {
            num = Y + Z * (N - 1n) - X;
        }
        ret.push(num);
    }

    const TICKET = BigInt(document.getElementById('TICKET_input').value);
    if (TICKET && ret.includes(TICKET)) {
        document.getElementById('lottery_result').innerText = '中了。';
    } else {
        document.getElementById('lottery_result').innerText = '没中。';
    }

    const list = new VirtualList({
        // w: 300,
        h: 300,
        itemHeight: 31,
        totalRows: ret.length,
        generatorFn: function(row) {
            const el = document.createElement("div");
            const value = ret[row];
            if (value === TICKET) {
                el.style.backgroundColor = '#ff0';
            }
            el.innerHTML = `${value}为第${row+1}位`;
            el.style.width = "100%";
            return el;
        }
    });

    document.getElementById("lottery_list").innerHTML = "";
    document.getElementById("lottery_list").appendChild(list.container);

}

class VirtualList {
    constructor(config) {
        const width = (config && config.w + "px") || "100%";
        const height = (this.height = (config && config.h + "px") || "100%");
        const itemHeight = (this.itemHeight = config.itemHeight);

        this.items = config.items;
        this.generatorFn = config.generatorFn;
        this.totalRows = config.totalRows || (config.items && config.items.length);

        const totalHeight = itemHeight * this.totalRows;
        this.scroller = VirtualList.createScroller(totalHeight);
        this.container = VirtualList.createContainer(width, height);

        const screenItemsLen = Math.ceil(config.h / itemHeight);
        // Cache 4 times the number of items that fit in the container viewport
        const cachedItemsLen = screenItemsLen * 3;
        this._renderChunk(this.container, 0, cachedItemsLen / 2);

        const self = this;
        let lastRepaintY;
        const maxBuffer = screenItemsLen * itemHeight;

        function onScroll(e) {
            const scrollTop = e.target.scrollTop;
            let first = parseInt(scrollTop / itemHeight) - screenItemsLen;
            first = first < 0 ? 0 : first;
            if (!lastRepaintY || Math.abs(scrollTop - lastRepaintY) > maxBuffer) {
                self._renderChunk(self.container, first, cachedItemsLen);
                lastRepaintY = scrollTop;
            }

            e.preventDefault && e.preventDefault();
        }

        this.container.addEventListener("scroll", onScroll);
    }
    _renderChunk(node, fromPos, howMany) {
        const fragment = document.createDocumentFragment();
        fragment.appendChild(this.scroller);

        const finalItem = fromPos + howMany;
        if (finalItem > this.totalRows)
            finalItem = this.totalRows;

        for (let i = fromPos; i < finalItem; i++) {
            let item;
            if (this.generatorFn)
                item = this.generatorFn(i);
            else {
                if (typeof this.items[i] === "string") {
                    const itemText = document.createTextNode(this.items[i]);
                    item = document.createElement("div");
                    item.style.height = this.height;
                    item.appendChild(itemText);
                } else {
                    item = this.items[i];
                }
            }

            item.classList.add("vrow");
            item.style.position = "absolute";
            item.style.top = i * this.itemHeight + "px";
            fragment.appendChild(item);
        }

        node.innerHTML = "";
        node.appendChild(fragment);
    }
    static createContainer(w, h) {
        const c = document.createElement("div");
        c.style.width = w;
        c.style.height = h;
        c.style.overflow = "auto";
        c.style.position = "relative";
        c.style.padding = 0;
        // c.style.border = "1px solid black";
        return c;
    }
    static createScroller(h) {
        const scroller = document.createElement("div");
        scroller.style.opacity = 0;
        scroller.style.position = "absolute";
        scroller.style.top = 0;
        scroller.style.left = 0;
        scroller.style.width = "1px";
        scroller.style.height = h + "px";
        return scroller;
    }
}

</script>
