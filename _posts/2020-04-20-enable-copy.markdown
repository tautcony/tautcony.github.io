---
layout:     post
title:      "如何解除各种网站的复制限制"
subtitle:   "浏览器页面功能限制与反限制的斗争 - 续"
date:       2020-04-20
author:     "TautCony"
header-img: null
image:
  credit: GeoPattern
  creditlink: https://github.com/btmills/geopattern
tags:
    - 前端
    - Javascript
    - 复制限制
    - 知乎
catalog: true
---

如何实现一个全面彻底的解除复制限制的用户脚本呢？

<!--more-->

## 引子

这篇[浏览器页面功能限制与反限制的斗争](https://www.cnblogs.com/xp-Fei/p/4455214.html)是我所看到的较为全面地处理了网页防复制地逻辑的一篇博文。

但在文末给出了一个加强版的复制限制，如何将这么一个强力复制限制给想办法排除掉呢？毕竟道高一尺魔高一丈，终究会到只有禁用Javascript脚本才能复制的一步。

以知乎为例，其复制事件的函数的定义位于`main.question-routes.js`，进行了简单的整理，见下面的代码片段：

```js
{
    key: "handleCopy",
    value: function(event) {
        const data = this.props.data;
        const url = ""; // 当前回答或文章的地址
        switch (data.reshipmentSettings) {
            case "disallowed":
                this.showTip(event, _("a", { href: "https://www.zhihu.com/terms#sec-licence-6" }, "禁止转载"));
                break;
            case "need_payment":
                if (!data.relationship.isAuthorized) {
                    this.showTip(event, _("a", { href: "https://www.zhihu.com/copyright/apply?answer=".concat(data.id) }, "申请转载"));
                    break
                }
                this.showTip(event, "已获授权，复制成功");
            default:
                this.addCopyright(event, url, data.author.name)
        }
    }
}
```

但是，知乎的前端页面的事件都是有被[`Raven.js`](https://www.npmjs.com/package/raven-js)的[`wrap`](https://raven-js.readthedocs.io/en/stable/usage.html#context-wrap)函数包过的，所以实际应去除的事件函数应该是它。当然，一个同样难以获取的函数对象。


## 为什么不行

W3C所规定的[DOM标准](https://en.wikipedia.org/wiki/Document_Object_Model#Standards)，当前共有4个版本，在DOM0与DOM3中有与本文相关的内容。

#### DOM

DOM0标准中的事件，即内联事件`<div onclick='handler'></div>`，，它不能能有多个事件，可以通过简单的`target.onevent=null`来使之无效化。

DOM2标准中新增的方法，在[EventTarget](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener)中提供了以下几个接口：

- addEventListener(type, listener)
- removeEventListener(type, listener)
- ~~dispatchEvent~~

不相关的划掉，向一个DOM增加或去除一个事件监听需要指定监听的事件类型和对应的监听函数，新增没有任何疑问，当然要给监听函数啦，而移除的话，是由于任何一个事件都能被多个监听函数分别处理，那么需要指定要去除的函数才能与新增事件监听形成闭环。

那么问题来了，现代的前端应用往往是不会倾向于污染全局域、webpack的盛行。就算应用本身有移除监听函数的打算，将它存了下来也是不会向外暴露的。那么作为一段外部脚本显然无法获取到这一函数，或者直接使用了匿名函数（即上文提到的加强版），那么更加不可能能拿到函数对象了。

经过搜索，曾经在[DOM3](https://www.w3.org/TR/2001/WD-DOM-Level-3-Events-20010823/events.html#Events-EventTarget)的标准草稿中引入了`eventListeners`，但是[最终](https://stackoverflow.com/questions/7810534)还是作罢了。

#### jQuery

jQuery注册的事件即`$(target).on(event, handler)`，就算是`$(target).on(event, (ev) => { console.log(ev) })`这样的监听，都是能使用`$(target).off('click')`来移除的，没有什么大的阻碍。jQuery有在增加监听时对该监听函数进行了记录。


## 怎么让它行

使用与jQuery相似的逻辑，可以通过劫持原生的`addEventListener`来附加额外的逻辑进行记录，以备后期使用，[geteventlisteners](https://www.npmjs.com/package/geteventlisteners)就是这样的一个实现。

但它也有一个很显然的限制：`In order to be able to track all the listeners, this module must be imported before any event listener is declared.`，虽然我记得tampermonkey能够执行用户脚本执行的时机，可`@run-at document-start`的描述是：`The script will be injected as fast as possible.`，实际测试上它并不安定，无法保证能获取到全部的事件函数。

另外一侧，Chrome在控制台中有提供[geteventlisteners](https://developers.google.com/web/tools/chrome-devtools/console/utilities#geteventlisteners)，既然是浏览器提供的，自然能保证所有的事件都被记录，只有唯一一个限制就是这个接口必须在开发者面板下才能使用。

Firefox上检索了一下，它只在检查DOM的接口中提供了监听事件的查看与移除，这一个与Chrome相似，但没有提供API使用。

这样一来，在Chrome，打开开发者工具面板的前提下，就有机会实现一个全功能的解除复制限制。分门别类的移除对应的事件即可，使用本文最初引用的博文中的代码作为基础，大致实现如下：

```js
function copyEnabler(curr_window) {
    const eventArr = ['contextmenu', 'dragstart', 'mouseup', 'mousedown', 'mousemove', 'copy', 'cut', 'beforecopy', 'selectstart', 'select', 'keydown'];
    function runScript(curr_window) {
        let _jq_ = curr_window.jQuery || curr_window.$j;
        if (typeof _jq_ !== "undefined" && _jq_.toString().includes("[Command Line API]")) {
            _jq_ = undefined;
        }
        if (typeof _jq_ === "undefined") {
            console.warn("No jQuery found");
        }
        const unbind = function (ele) {
            let listeners = {};
            if (typeof getEventListeners === "function") {
                listeners = getEventListeners(ele);
                /* if (Object.keys(listeners).length > 0) console.log(listeners); */
            }
            for (const evt of eventArr) {
                ele['on' + evt] = null;
                if (_jq_) {
                    const jq_ele = _jq_(ele);
                    if (jq_ele.off) jq_ele.off(evt); else if (jq_ele.unbind) jq_ele.unbind(evt);
                }
                if (ele.style && ele.style.userSelect === 'none') ele.style.userSelect = 'text';
                if (listeners[evt]) {
                    for (const handler of listeners[evt]) {
                        ele.removeEventListener(evt, handler.listener, handler.useCapture);
                    }
                }
                try {
                    if (/frame/i.test(ele.tagName)) {
                        if (ele.src.startsWith(curr_window.location.origin)) {
                            runScript(ele.contentWindow);    
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        };
        [curr_window, curr_window.document].forEach(unbind);
        Array.from(curr_window.document.all).filter(ele => ele.nodeType === Node.ELEMENT_NODE).forEach(unbind);
        (function utanet() { 
            const img = document.querySelector('#flash_area>img');
            if (img.style) img.style.display = 'none';
        )();
    }
    runScript(curr_window);
}

copyEnabler(window);
```

## 还有什么不行

现在反爬技术层出不穷，各种canvas、自定义字体等形式的方法，那种就是另一种思路了，本文并不涉及这一部分。
