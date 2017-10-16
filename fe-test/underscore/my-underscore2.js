// IIFE: immediately-invoked-function-expression
(function() {
	// https://github.com/zhangxiang958/underscore-analysis/issues/1 这篇文章解释得很好
	// 很赞赏 typeof self == 'object' && self.self === self && self  既有判断又有赋值
	var root = typeof self == 'object' && self.self === self && self ||
						typeof global == 'object' && global.global === global && global || 
						this ||
						{}

	// 如果已经有不同版本的underscore，那么你可以通过 noConflict 函数给新的underScore赋另一个名字的值存着
	var previousUnderscore = root._
	_.noConflict = function() {
		root._ = previousUnderscore
		return this
	}

	var ArrayProto = Array.prototype, objPrototype = Object.prototype
	var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null

	var push = ArrayProto.push,
			slice = ArrayProto.slice,
			toString = ObjProto.toString
			hasOwnProperty = ObjProto.hasOwnProperty

	var nativeIsArray = Array.isArray,
			nativeKeys = Object.keys
	
	var Ctor = function(){}

	var nativeCreate = Object.create // 记不得里面的函数原理
	var baseCreate = function(prototype) {
		if (!_isObject(prototype)) return {}
		if (nativeCreate) return nativeCreate(protoype)
		Ctor.prototype = prototype
		var result = new Ctor //　等于 new Ctor()
		Ctor.prototype = null // 其实就是引用，Ctor.prototype设为null也不会影响result的原型
		return result 
	}

	// 函数是第一对象
	var _ = function(obj) {
		if (obj instanceof _) return obj
		if (!(this instanceof _)) return new _(obj)
		this._wrapped = obj
	}



})