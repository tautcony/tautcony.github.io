---
layout:     post
title:      "试着实现了一下Promise"
subtitle:   "群盲評象"
date:       2020-08-19
author:     "TautCony"
header-img: "img/post-bg-default.png"
image:
  credit: himawari-8
  creditlink: http://himawari8.nict.go.jp/
tags:
    - 编程
    - 前端
    - Javascript
catalog: true
---

Promise作为一个现代前端日常都在使用的，从日常使用所认识到的Promise，能自己实现出一个准确运作的Promise么？

<!--more-->

既然是根据日常的认知来实现，那么能参考的就只有[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)和浏览器的控制台了。

## 观察

### `Promise`的形状

Promise拥有如下静态方法

- Promise.all(iterable)
- Promise.allSettled(iterable)
- Promise.any(iterable)
- Promise.race(iterable)
- Promise.reject(reason)
- Promise.resolve(value)

Promise拥有如下实例方法

- **Promise.prototype.catch(onRejected)**
    > Appends a rejection handler callback to the promise, and returns a new promise resolving to the return value of the callback if it is called, or to its original fulfillment value if the promise is instead fulfilled.
- **Promise.prototype.then(onFulfilled, onRejected)**
    > Appends fulfillment and rejection handlers to the promise, and returns a new promise resolving to the return value of the called handler, or to its original settled value if the promise was not handled (i.e. if the relevant handler onFulfilled or onRejected is not a function).
- **Promise.prototype.finally(onFinally)**
    > Appends a handler to the promise, and returns a new promise that is resolved when the original promise is resolved. The handler is called when the promise is settled, whether fulfilled or rejected.

根据实际使用和简单分析，要让一个Promise处于基本的可用状态，如上加粗的部分属于雪中送炭，剩余的则为锦上添花，可作为另开的课题。

### 运行的表现

比如构造函数的参数校验，有哪些成员变量等等。

```js
Promise.prototype: {
    Symbol(Symbol.toStringTag): "Promise",
    constructor: ƒ,
    then: ƒ,
    catch: ƒ,
    finally: ƒ
}

new Promise(): {
VM1:1 Uncaught TypeError: Promise resolver undefined is not a function
    at new Promise (<anonymous>)
    at <anonymous>:1:1
}

new Promise(()=>{}): {
    __proto__: Promise
    [[PromiseStatus]]: "pending"
    [[PromiseValue]]: undefined
}
```

## 实现

### 定义YAPromise

```js
const YAPromiseStatusTag = Symbol("PromiseStatus");
const YAPromiseValueTag = Symbol("PromiseValue");

const YAPromiseStatusEnum = Object.freeze({
    Pending: "pending",
    Fulfilled: "fulfilled",
    Rejected: "rejected",
});

class YAPromise {
    [PromiseStatusTag] = YAPromiseStatusEnum.Pending;
    [PromiseValueTag] = undefined;

    constructor(resolver) {}
    then(onFulfilled, onRejected) {}
    catch(onRejected) {}
    finally(onFinally) {}

    get [Symbol.toStringTag]() { return "YAPromise"; }
}
```

### 实现各个实例方法

根据文档，三个方法都是往对象里面挂一个回调函数，并且返回一个**新的**Promise对象。我最初一直想着，链式调用，之前见到的往往都是返回`this`对象，那这样的话如果有多个`then`之类的回调是怎么处理的呢？结果它并不给人这个机会，每次调用，都会生成一个新的对象。

#### 实现构造函数

以朴素的思路的话，实现起来大概会是这么一个样子，为了确保异步性，多套套setTimeout。

