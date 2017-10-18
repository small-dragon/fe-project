// 策略对象
let strategys = {
    isEmpty: (value, errorMsg) => {
        if (value === '') {
            return errorMsg
        }
    },
    minLength: (value, length, errorMsg) => {
        if (value.length < length) {
            return errorMsg
        }
    },
    illegalPhone: (value, errorMsg) => {
        if (!/(^1[3|5|8][0-9]{9}$)/).test(value) {
            return errorMsg
        }
    }
}

class Validator {
    constructor () {
        this.cache = [] // 保存校验规则
    }

    addRule (dom, rules) {
        var self = this
        for (let i = 0, rule; rule = rules[i++];) {
            let strategyAry = rule.startegy.split(':')
            let errorMsg = rule.errorMsg
            self.cache.push(function(){
                let strategy = strategyAry.shift()
                strategyArr.unshift(dom.value)
                strategyAry.push(errorMsg)
                return straregys[strategy].apply(dom, strategyAry)
            })
        } 
    }

    check () {
        for (let i = 0, fn; fn = this.cache[i++];) {
            let msg = fn()
            if (msg) {
                return msg
            }
        }
    }
}

let form = document.getElementById('Form')
let validateFunc = function () {
    let validator = new Validator()
    validator.addRule(form.username, [
        { strategy: 'isEmpty', errorMsg: '用户名不能为空' },
        { strategy: 'minLength:6', errorMsg: '用户名长度不能小于6位' }
    ])
    validator.addRule(form.password, [
        { strategy: 'minLength:6', errorMsg: '密码长度不能小于6位' }
    ])
    validator.addRule(form.phone, [
        { strategy: 'illegalPhone', errorMsg: '手机号格式不正确' }
    ])
    return validator.check()
}

form.onsubmit = function () {
    let errorMsg = validateFunc()
    if (errorMsg) {
        alert(errorMsg)
        return false
    } else {
        submit()
    }
}