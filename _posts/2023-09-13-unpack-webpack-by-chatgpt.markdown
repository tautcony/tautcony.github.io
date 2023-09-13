---
layout:     post
title:      "ChatGPT辅助的webpack解包反压缩实践"
subtitle:   "以明日方舟官网为例"
date:       2023-09-13
author:     "TautCony"
header-img: "img/post-bg-unpack-webpack-by-chatgpt.jpg"
image:
  credit: hypergryph
  creditlink: https://ak.hypergryph.com/
tags:
    - 逆向
    - 编程
    - 前端
    - JavaScript
---

什么时候能把几M的代码直接喂给ChatGPT老师呢？

<!--more-->

首先打包得很彻底，包括依赖的库在内的代码统统打包到[单一文件](https://github.com/tautcony/arknights-particle/blob/master/original/index.dea9fd98.js)内了。

简单尝试之后，显然没有`sourcemap`文件能投机。再使用市面上各类debundle工具，几乎都运行不起来，那么只能自己动手丰衣足食了。

## 开始动手

首先观察代码，整体结构如下：

```js
!(function() {
  var t = {
    114: function(t, e, n) {},
    514: function(t, e, n) {},
  };
  function n(r) {
    var i = e[r];
    if (void 0 !== i) return i.exports;
    var a = (e[r] = { id: r, loaded: !1, exports: {} });
    return t[r].call(a.exports, a, a.exports, n), (a.loaded = !0), a.exports;
  }
  (function() {
    // entry here
    n(114), n(514);
  })();
})();
```

很标准的webpack打包代码，整体分三截，命名为t的变量即为`__webpack_modules__`，n函数为`require`，最后的自执行函数即为入口。

格式化后68880行实在是没眼看，这反复跳转很影响效率。于是分割modules成为了首要任务，将其识别并提取为独立文件才更便于后续的分析处理。

由于对AST相关访问处理不甚熟悉，想到之前看到的文章，从[这里](https://github.com/mengjian-github/copilot-analysis)借了拆包的代码，稍作调整成功将代码拆包成337个modules。

接下来就可以从渲染的canvas element：`webgl`入手，反向寻找这部份功能涉及的代码。

```js
var Li = (function () {
  function t() {
    var t = this;
    if (
      ((this.fitViewport = Ne(function () {
        var e = t,
          n = e.width,
          r = e.height,
          i = e.resoluteWidth,
          a = e.resoluteHeight;
        (t.canvas.width === i && t.canvas.height === a) ||
          (t.renderer.setSize(i, a, !1),
          (t.camera.near = 110),
          (t.camera.far = 1e3),
          (t.camera.aspect = n / r),
          (t.camera.fov = Mi.MathUtils.radToDeg(
            2 * Math.atan(r / 2 / 160)
          )),
          t.camera.updateProjectionMatrix(),
          t.camera.position.set(0, 0, 160),
          t.camera.lookAt(0, 0, 0));
      })),
      (this.update = function () {
        t.fitViewport(), t.renderer.render(t.scene, t.camera);
      }),
      (this.canvas = document.getElementById("webgl")),
      !this.canvas)
    )
      throw new Error("no webgl canvas");
    (this.scene = new Mi.Scene()),
      (this.camera = new Mi.PerspectiveCamera()),
      (this.renderer = new Mi.WebGLRenderer({
        canvas: this.canvas,
        alpha: !0,
      })),
      Be.add(this.update);
  }
  return (
    Object.defineProperty(t, "instance", {
      get: function () {
        return t._instance || (t._instance = new t()), t._instance;
      },
      enumerable: !1,
      configurable: !0,
    }),
    Object.defineProperty(t.prototype, "width", {
      get: function () {
        return this.canvas.clientWidth;
      },
      enumerable: !1,
      configurable: !0,
    }),
    Object.defineProperty(t.prototype, "resoluteWidth", {
      get: function () {
        return "desktop" === He.mode
          ? this.canvas.clientWidth
          : Math.round(
              this.canvas.clientWidth * window.devicePixelRatio
            );
      },
      enumerable: !1,
      configurable: !0,
    }),
    Object.defineProperty(t.prototype, "height", {
      get: function () {
        return this.canvas.clientHeight;
      },
      enumerable: !1,
      configurable: !0,
    }),
    Object.defineProperty(t.prototype, "resoluteHeight", {
      get: function () {
        return "desktop" === He.mode
          ? this.canvas.clientHeight
          : Math.round(
              this.canvas.clientHeight * window.devicePixelRatio
            );
      },
      enumerable: !1,
      configurable: !0,
    }),
    (t.prototype.stop = function () {
      Be.remove(this.update);
    }),
    t
  );
})();
```

这类的业务代码其实挺好懂的，也没有多少变量名称的损失，主要的点在于经过`babel`之类的转译处理后，`es6`的各种特性使用会被转换成更原始的`es5`代码。比如类的成员函数，被转换成原型链上的函数；`getter`被转换为`Object.defineProperty`等等。

简单体力劳动之后就能得到如下代码：

```js
class Li {
  canvas;
  constructor() {
    this.fitViewport = Ne(function () {
      var e = this;
      var n = e.width;
      var r = e.height;
      var i = e.resoluteWidth;
      var a = e.resoluteHeight;
      if (!(this.canvas.width === i && this.canvas.height === a)) {
        this.renderer.setSize(i, a, false);
        this.camera.near = 110;
        this.camera.far = 1e3;
        this.camera.aspect = n / r;
        this.camera.fov = Mi.MathUtils.radToDeg(2 * Math.atan(r / 2 / 160));
        this.camera.updateProjectionMatrix();
        this.camera.position.set(0, 0, 160);
        this.camera.lookAt(0, 0, 0);
      }
    });
    this.update = () => {
      this.fitViewport();
      this.renderer.render(this.scene, this.camera);
    };
    this.canvas = document.getElementById("webgl");
    if (!this.canvas)
      throw new Error("no webgl canvas");
    this.scene = new Mi.Scene();
    this.camera = new Mi.PerspectiveCamera();
    this.renderer = new Mi.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
    });
    Be.add(this.update);
  }
  stop() {
    Be.remove(this.update);
  }
  static get instance() {
    return (
      Li._instance || (Li._instance = new Li()),
      Li._instance
    );
  }
  get width() {
    return this.canvas.clientWidth;
  }
  get height() {
    return this.canvas.clientHeight;
  }
  get resoluteWidth() {
    return "desktop" === He.mode
      ? this.canvas.clientWidth
      : Math.round(this.canvas.clientWidth * window.devicePixelRatio);
  }
  get resoluteHeight() {
    return "desktop" === He.mode
      ? this.canvas.clientHeight
      : Math.round(this.canvas.clientHeight * window.devicePixelRatio);
  }
}
```

此时主要有如下几个未知变量`Ne`, `Mi`, `Be`, `Li`。

Mi最明显，根据其成员函数，很快就能得知，就是`THREE`，`Be`, `Li`都是业务代码中的其它类定义，只需继续整理即可。

接下来就是几个主要的拦路石了。

## lodash和它的小伙伴们

```js
var ve = function () {
  return me.Z.Date.now();
},
Ae = /^\s+|\s+$/g,
Le = /^[-+]0x[0-9a-f]+$/i,
Ce = /^0b[01]+$/i,
Pe = /^0o[0-7]+$/i,
Re = parseInt,
Oe = function (t) {
  if ("number" == typeof t) return t;
  if (Me(t)) return NaN;
  if (pe(t)) {
    var e = "function" == typeof t.valueOf ? t.valueOf() : t;
    t = pe(e) ? e + "" : e;
  }
  if ("string" != typeof t) return 0 === t ? t : +t;
  t = t.replace(Ae, "");
  var n = Ce.test(t);
  return n || Pe.test(t)
    ? Re(t.slice(2), n ? 2 : 8)
    : Le.test(t)
    ? NaN
    : +t;
},
Ie = Math.max,
De = Math.min,
pe = function (t) {
  var e = typeof t;
  return null != t && ("object" == e || "function" == e);
},
ke = function (t, e, n) {
  var r,
    i,
    a,
    o,
    s,
    l,
    u = 0,
    c = !1,
    h = !1,
    d = !0;
  if ("function" != typeof t)
    throw new TypeError("Expected a function");
  function f(e) {
    var n = r,
      a = i;
    return (r = i = void 0), (u = e), (o = t.apply(a, n));
  }
  function p(t) {
    return (u = t), (s = setTimeout(v, e)), c ? f(t) : o;
  }
  function m(t) {
    var n = t - l;
    return void 0 === l || n >= e || n < 0 || (h && t - u >= a);
  }
  function v() {
    var t = ve();
    if (m(t)) return g(t);
    s = setTimeout(
      v,
      (function (t) {
        var n = e - (t - l);
        return h ? De(n, a - (t - u)) : n;
      })(t)
    );
  }
  function g(t) {
    return (s = void 0), d && r ? f(t) : ((r = i = void 0), o);
  }
  function y() {
    var t = ve(),
      n = m(t);
    if (((r = arguments), (i = this), (l = t), n)) {
      if (void 0 === s) return p(l);
      if (h) return clearTimeout(s), (s = setTimeout(v, e)), f(l);
    }
    return void 0 === s && (s = setTimeout(v, e)), o;
  }
  return (
    (e = Oe(e) || 0),
    pe(n) &&
      ((c = !!n.leading),
      (a = (h = "maxWait" in n) ? Ie(Oe(n.maxWait) || 0, e) : a),
      (d = "trailing" in n ? !!n.trailing : d)),
    (y.cancel = function () {
      void 0 !== s && clearTimeout(s),
        (u = 0),
        (r = l = i = s = void 0);
    }),
    (y.flush = function () {
      return void 0 === s ? o : g(ve());
    }),
    y
  );
},
Ne = function (t, e, n) {
  var r = !0,
    i = !0;
  if ("function" != typeof t)
    throw new TypeError("Expected a function");
  return (
    pe(n) &&
      ((r = "leading" in n ? !!n.leading : r),
      (i = "trailing" in n ? !!n.trailing : i)),
    ke(t, e, { leading: r, maxWait: e, trailing: i })
  );
};
```

可见上面的代码主打一个抽象，你硬要说能不能用吧，当然是可以的，很容易就能吧所有需要的代码片段剥离出来直接拿来使用。但这看起来就太灾难了，预估是一个比较基础的类库，连整数解析都需要自己写。

### 召唤ChatGPT老师

这时候，后知后觉的我想到了ChatGPT，就该身经百战的ChatGPT来，它看过的代码肯定比我多啊。

看看能不能直接当个反编译器：
```
> 你将充当一个js的反编译器，对收到的js代码尝试进行代码的还原。

< 理解你的请求，但需要指出的是，将 JavaScript 代码反编译成原始的源代码是一项复杂且具有挑战性的任务，特别是当代码已经经过混淆或压缩处理时。此外，反编译代码可能涉及法律和伦理问题，因为它可能侵犯版权或隐私。因此，我无法提供完整的 JavaScript 反编译功能。

< 如果你有特定的 JavaScript 代码示例，我可以尝试解释其功能和结构，但无法提供代码的完整还原。请提供要分析的代码，我将尽力帮助你理解它。
```

遗憾，这块功能直球被特调了，稍稍迂回一下。

```
> 这是被webpack处理过的代码，请根据如下代码还原在其原本的样子，并尝试赋予变量、函数名称一个有意义的名称，每次发送代码，输出还原后的代码，不需要带注释，不需要解释功能。
```

于是得到如下代码，明明对你不是一个复杂而又具有挑战性的问题啊？

```js
const now = function () {
  return Date.now();
};

const trimRegExp = /^\s+|\s+$/g;
const hexRegExp = /^[-+]0x[0-9a-f]+$/i;
const binaryRegExp = /^0b[01]+$/i;
const octalRegExp = /^0o[0-7]+$/i;
const parseInt = parseInt;

const toNumber = function (value) {
  if (typeof value === "number") return value;
  if (isNaN(value)) return NaN;
  if (isPlainObject(value)) {
    const unwrappedValue = typeof value.valueOf === "function" ? value.valueOf() : value;
    value = isPlainObject(unwrappedValue) ? unwrappedValue + "" : unwrappedValue;
  }
  if (typeof value !== "string") return value === 0 ? value : +value;
  value = value.replace(trimRegExp, "");
  const isBinary = binaryRegExp.test(value);
  return isBinary || octalRegExp.test(value)
    ? parseInt(value.slice(2), isBinary ? 2 : 8)
    : hexRegExp.test(value)
    ? NaN
    : +value;
};

const max = Math.max;
const min = Math.min;

const isPlainObject = function (value) {
  const type = typeof value;
  return value !== null && (type === "object" || type === "function");
};

const debounce = function (func, wait, options) {
  let lastArgs, lastThis, maxWait, result, timerId, lastCallTime = 0, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;

  if (typeof func !== "function") {
    throw new TypeError("Expected a function");
  }

  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;
    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    lastInvokeTime = time;
    timerId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;
    return maxing
      ? min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === undefined ||
      (timeSinceLastCall >= wait ||
        timeSinceLastCall < 0 ||
        (maxing && timeSinceLastInvoke >= maxWait))
    );
  }

  function timerExpired() {
    const time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastCallTime = lastInvokeTime = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced(...args) {
    const time = now();
    const isInvoking = shouldInvoke(time);
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }

  wait = toNumber(wait) || 0;
  if (isPlainObject(options)) {
    leading = !!options.leading;
    maxing = "maxWait" in options;
    maxWait = maxing ? max(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  return debounced;
};

const throttle = function (func, wait, options) {
  return debounce(func, wait, { leading: false, trailing: true });
};
```

轻松拿捏，稍作推测，确定鹰角使用的就是`lodash`中的`throttle`。剩余的lodash使用也可以通过这样的处理确定其函数，主要工作量就在从中剥离代码以便于喂给ChatGPT了。

`import { throttle, fill, random, shuffle, flattenDepth, map, slice } from "lodash";`

总共应该有如上这些函数的使用。

## forEach，别惦记你那IE浏览器了

下面也是一个充斥在代码中的函数，而且还在反复重复，这明明不是可以提取成全局函数的么，怎么哪里用到哪里就留一份呢？是`babel`的问题还是配置的问题？代码还是比较直白的，就是个forEach，让ChatGPT验证一下，速速现出`Fe`真身。

```js
var Fe = function (t) {
  var e = "function" == typeof Symbol && Symbol.iterator,
    n = e && t[e],
    r = 0;
  if (n) return n.call(t);
  if (t && "number" == typeof t.length)
    return {
      next: function () {
        return (
          t && r >= t.length && (t = void 0),
          { value: t && t[r++], done: !t }
        );
      },
    };
  throw new TypeError(
    e ? "Object is not iterable." : "Symbol.iterator is not defined."
  );
};
window.addEventListener( "resize", Ne(function () {
    var e, n;
    try {
      for (
        var r = Fe(t.queue), i = r.next();
        !i.done;
        i = r.next()
      )
        (0, i.value)();
    } catch (t) {
      e = { error: t };
    } finally {
      try {
        i && !i.done && (n = r.return) && n.call(r);
      } finally {
        if (e) throw e.error;
      }
    }
  })
);
```

没有问题，确实是获取数组的迭代器。既然知道是从什么转换来的，其实就用不上这个函数了。

```js
function createIterator(t) {
  var e = "function" == typeof Symbol && Symbol.iterator,
    n = e && t[e],
    r = 0;
  if (n) return n.call(t);
  if (t && "number" == typeof t.length)
    return {
      next: function () {
        return (
          t && r >= t.length && (t = void 0),
          { value: t && t[r++], done: !t }
        );
      },
    };
  throw new TypeError(
    e ? "Object is not iterable." : "Symbol.iterator is not defined."
  );
}
window.addEventListener("resize", _.throttle(() => {
    for (let handler of self.queue) {
      handler();
    }
  })
);
```

## async，那是真看不懂

接下来就是占地面积最大的polyfill了，好在比较内聚，不像lodash一样东一个西一个。

```js
setTimeout(function () {
  return (
    (t = e),
    (n = void 0),
    (i = function () {
      var t, e, n, r;
      return (function (t, e) {
        var n, r, i, a, o = {
            label: 0,
            sent: function () {
              if (1 & i[0]) throw i[1];
              return i[1];
            },
            trys: [],
            ops: [],
        };
        return ((a = { next: s(0), throw: s(1), return: s(2) }), "function" == typeof Symbol && (a[Symbol.iterator] = function () { return this; }), a);
        function s(a) {
          return function (s) {
            return (function (a) {
              if (n)
                throw new TypeError(
                  "Generator is already executing."
                );
              for (; o; )
                try {
                  if (((n = 1), r && (i = 2 & a[0] ? r.return : a[0] ? r.throw || ((i = r.return) && i.call(r), 0) : r.next) &&!(i = i.call(r, a[1])).done))
                    return i;
                  switch (((r = 0), i && (a = [2 & a[0], i.value]), a[0])) {
                    case 0:
                    case 1:
                      i = a;
                      break;
                    case 4:
                      return o.label++, { value: a[1], done: !1 };
                    case 5:
                      o.label++, (r = a[1]), (a = [0]);
                      continue;
                    case 7:
                      (a = o.ops.pop()), o.trys.pop();
                      continue;
                    default:
                      if (!((i = (i = o.trys).length > 0 && i[i.length - 1]) || (6 !== a[0] && 2 !== a[0]))) {
                        o = 0;
                        continue;
                      }
                      if (3 === a[0] && (!i || (a[1] > i[0] && a[1] < i[3]))) {
                        o.label = a[1];
                        break;
                      }
                      if (6 === a[0] && o.label < i[1]) {
                        (o.label = i[1]), (i = a);
                        break;
                      }
                      if (i && o.label < i[2]) {
                        (o.label = i[2]), o.ops.push(a);
                        break;
                      }
                      i[2] && o.ops.pop(), o.trys.pop();
                      continue;
                  }
                  a = e.call(t, o);
                } catch (t) {
                  (a = [6, t]), (r = 0);
                } finally {
                  n = i = 0;
                }
              if (5 & a[0]) throw a[1];
              return { value: a[0] ? a[1] : void 0, done: !0 };
            })([a, s]);
          };
        }
      })(this, function (i) {
        switch (i.label) {
          case 0:
            return ((e = Mi.Uniform.bind), [4, new Mi.TextureLoader().loadAsync(sa)]);
          case 1:
            return (
              (t = new (e.apply(Mi.Uniform, [
                void 0,
                i.sent(),
              ]))()),
              (n = new Mi.ShaderMaterial({
                uniforms: {
                  uTexture: t,
                  uPointSize: this.uPointSize,
                },
                vertexShader:
                  "\n                    attribute vec4 color;\n                    varying vec4 vColor;\n                    uniform float uPointSize;\n                    void main() {\n                        vColor = color;\n                        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n                        gl_PointSize = uPointSize;\n                        gl_Position = projectionMatrix * mvPosition;\n                    }\n                ",
                fragmentShader:
                  "\n                    uniform sampler2D uTexture;\n                    varying vec4 vColor;\n                    void main() {\n                        vec4 texture = texture2D(uTexture, gl_PointCoord);\n                        gl_FragColor = vColor * texture;\n                        // gl_FragColor = vColor;\n                    }",
                transparent: !0,
                depthTest: !1,
              })),
              (r = new Mi.Points(l, n)),
              Li.instance.scene.add(r),
              [2]
            );
        }
      });
    }),
    new ((r = void 0) || (r = Promise))(function (e, a) {
      function o(t) {
        try {
          l(i.next(t));
        } catch (t) {
          a(t);
        }
      }
      function s(t) {
        try {
          l(i.throw(t));
        } catch (t) {
          a(t);
        }
      }
      function l(t) {
        var n;
        t.done ? e(t.value) : ((n = t.value), n instanceof r ? n : new r(function (t) { t(n); })).then(o, s);
      }
      l((i = i.apply(t, n || [])).next());
    })
  );
  var t, n, r, i;
}, 0);
```

先取个名字看看

```js
setTimeout(function () {
  return (
    (textureLoaderFunction = loadTexture),
    (someData = undefined),
    (mainGenerator = function () {
      var textureLoader, shaderMaterial, points;

      return (function (textureLoaderFunction, someData) {
        var generator, iterationResult, generatorControls;

        return (
          (generatorControls = {
            next: generate(0),
            throw: generate(1),
            return: generate(2),
          }),
          "function" == typeof Symbol &&
            (generatorControls[Symbol.iterator] = function () {
              return this;
            }),
          generatorControls
        );

        function generate(controlType) {
          return function (controlValue) {
            return (function (controlValue) {
              if (generator)
                throw new TypeError(
                  "Generator is already executing."
                );
              for (; generatorControls; )
                try {
                  if (((generator = 1), iterationResult && (controlValue = 2 & controlType ? iterationResult.return : controlType ? iterationResult.throw || ((controlValue = iterationResult.return) && controlValue.call(iterationResult), 0) : iterationResult.next) && !(controlValue = controlValue.call(iterationResult, controlValue)).done))
                    return controlValue;
                  switch (((iterationResult = 0), controlValue && (controlType = [2 & controlType, controlValue.value]), controlType[0])) {
                    case 0:
                    case 1:
                      controlValue = controlType;
                      break;
                    case 4:
                      return generatorControls.label++, { value: controlType[1], done: !1 };
                    case 5:
                      generatorControls.label++, (iterationResult = controlType[1]), (controlType = [0]);
                      continue;
                    case 7:
                      (controlType = generatorControls.ops.pop()), generatorControls.trys.pop();
                      continue;
                    default:
                      if (!((controlValue = (controlValue = generatorControls.trys).length > 0 && controlValue[controlValue.length - 1]) || (6 !== controlType[0] && 2 !== controlType[0]))) {
                        generatorControls = 0;
                        continue;
                      }
                      if (3 === controlType[0] && (!controlValue || (controlType[1] > controlValue[0] && controlType[1] < controlValue[3]))) {
                        generatorControls.label = controlType[1];
                        break;
                      }
                      if (6 === controlType[0] && generatorControls.label < controlValue[1]) {
                        (generatorControls.label = controlValue[1]), (controlType = controlType);
                        break;
                      }
                      if (controlValue && generatorControls.label < controlValue[2]) {
                        (generatorControls.label = controlValue[2]), generatorControls.ops.push(controlType);
                        break;
                      }
                      controlValue[2] && generatorControls.ops.pop(), generatorControls.trys.pop();
                      continue;
                  }
                  controlType = textureLoaderFunction.call(textureLoader, generatorControls);
                } catch (controlValue) {
                  (controlType = [6, controlValue]), (iterationResult = 0);
                } finally {
                  generator = iterationResult = 0;
                }
              if (5 & controlType[0]) throw controlType[1];
              return { value: controlType[0] ? controlType[1] : void 0, done: !0 };
            })([controlType, controlValue]);
          };
        }
      })(this, function (controlValue) {
        switch (controlValue.label) {
          case 0:
            return (
              (someFunction = Uniform.bind),
              [4, new TextureLoader().loadAsync(someData)]
            );
          case 1:
            return (
              (textureLoader = new (someFunction.apply(Uniform, [
                void 0,
                controlValue.sent(),
              ]))()),
              (someMaterial = new ShaderMaterial({
                uniforms: {
                  uTexture: textureLoader,
                  uPointSize: this.uPointSize,
                },
                vertexShader:
                  "\n                    attribute vec4 color;\n                    varying vec4 vColor;\n                    uniform float uPointSize;\n                    void main() {\n                        vColor = color;\n                        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n                        gl_PointSize = uPointSize;\n                        gl_Position = projectionMatrix * mvPosition;\n                    }\n                ",
                fragmentShader:
                  "\n                    uniform sampler2D uTexture;\n                    varying vec4 vColor;\n                    void main() {\n                        vec4 texture = texture2D(uTexture, gl_PointCoord);\n                        gl_FragColor = vColor * texture;\n                        // gl_FragColor = vColor;\n                    }",
                transparent: !0,
                depthTest: !1,
              })),
              (points = new Points(someData, someMaterial)),
              someInstance.scene.add(points),
              [2]
            );
        }
      });
    }),
    new ((generatorControls = void 0) || (generatorControls = Promise))(function (controlValue, controlType) {
      function controlGenerator(t) {
        try {
          controlIteration(generatorControls.next(t));
        } catch (t) {
          controlType(t);
        }
      }
      function controlThrow(t) {
        try {
          controlIteration(generatorControls.throw(t));
        } catch (t) {
          controlType(t);
        }
      }
      function controlIteration(t) {
        var n;
        t.done
          ? controlValue(t.value)
          : ((n = t.value),
            n instanceof generatorControls
              ? n
              : new generatorControls(function (t) {
                  t(n);
                })).then(controlGenerator, controlThrow);
      }
      controlIteration((generatorControls = generatorControls.apply(textureLoaderFunction, someData || [])).next());
    })
  );
  var textureLoaderFunction, someData, generatorControls;
}, 0);
```

大大提升了可读性，但还有些不对，很明显的，chatgpt把下面这段定义就给吞掉了。

```js
var o = {
  label: 0,
  sent: function () {
    if (1 & i[0]) throw i[1];
    return i[1];
  },
  trys: [],
  ops: [],
};
```

这样的结果最多也只能直接贴到代码里直接用，变量名和报错信息都提到了Generator，生成得像混淆了一样，根据我贫瘠的知识，这段代码是将async语法给polyfill了，让ChatGPT老师再辛苦一下。

```js
setTimeout(async function loadTextureAndCreateMaterial() {
  var textureLoaderFunction, textureLoader, shaderMaterial, points;

  async function loadTextureAndCreateMaterialAsync() {
    textureLoaderFunction = Uniform.bind;
    await new TextureLoader().loadAsync(someData);
    textureLoader = new (textureLoaderFunction.apply(Uniform, [undefined, someData]))();
    shaderMaterial = new ShaderMaterial({
      uniforms: {
        uTexture: textureLoader,
        uPointSize: thisContext.uPointSize,
      },
      vertexShader:
        `
        attribute vec4 color;
        varying vec4 vColor;
        uniform float uPointSize;
        void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            gl_PointSize = uPointSize;
            gl_Position = projectionMatrix * mvPosition;
        }
        `,
      fragmentShader:
        `
        uniform sampler2D uTexture;
        varying vec4 vColor;
        void main() {
            vec4 texture = texture2D(uTexture, gl_PointCoord);
            gl_FragColor = vColor * texture;
        }
        `,
      transparent: true,
      depthTest: false,
    });
    points = new Points(someData, shaderMaterial);
    someInstance.scene.add(points);
  }

  await loadTextureAndCreateMaterialAsync();

  return;
}, 0);
```

代码量大减，内容清晰，只剩一点点问题，稍作整理，就能得到如下代码。

```js
const texture = await new THREE.TextureLoader().loadAsync(particleUrl);
const material = new THREE.ShaderMaterial({
    uniforms: {
        uTexture: new THREE.Uniform(texture),
        uPointSize: this.uPointSize,
    },
    vertexShader: `
    attribute vec4 color;
    varying vec4 vColor;
    uniform float uPointSize;
    void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_PointSize = uPointSize;
        gl_Position = projectionMatrix * mvPosition;
    }
    `,
    fragmentShader: `
    uniform sampler2D uTexture;
    varying vec4 vColor;
    void main() {
        vec4 texture = texture2D(uTexture, gl_PointCoord);
        gl_FragColor = vColor * texture;
        // gl_FragColor = vColor;
    }
    `,
    transparent: true,
    depthTest: false,
});
const points = new THREE.Points(someData, material);
this.mainWebglContainer.scene.add(points);
```

