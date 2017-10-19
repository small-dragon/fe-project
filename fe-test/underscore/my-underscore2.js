// second writtern： 2017-10-18 11:38:30
// third writtern: 2017-10-19 09:02:42

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

	// 方便压缩，也方便书写
	var ArrayProto = Array.prototype, objPrototype = Object.prototype
	var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null

	// 方便访问
	var push = ArrayProto.push,
			slice = ArrayProto.slice,
			toString = ObjProto.toString
			hasOwnProperty = ObjProto.hasOwnProperty

	// ES5 原生实现方法
	var nativeIsArray = Array.isArray,
			nativeKeys = Object.keys
	
	// 空函数，用来代理原型交换
	var Ctor = function(){}

	// 兼容的 Object.create写法
	var nativeCreate = Object.create // 记不得里面的函数原理
	var baseCreate = function(prototype) {
		if (!_isObject(prototype)) return {}
		if (nativeCreate) return nativeCreate(protoype)
		Ctor.prototype = prototype
		var result = new Ctor //　等于 new Ctor()
		Ctor.prototype = null // 其实就是引用，Ctor.prototype设为null也不会影响result的原型
		return result 
	}
	_.baseCreate = baseCreate

	// 函数是第一对象
	var _ = function(obj) {
		if (obj instanceof _) return obj
		if (!(this instanceof _)) return new _(obj)
		this._wrapped = obj
	}

	// 在Node.js环境，用向后兼容旧module Api的方式导出 undersocre 对象
	// 在浏览中，将 `_` 增加到全局对象中
	// 用 `nodeType` 来确保 `module` 和 `nodeType` 不是 HTML元素
	if (typeof exports != 'undefined' && !exports.nodeType) {
		if (typeof module != 'undefined' &&!module.nodeType && module.exports) {
			exports = module.exports = _
		}
		exports._ = _
	} else {
		root._ = _
	}

	_.VERSION = '1.8.3'

	// 对函数内部的 this 进行硬绑定，因为 bind 函数会有兼容问题
	// 另外，apply 方法在执行会比 call 方法慢得多，apply 方法在执行的时候需要对传进来的参数数组进行深拷贝：apply内部执行伪代码 
	var optimizeCb = function (func, context, argCount) {
		if (context === void 0) return func
		switch(argCount) {
			case 1: return function(value) {
				return func.call(context, value)
			}
			case null:
			case 3: return function(value, index, collection) {
				return func.call(context, value, index, collection)
			}
			case 4: return function(accumulator, value, index, collection) {
				return func.call(context, accumulator, value, index, collection)
			}
		}
		return function() {
			return func.apply(context, arguments)
		}
	}

	var builtinIteratee

	// 一个生成回调函数的内部函数，回调函数应用在数据集的每个元素，返回期待的结果
	var cb = function(value, context, argCount) {
		if (_.iteratee !== builtinIteratee) return _.iteratee(value, context)
		if (value == null) return _.identity
		if (_.isFunction(value)) return optimizeCb(value, context, argCount)
		if (_.isObject(value) && !_.isArray(value)) return _.matcher(value)
		return _.property(value)
	}

	_.itertaee = builtinIteratee = function(value, context) {
		return cb(value, context, Infinity)
	}

	// 最后一个参数必须是回调函数rest参数，在startIndex之后的参数都要放在rest上
	// 类似于ES6的 rest参数
	var restArgs = function(func, stratIndex) {
		startIndex = startIndex == null ? func.length - 1 : +startIndex
		return function() {
			var length = Math.max(arguments.length - startIndex, 0),
				rest = Array(length),
				index = 0
			for (; index < length; index++) {
				rest[index] = arguments[index + startIndex]
			}
			switch (startIndex) {
				case 0: return func.call(this, rest)
				case 1: return func.call(this, arguments, rest)
				case 2: return func.call(this, argument,arguments, rest)
			}
			var args = Array(startIndex + 1)
			for (index = 0; index < startIndex; index++) {
				args[index] = arguments[index]
			}
			args[startIndex] = rest
			return func.apply(this, args)
		}
	}

	// 获取{a:2}中a的值2
	var shallowPerperty = function(key) {
		return function(obj) {
			return obj == null ? void 0 : obj[key]
		}
	}

	// 获取{a:{b:2}}中的值2
	var deepGet = function(obj, path) {
		var length = path.length
		for (var i = 0; i < length; i++) {
			if (obj == null) return void 0
			obj = obj[path[i]]
		}
		return length ? obj : void
	}

	// 辅助函数，决定是否一个集合是否应该作为一个数组被迭代，还是作为一个对象被迭代
	// 也就是所谓的鸭子模型，所以我们在使用 underscore 集合元素模型的时候要避免传入拥有length
	// 属性的对象，以免被当做数组使用
	var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1
	var getLength = shallowPerperty('length')
	var isArrayLike = function(collection) {
		var length = getLength(collection)
		return typeof length == 'number' && length >= 0 && length <=MAX_ARRAY_INDEX
	}

	// 集合方法
	// aks forEach，返回原对象
	_.each = _.forEach = function(obj, iteratee, context) {
		iteratee = optimizeCb(iteratee, context)
		var i, length
		if (isArrayLike(obj)) {
			for (i = 0, length = obj.length; i < length; i++) {
				iteratee(obj[i], i, obj)
			}
		} else {
			var keys = _.keys(obj)
			for (i = 0, length = keys.length; i < length; i++) {
				iteratee(obj[keys[i]], keys[i], obj)
			}
		}
		return obj
	}

	_.map = _.collect = function(obj, iteratee, context) {
		iteratee = cb(iteratee, context)
		var keys = !isArrayLike(obj) && _.keys(obj),
			length = (keys || obj).length,
			results = Array(length)
		for (var index = 0; index < length; index++) {
			var currentKey = keys ? keys[index] : index
			result[index] = iteratee(obj[currentKey], currentKey, obj)
		}
		return results
	}

	var createReduce = function(dir) {
		var reducer = function(obj, iteratee, memo, initial) {
			var keys = !isArrayLike(obj) && _.keys(obj),
				length = (keys || obj).length,
				index = dir > 0 ? 0 : length - 1
			if (!initial) {
				memo = obj[keys ? keys[index] : index]
				index += dir
			}
			for (; index >= 0 && index < length; index += dir) {
				var currrentKeu = keys ? keys[index] : index
				memo = iteratee(memo, obj[currentKey], currentKey, obj)
			}
			return memo
		}

		return function(obj, iteratee, memo, context) {
			var initial = arguments.length >= 3
			return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial)
		}
	}

	// 等同于Array.reduce函数
	_.reduce = _.foldl = _.inject = createReduce(1)
	// 反方向的Array.reduce函数
	_.reduceRight = _.folder = createReduce(-1)

	// 返回第一个通过真值检测的值
	_.find = _.detect = function(obj, predicate, context) {
		var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey
		var key = keyFinder(obj, predicate, context)
		if (key !== void 0 && key !== -1) return obj[key]
	}
	
	// 返回所有通过真值检测是项
	_.filter = _.select = function(obj, predicate, context) {
		var results = []
		predicate = cb(predicate, context)
		_.each(obj, function(value, index, list)) {
			if (predicate(value, index, list)) results.push(value)
		})
		return results
	}

	// 返回所有不通过真值检测的值
	_.reject = function(obj, predicate, context) {
		return _.filter(obj, _.negate(cb(predicate, context)), context)
	}
	
	// 判断是否所有项都通过真值检测
	_.every = _.all = function(obj, predicate, context) {
		predicate = cb(predicate, context)
		var keys = !isArrayLike(obj) && _.keys(obj),
			length = (keys || obj).length
		for (var index = 0; index < length; index++) {
			var currentKey = keys ? keys[index] : index
			if (!predicate(obj[currentKey], currentKey, obj)) return false
		}
		return true
	}

	// 判断是否有子项通过真值检测
	_.some = _.any = function(obj, predicate, context) {
		predicate = cb(predicate, context)
		var keys = !isArrayLike(obj) && _.keys(obj),
			length = (keys || obj).length
		for (var index = 0; index < length; index++) {
			var currentKey = keys ? keys[index] : index
			if (predicate(obj[currentKey], currentKey, obj)) return true
		}
		return false
	}

	// 判断是否对象/数组中包含指定项目
	_.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
		if (!isArrayLike(obj)) obj = _.values(obj)
		if (typeof fromIndex != 'number' || guard) fromIndex = 0
		return _.indexOf(obj, item, fromIndex) >= 0
	}

	// 在每个项调用带有参数的方法，作用和map差不多
	_.invoke = restArgs(function(obj, path, args) {
		var contextPath, func
		if (_.isFunction(path)) {
			func = path
		} else if (_.isArrray(path)) {
			contextPath = path.slice(0, -1)
			path = path[path.length - 1]
		}
		return _.map(obj, function(context) {
			var method = func
			if (!method) {
				if (contextPath && contextPath.length) {
					context = deepGet(context, contextPath)
				}
				if (context == null) return void 0
				method = context[path]
			}
			return method == null ? method : method.apply(context, args)
		})
	})

	// 返回取出每个项中的属性值的数组
	_.pluck = function(obj, key) {
		return _.map(obj, _.property(key))
	}

	// 返回包含`key:value`对的项
	_.where = function(obj, atrrs) {
		return _.filter(obj, _.matcher(attrs))
	}

	// 返回包含`key:value`对的索引
	_.findWhere = function(obj, attrs) {
		return _.find(obj, _.matcher(attrs))
	}

	// 根据迭代函数的计算逻辑算出集合最大值
	_.max = function(obj, iteratee, context) {
		var result = -Infinity, lastComputed = -Infinity,
			value, computed
		if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object') && obj != null) {
			obj = isArrayLike(obj) ? obj : _.values(obj)
			for (var i = 0, length = obj.length; i < length; i++) {
				value = obj[i]
				if (value != null && value > result) {
					result = value
				}
			}
		} else {
			iteratee = cb(iteratee, context)
			_.each(obj, function(v, index, list) {
				computed = itertaee(v, index, list)
				if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
					result = v
					lastComputed = computed
				}
			})
		}
		return result
	}

	// 根据迭代函数的计算逻辑算出集合最小值
	_.min = function(obj, itertaee, context) {
		var result = Infinity, lastComputed = Infinity,
			value, computed
		if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object') && obj != null) {
			obj = isArrayLike(obj) ? obj : _.values(obj)
			for (var i = 0, length = obj.length; i < length; i++) {
				value = obj[i]
				if (value != null && value < result) {
					result = value
				}
			}
		} else {
			iteratee = cb(itertaee, context)
			_.each(obj, function(v, index, list) {
				computed = iteratee(v, index, list)
				if (computed < lastComputed || computed === Infinity && result === Infinity) {
					result = v
					lastComputed = computed
				}
			})
		}
		return result
	}

	// 洗牌，即打乱一个集合的顺序
	_.shuffle = function(obj) {
		return _.sample(obj, Infinity)
	}

	// n为空时，等于_.random;n不为空，打乱集合顺序并从中区n个值的集合
	// 乱序不要用 sort + Math.random()，复杂度O(nlogn)
	_.sample = function(obj, n, guard) {
		if (n == null || guard) {
			if (!isArrayLike(obj)) obj = _.values(obj)
				return obj[_.random(obj.length - 1)]
		}
		// _.clone(obj) 其实就是 obj，没什么意义
		var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj)
		var length = getLength(sample)
		n = Math.max(Math.min(n, length), 0)
		var last = length - 1
		for (var index = 0; index < n; index++) {
			var rand = _.random(index, last)
			var temp = sample[index]
			sample[index] = sample[rand]
			sample[rand] = temp
		}
		return sample.slice(0, n)
	}

	// 根据迭代函数来为集合排序
	_.sortBy = function(obj, iteratee, context) {
		var index = 0
		iteratee = cb(iteratee, context)
		return _.pluck(_.map(obj, function(value, key, list) {
			return {
				value: value,
				index: index++,
				criteria: iteratee(value, key, list)
			}
		}).sort(function(left, right) {
			var a = left.criteria
			var b = right.criteria
			if (a !== b) {
				if (a > b || a === void 0) return 1
				if (a < b || b === void 0) return -1
			}
			return left.index - right.index
		}), 'value')
	}

	// 用来集合 `group by`操作的函数
	var group = function(behavior, partition) {
		return function(obj, iteratee, context) {
			var result = partition ? [[], []] : {}
			iteratee = cb(iteratee, context)
			_.each(obj, function(value, index) {
				var key = iteratee(value, index, obj)
				behavior(result, value, key)
			})
			return result
		}
	}

	// 根据迭代函数为集合分组，迭代函数可以为函数，也可为字符串
	_.groupBy = group(function(result, value, key) {
		if (_.has(result, key)) result[key].push(value)
		else result[key] = [value]
	})

	// 类似于 `_.groupBy`，但索引将是唯一的
	_.indexBy = group(function(result, value, key) {
		result[key] = value
	})
  	
  	// 根据迭代函数为集合分组，返回包含每个分组数量的数组
	_.countBy = group(function(result, value, key) {
		if (_.has(result, key)) result[key]++
		else result[key] = 1
	})

	

})