```js
constructor(executor) {
    if (typeof executor !== "function") {
        throw new TypeError(`Promise resolver ${executor} is not a function`)
    }
    this.thenCb = undefined;
    this.catchCb = undefined;
    this.finallyCb = undefined;
    setTimeout(() => {
        try {
            executor((value) => {
                this[YAPromiseStatusTag] = YAPromiseStatusEnum.Fulfilled;
                this[YAPromiseValueTag] = value;
                if (this.thenCb) {
                    this.thenCb(value);
                }
                if (this.finallyCb) {
                    this.finallyCb();
                }
            }, (reason) => {
                throw reason;
            });
        } catch(reason) {
            this[YAPromiseStatusTag] = YAPromiseStatusEnum.Rejected;
            this[YAPromiseValueTag] = reason;
            if (this.catchCb) {
                this.catchCb(reason);
            } else {
                console.error("Uncaught (in promise)", reason);
            }
            if (this.finallyCb) {
                this.finallyCb();
            }
        }
    }, 0);
}

```

#### 处理链式调用中的`resolve`

由于返回新`Promise`(记作`B`)对象必然往往先于上一个`Promise`(记作`A`)的`resolve`，那么需要实现一个结构使得我们能够在`B`里，通过`A`的`resolve`来触发B的`resolve`。

如果直接将`onFulfilled`绑定到`A`上并返回`B`，形如下的话，则我们没有一个手段能够在`A` `resolve`后通知到`B`。。

```js
then(onFulfilled, onRejected) {
    this.thenCb = onFulfilled;
    this.catchCb = onRejected;
    return new YAPromise(...);
}
```

一番思索，可以使用如下结构，主要思路是将`onFulfilled`进行包装并将挂载回调函数的时间点推迟到B的执行时，这样就能定义一个包含`A`的`onFulfilled`并触发`B`的`resolve`的新的回调函数。

```js
then(onFulfilled, onRejected) {
    return new YAPromise((resolve, reject) => {
        this.thenCb = value => {
            if (typeof onFulfilled === "function") {
                resolve(onFulfilled(value));
            } else {
                resolve(value);
            }
        }
        this.catchCb = reason => {
            if (typeof onRejected === "function") {
                resolve(onRejected(reason));
            } else {
                reject(reason);
            }
        }
    });
}
```

#### 处理已经到终态的`Promise`对象

上述的代码，经过观察可以发现，现在的形式，如果在then执行之前，`A`已经执行完了呢？比如下面这样

```js
const a = new Promise((resolve,reject) => resolve(1));
setTimeout(() => { a.then(value => console.log(value)); }, 100);
```

首先，需要在`executor`执行时对直接结果进行记录，这一块在上面已经做了，按下不表。

然后在then中，需要在此前对`A`的状态进行判断，如果已经不是`pending`的状态的话，那就可以直接`resolve`或者`reject`了。

由于存在一些公共的代码，进行提取并添加相关逻辑，同时，为了确保回调的异步性，使用`setTimeout`进行了包装，就能得到如下的代码。

```js
then(onFulfilled, onRejected) {
    const resolveHandler = (resolve, reject) => {
        if (typeof onFulfilled === "function") {
            setTimeout(() => {
                resolve(onFulfilled(this[YAPromiseValueTag]));
            }, 0);
        } else {
            resolve(this[YAPromiseValueTag]);
        }
    };
    const rejectHandler = (resolve, reject) => {
        if (typeof onRejected === "function") {
            setTimeout(() => {
                resolve(onRejected(this[YAPromiseValueTag]));
            }, 0);
        } else {
            reject(this[YAPromiseValueTag]);
        }
    };

    return new YAPromise((resolve, reject) => {
        switch (this[YAPromiseStatusTag]) {
            case YAPromiseStatusEnum.Fulfilled: {
                resolveHandler(resolve, reject);
                break;
            }
            case YAPromiseStatusEnum.Rejected: {
                rejectHandler(resolve, reject);
                break;
            }
            case YAPromiseStatusEnum.Pending: {
                this.thenCb = (value) => resolveHandler(resolve, reject);
                this.catchCb = (reason) => rejectHandler(resolve, reject);
                break;
            }
        }
    });
}
```