非常工整，甚至连shader里莫名其妙的空格都还原出来它的本来面目了。

## 起名案例

其中还有很多图形学计算部分的名称比较难恢复名称，比如下面虽然已经大体整理好了，但名称依然是一团糟。

```js
(particle, model, transform) => {
    if (!model) {
        return;
    }
    const Ji = 1 / 3e3;
    const $i = 0.03;
    const i = 0.08;
    if (particle.pointIdx >= model.count) {
        particle.a += (-1 - particle.a) * i;
        particle.color.set([particle.r, particle.g, particle.b, particle.a]);
        return;
    }
    const pointIdx = particle.pointIdx;
    const pointData = slice(model.points.slice(7 * pointIdx, 7 * pointIdx + 7), 0, 7);
    const x = pointData[0];
    const y = pointData[1];
    const z = pointData[2];
    const r = pointData[3];
    const g = pointData[4];
    const b = pointData[5];
    const a = pointData[6];
    const factor1 = -Math.atan(touchableHandler.x * $i * Ji);
    const xx = transform.sc * x + transform.x;
    const factor2 = xx * Math.cos(factor1);
    const factor3 = xx * Math.sin(factor1);
    const factor4 = -Math.atan(touchableHandler.y * $i * Ji);
    const yy = transform.sc * y + transform.y;
    const factor5 = yy * Math.cos(factor4);
    const zz = z + factor3 + yy * Math.sin(factor4);
    const xxx = factor2 - touchableHandler.x * $i - particle.x;
    const yyy = factor5 - touchableHandler.y * $i - particle.y;
    particle.x += xxx * i;
    particle.y += yyy * i;
    particle.z += (zz - particle.z) * i;
    particle.point.set([particle.x, particle.y, particle.z]);
    particle.r += (r - particle.r) * i;
    particle.g += (g - particle.g) * i;
    particle.b += (b - particle.b) * i;
    particle.a += (a - particle.a) * i;
    particle.color.set([particle.r, particle.g, particle.b, particle.a]);
}
```

