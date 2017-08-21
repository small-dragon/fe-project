---
> title: 手把手教你实现一个完整的promise
> link： http://www.cnblogs.com/huansky/p/6064402.html
> createTime 2017-07-25
---

By lxl

------

> 手把手教你实现一个完整的promise

------


### 总结：
###### 实现的关键在于
- resolve之后执行then里面赋值给callback的函数
- p1行：resolve函数要异步执行，使用setTimeout...0的方式，不然then的callback函数不会加到promise.resolves中去
- p2行：在 `var ret = isFunction(onFulfilled) && onFulfilled(value) || value;` 中，我修改了，去掉了 `|| value` ，如果加上去则会如果传递给下一个then函数中的data，在新的data返回为空时，会沿用上一个data
- p3行：可以去掉 `value = callback(value)` 中的赋值，毕竟是靠`p4行`中产生的值来传递给then函数callback的
- p5行：为什么还要用一次then函数呢，因为毕竟要获取then中callback函数的Value

```javascript
function Promise(fn) {
    var promise = this,
        value = null;
    promise._resolves = []
    promise._status = 'PENDING'

    this.then = function (onFullfilled) {
        return new Promise(function(resolve) {
            function handle (value) {
                var ret = typeof onFullfilled === 'function' && onFullfilled(value) // p2
                if (ret && typeof ret['then'] == 'function') {
                    ret.then(function(value) { // p5
                        resolve(value) // p4
                    })
                }else {
                   resolve(ret) // p4
                }
                
            }
             if (promise._status === 'PENDING') {
                promise._resolves.push(handle)
            } else if (promise._status == 'FULFILLED') {
                handle(value)
            }
        })
    }

    function resolve (value) {
        setTimeout(function(){  // p1
            promise._status = 'FULFILLED'
            promise._resolves.forEach(function (callback) {
                value = callback(value) // p3
            })
        }, 0)
    }

    fn(resolve)
}

function fn1(resolve, reject) {
    setTimeout(function() {
        console.log('步骤一：执行');
        resolve('1');
    },500);
}

function fn2(resolve, reject) {
    setTimeout(function() {
        console.log('步骤二：执行');
        resolve('2');
    },100);
}


var a = new Promise(fn1)
a.then(function(val) {
    return new Promise(fn2)
}).then(function(val){
    console.log(val);
    return 33;
}).then(function(val) {
    console.log(val)
}).then(function(val){
    console.log(val)
})
```
