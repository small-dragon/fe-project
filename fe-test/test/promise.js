/**
 * @author http://www.cnblogs.com/huansky/p/6064402.html
 * @description 手把手教你实现一个完整的promise
 * @createTime 2017-07-24
 * @总结：这里实现的关键在于resolve之后执行then里面赋值给callback的函数
 */

function Promise(fn) {
    var promise = this,
        value = null;
    promise._resolves = []
    promise._status = 'PENDING'
    promise.random = Math.ceil(Math.random()*100)

    this.then = function (onFullfilled) {
        return new Promise(function(resolve) {
            function handle (value) {
                var ret = typeof onFullfilled === 'function' && onFullfilled(value)
                if (ret && typeof ret['then'] == 'function') {
                    ret.then(function(value) {
                        resolve(value)
                    })
                }else {
                   resolve(ret) 
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
        setTimeout(function(){
            promise._status = 'FULFILLED'
            promise._resolves.forEach(function (callback) {
                value = callback(value)
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