同理可得
```js
catch(onRejected) {
    const rejectHandler = (resolve, reject) => {
        if (typeof onRejected === "function") {
            setTimeout(() => {
                resolve(onRejected(this[YAPromiseValueTag]));
            }, 0);
        } else {
            reject(this[YAPromiseValueTag]);
        }
    }

    return new YAPromise((resolve, reject) => {
        switch (this[YAPromiseStatusTag]) {
            case YAPromiseStatusEnum.Fulfilled: {
                resolve(this[YAPromiseValueTag]);
                break;
            }
            case YAPromiseStatusEnum.Rejected: {
                rejectHandler(resolve, reject);
                break;
            }
            case YAPromiseStatusEnum.Pending: {
                this.catchCb = (reason) => rejectHandler(resolve, reject);
                this.thenCb = (value) => resolve(value);
                break;
            }
        }
    });
}

finally(onFinally) {
    return new YAPromise((resolve, reject) => {
        switch (this[YAPromiseStatusTag]) {
            case YAPromiseStatusEnum.Fulfilled: {
                onFinally();
                resolve(this[YAPromiseValueTag]);
                break;
            }
            case YAPromiseStatusEnum.Rejected: {
                onFinally();
                reject(this[YAPromiseValueTag]);
                break;
            }
            case YAPromiseStatusEnum.Pending: {
                this.finallyCb = onFinally;
                break;
            }
        }
    });
}
```

#### 处理返回值为`Promise`的回调函数

大致实现如下，需要首先判断其回调返回的是否为一个Promise对象，再做对应的处理，其他各个地方雷同。
```js
const resolveHandler = (resolve, reject) => {
    if (typeof onFulfilled === "function") {
        setTimeout(() => {
            const result = onFulfilled(this[YAPromiseValueTag]);
            if (result instanceof YAPromise) {
                result.then(value => {
                    resolve(value);
                });
            } else {
                resolve(result);
            }
        }, 0);
    } else {
        resolve(this[YAPromiseValueTag]);
    }
};
```

## 测试

根据以上的实现，在简单的测试下，其表现的与Promise已经挺像了。稍作搜索，可知[这个库](https://github.com/promises-aplus/promises-tests)可以用作对Promise实现的准确性进行测试。

它提出了需要准备导出该测试库指定的一个deferred函数，根据描述，实现如下。

```js
exports.deferred = () => {
    let ret = {
        promise: new YAPromise(() => {}),
        resolve: (value) => {
            if (ret.promise[YAPromiseStatusTag] === YAPromiseStatusEnum.Pending) {
                ret.promise[YAPromiseStatusTag] = YAPromiseStatusEnum.Fulfilled;
                ret.promise[YAPromiseValueTag] = value;
            }
            return ret.promise;
        },
        reject: (reason) => {
            if (ret.promise[YAPromiseStatusTag] === YAPromiseStatusEnum.Pending) {
                ret.promise[YAPromiseStatusTag] = YAPromiseStatusEnum.Rejected;
                ret.promise[YAPromiseValueTag] = reason;
            }
            return ret.promise;
        }
    }
    return ret;
};
```

一番测试后，也是能通过相当一部分的样例的，但是细细碎碎的，还是实现得很不完善的。

## 总结

以我对Promise的了解程度，并不足以支撑起一个实现完善的Promise，而只能在自己了解的部分去贴近。

上述的实现存在一个比较大的问题，我的实现其实并不具备独立的`resolve`和`reject`来对promise对象来实现变更，而是于then/catch杂糅到了一起，一方面导致实现上变得更为复杂，同时向测试样例暴露接口也出现了额外的逻辑，某种程度上，需要把大部分逻辑重新实现一下。于是在上述的deferred实现下，有一些的回调，在这样的形式下，可能也并不能调用到。

然后这时候，再看[Promises/A+](https://github.com/promises-aplus/promises-spec)，可以发现，与MDN上的相比，还是有很大的细节上的差距的。这一份，更能作为一个指导实现的文档。而以MDN和实际浏览器中Promise的表现作为参考，则更像是`Clean room design`的操作，很多细节得靠更仔细的测试才能发现。

想要更进一步的了解某一功能背后的逻辑/实现形式，详实的`spec`往往才是更好的伙伴。