而ChatGPT也能很好地处理这块的命名问题。

```js
const updateParticlePositionAndColor = (particle, model, transform) => {
    if (!model) {
        return;
    }
    const frictionCoefficient = 1 / 3e3;
    const interactionCoefficient = 0.03;
    const displacementCoefficient = 0.08;
    
    if (particle.pointIdx >= model.count) {
        particle.a += (-1 - particle.a) * displacementCoefficient;
        particle.color.set([particle.r, particle.g, particle.b, particle.a]);
        return;
    }
    
    const pointIdx = particle.pointIdx;
    const pointData = slice(model.points.slice(7 * pointIdx, 7 * pointIdx + 7), 0, 7);
    const pointX = pointData[0];
    const pointY = pointData[1];
    const pointZ = pointData[2];
    const pointR = pointData[3];
    const pointG = pointData[4];
    const pointB = pointData[5];
    const pointAlpha = pointData[6];
    
    const touchInteractionAngleX = -Math.atan(touchableHandler.x * interactionCoefficient * frictionCoefficient);
    const transformedX = transform.sc * pointX + transform.x;
    const touchInteractionFactorX = transformedX * Math.cos(touchInteractionAngleX);
    const touchInteractionFactorY = transformedX * Math.sin(touchInteractionAngleX);
    
    const touchInteractionAngleY = -Math.atan(touchableHandler.y * interactionCoefficient * frictionCoefficient);
    const transformedY = transform.sc * pointY + transform.y;
    const touchInteractionFactorX2 = transformedY * Math.cos(touchInteractionAngleY);
    const pointZShifted = pointZ + touchInteractionFactorY + transformedY * Math.sin(touchInteractionAngleY);
    
    const displacementX = touchInteractionFactorX - touchableHandler.x * interactionCoefficient - particle.x;
    const displacementY = touchInteractionFactorX2 - touchableHandler.y * interactionCoefficient - particle.y;
    
    particle.x += displacementX * displacementCoefficient;
    particle.y += displacementY * displacementCoefficient;
    particle.z += (pointZShifted - particle.z) * displacementCoefficient;
    
    particle.point.set([particle.x, particle.y, particle.z]);
    
    particle.r += (pointR - particle.r) * displacementCoefficient;
    particle.g += (pointG - particle.g) * displacementCoefficient;
    particle.b += (pointB - particle.b) * displacementCoefficient;
    particle.a += (pointAlpha - particle.a) * displacementCoefficient;
    
    particle.color.set([particle.r, particle.g, particle.b, particle.a]);
};
```

## 结束收尾

经过ChatGPT块辨别各种库的使用和辅助，再辅以相当的体力劳动，终于将代码还原出来了，ChatGPT不但帮我读代码，还帮我给变量取名字，是本次逆向工程的大功臣。

可以前往[Arknights Particle](https://tautcony.xyz/arknights-particle/)看看最终的成果，也可以前往[github](https://github.com/tautcony/arknights-particle)查看相应代码，整体应该是没什么大问题了。
