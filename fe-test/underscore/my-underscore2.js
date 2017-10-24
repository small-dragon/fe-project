// second writtern： 2017-10-18 11:38:30
// third writtern: 2017-10-19 09:02:42
// fourth written: 2017-10-20 09:00:06
// fifth written: 2017-10-23 14:09:15
// sixth written: 2017-10-24

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

	// 返回对集合进行迭代函数后的结果数组
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
				var currrentKey = keys ? keys[index] : index
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

	// n为空时，等于_.random;n不为空，打乱集合顺序并从中取n个值的集合
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

	// 将传的各种类型值返回数组
	var reStrSymbol = /[^\ud800-\udfff][\ud800-\udbff][\udc00-\udff][\ud800-\udfff]/g
	_.toArray = function(obj) {
		if (!obj) return []
		if (_.isArray(obj)) return slice.call(obj)
		if (_.isString(obj)) {
			return obj.match(reStrSymbol)
		}
		if (isArrayLike(obj))  return _.map(obj, _.identity)
		return _.values(obj)
	}

	// 返回集合的大小
	_.size = function(obj) {
		if (obj == null) return 0
		return isArrayLike(obj) ? obj.length : _.keys(obj).length
	}

	// 根据 predicate 函数的值来生成包含两个半区的数组
	_.partition = group(function(result, value, pass) {
		result[pass ? 0 : 1].push(value)
	}, true)


	// 操作数组的函数
	
	// 获取数组的第一个项;如果传`n`参数，获取数组的前n个项
	_.first = _.head = _.take = function(array, n, guard) {
		if (array == null || array.length < 1) return void 0
		if (n == null || guard) return array[0]
		return _.initial(array, array.length - n)
	}

	// 返回除最后项的数组;如果传`n`参数，返回除最后n项的数组
	_.initial = function(array, n, guard) {
		return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)))
	}

	// 返回数组的最后n项
	_.last = function(array, n, guard) {
		if (array == null || array.length < 1) return void 0
		if (n == null || guard) return array[array.length - 1]
		return _.rest(array, Math.max(0, array.length - n))
	}

	// 返回数组从n开始的剩余项
	_.rest = _.tail = _.drop = function(array, n, guard) {
		return slice.call(array, n == null || guard ? 1 : n)
	}

	// 去除数组中真值检测为false的值
	_.compact = function(array) {
		return _.filter(array, Boolean)
	}

	// flatten：变平、shallow：使变浅、变薄 
	// shallow为false时只将一维、strict为true只保留降维的项
	var flatten = function(input, shallow, strict, output) {
		output = output || []
		var idx = output.length
		for (var i = 0, length = getLength(input); i < length; i++) {
			var value = input[i]
			if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
				if (shallow) {
					var j = 0, len = value.length
					while(j < len) output[idx++] = value[j++]
				} else {
					flatten(value, shallow, strict, output)
					idx = output.length
				}
			} else if (!strict) {
				output[idx++] = value
			}
		}
		return output
	}

	// 对数组降维，根据shallow值来判断降一维还是多维
	_.flatten = function(array, shallow) {
		return flatten(array, shallow, false)
	}

	// 返回不符合指定项的数组项
	_.without = restArgs(function(array, otherArrays) {
		return _.difference(array, otherArrays)
	})

	// 返回数组中每项进行迭代函数后都不相同的数组
	_.uniq = _.unique = function(array, isSorted, iteratee, context) {
		if (!_.isBoolean(isSorted)) {
			context = iteratee
			iteratee = isSorted
			isSorted = false
		}
		if (iteratee != null) iteratee = cb(iteratee, context)
		var result = []
		var seen = [] // 根据迭代函数生成的数组，用来判断是否重复
		for (var i = 0, length = getLength(array); i < length; i++) {
			var value = array[i],
				computed = iteratee ? iteratee(value, i , array) : value
			if (isSorted) {
				if (!i || seen !== computed) result.push(value)
				seen = computed
			} else if (iteratee) {
				if (!_contains(seen, computed)) {
					seen.push(computed)
					result.push(value)
				}
			} else if (!_contains(result, value)) {
				result.push(value)
			}
		}
		return value
	}

	// 返回多个数组的并集
	_.union = restArgs(function(arrays) {
		return _.uniq(flatten(arrays, true, true))
	})

	// 返回多个数组的交集
	_.intersection = function(array) {
		var result = []
		var argsLength = arguments.length
		for (var  i = 0, length = getLength(array); i < length; i++) {
			var item = array[i]
			if (_.contains(result, item)) continue
			for (var j = 1; j < args.length; j++) {
				if (!_.contains(arguments[j], item)) break
			}
			if (j === argsLength) result.push(item)
		}
		return result
	}

	// 返回一个数组和其他数组都不相同的项
	_.difference = restArgs(function(array, rest) {
		rest = faltten(rest, true, true)
		return _.filter(array, function(value) {
			return !_.contains(rest, value)
		})
	})

	var createPredicateIndexFinder = function(dir) {
		return function(array, predicate, context) {
			predicate = cb(predicate, context)
			var length = getLength(array)
			var index = dir > 0 ? 0 : length - 1
			for (; index >= 0 && index < length; index += dir) {
				if (predicate(array[index, index, array])) return index
			}
			return -1
		}
	}

	// 正向/反向遍历数组，返回满足真值检测的索引，都不满足则返回-1
	_.findIndex = createPredicateIndexFinder(1)
	_.findLastIndex  = createPredicateIndexFinder(-1)

	// 根据二元搜索法来判断插入的值应该处于数组的哪个位置
	_.sortedIndex = function(array, obj, iteratee, context) {
		iteratee = cb(iteratee, context, 1)
		var value = itertaee(obj)
		var low = 0, high = getLength(array)
		while (low < high) {
			var mid = Math.floor(( low + high ) / 2)
			if (iteratee(array[mid]) < value) low = mid + 1
			else high = mid
		}
	}

	// idx从哪开始查找
	var createIndexFinder = function(dir, predicateFind, sortedIndex) {
		return function(array, item, idx) {
			var i = 0, length = getLength(array)
			if (typeof idx == 'number') {
				if (dir > 0) {
					i = idx >= 0 ? idx : Math.max(idx + length, i)
				}
			} else if (sortedIndex && idx && length) {
				idx = sortedIndex(array, item)
				return array[idx] === item ? idx : -1
			}
			if (item !== item) { // 如果Item时候NaN
				idx = predicateFind(slice.call(array, i, length), _.isNaN)
				return idx >= 0 ? idx + i : -1
			}
			for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
				if (array[idx] == item) return idx
			}
			return -1
		}
	}

	// 查找数组中出现某项的第一个索引，和findIndex类似，但IndexOf在遇到排序大数组时的用处真显著
	_.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex)
	_.lastIndexOf = createIndexFinder(-1, _.findLastIndex)
	
	// 生成一个根据算法递增/减的证书数组
	_.range = function(start, stop, step) {
		if (stop == null) {
			stop = start || 0
			start = 0
		}
		if (!step) {
			step = stop < start ? -1 : 1
		}

		var length = Math.max(Math.ceil((stop - start) / step), 0)
		var range = Array(length)

		for (var idx = 0; idx < length; idx++, start += step) {
			range[idx] = start
		}

		return range
	}

	// 将一个数组分为好几份`count`项的数组
	_.chuck = function(array, count) {
		if (count == null || count < 1) return []
		var result = []
		var  i = 0, length = arrar.length
		while (i < length) {
			result.push(slice.call(array, i, i+=count))
		}
		return result
	}

	// 操作函数的函数

	// 决定是否执行一个函数作为构造器还是一个带有参数的正常函数
	var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
		if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args)
		var self = baseCreate(sourceFunc.prototype)
		var result = sourceFunc.apply(self, args)
		if (_.isObject(result)) return result
		return self
	} 

	// 和ES5的bind用法一样
	_.bind = restArgs(function(func, context, args) {
		if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function')
		var bound  = restArgs(function(callArgs) {
			return executeBound(func, bound, context, this, args.concat(callArgs))
		})
		return bound
	})

	// 如果传入的是_，则这个位置先空着，等待手动填入
	_.partial = restArgs(function(func, boundArgs) {
		var placeholder = _.partial.placeholder
		var bound = function() {
			var position = 0, length = boundArgs.length
			var args = Array(length)
			for (var i = 0; i < length; i++) {
				args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i]
			}
			while (position < arguments.length) args.push(arguments[position++])
			return executeBound(func, bound, this, this, args)
		}
	})

	_.partial.placeholder = _

	// 用来缓存一个耗时较长函数的结果
	_.memoize = function(func, hasher) {
		var memoize = function(key) {
			var cache = memoize.cache
			var address = '' + (hasher ? hasher.apply(this, arguments) : key)
			if (!_.has(cache, address)) cache[address] = func.apply(this, arguments)
			return cache[address]
		}
		memoize.cache = {}
		return memoize
	}

	// 延迟一个函数的执行
	_.delay = restArgs(function(func, wait, args) {
		return setTimeout(function() {
			return func.apply(null, args)
		}, wait)
	})

	// 推迟一个函数的执行，将它调度到当前调用栈结束后执行
	_.defer = _.partial(_.delay, _, 1)

	// 函数节流
	_.throttle = function(func, wait, options) {
		var timeout, context, args, result
		// 上次执行的时间
		var previous = 0 
		if (!options) options= {}

		var later = function() {
			previous = options.leading === false ? 0 : _.now()
			timeout = null
			result = func.apply(context, args)
			// 这里的timeout一定是null了吧，检测是为了递归调用，产生新的timeout
			if (!timeout) context = args = null 
		}

		// 返回一个函数，在一个给定的wait时间内最多调用一次
		// 正常情况下，缓冲函数尽它可能多执行，但在一个`wait`期间最能调用一次
		// 不想在`wait`期间的一开始就执行，传 `{leading:false}`
		// 最后一次回调不会被触发，传`{trailing:false}`
		var throttled = function() {
			var now = _.now()
			if (!previous && options.leading === false) previous = now
			var remaining = wait - (now - previous)
			context = this
			args = arguments
			// remaning > wait，则表示客户端时间被调整过 
			if (remaining <= 0 || remaining > wait) {
				if (timeout) {
					clearTimeout(timeout)
					timeout = null
				}
				previous = now
				result = func.apply(context, args)
				if (!timeout) context = args = null
			} else if (!timeout && options.trailing !== false) {
				timeout = setTimeout(later, remaining)
			}
			return result
		}

		throttled.cancel = function() {
			clearTimeout(timeout)
			previous = 0
			timeout = context = args = null
		}

		return throttled
	}

	// 只有当函数不被调用时，它才会被触发
	// 函数将触发在没在`N`ms被调用
	// 如果想立即触发，传递`immediate`参数
	_.debounce = function(func, wait, immediate) {
		var timrout, result

		var later = function(context, args) {
			timeout = null
			if (args) result = func.apply(context, args)
		}

		var debounced = restArgs(function(args) {
			if (timeout) clearTimeout(timeout)
			if (immediate) {
				var callNow = !timeout
				timeout = setTimeout(later, wait)
				if (callNow) result = func.apply(this, args)
			} else {
				timeout = _.delay(later, wait, this, args)
			}

			return result
		})

		debounced.cancel = function() {
			clearTimeout(timeout)
			timeout = null
		}

		return debounced
	}	

	// 将一个函数作为第二个函数的参数
	_.wrap = function(func, wrapper) {	
		return _.partial(wrapper, func)
	}

	// 返回真值函数的否定版本
	_.negate = function(predicate) {
		return function() {
			return !predicate.apply(this, arguments)
		}
	}

	// 复合函数，将一个函数执行之后的结果再作为参数赋给下一个函数来执行
	_.compose = function() {
		var args = arguments
		var start = args.length - 1
		return function() {
			var i = start
			var result = args[start].apply(this, arguments)
			while(i--) result = args[i].call(this, result)
			return result
		}
	}

	// 第N次和N次之后调用才会执行
	_.after = function(times, func) {
		return function() {
			if (--times < 1) {
				return func.apply(this, arguments)
			}
		}
	}

	// 函数调用不大于N次，大于等于N次将返回上次的结果
	_.before = function(times, func) {
		var memo
		return function() {
			if (--times > 0) {
				memo = func.apply(this, arguments)
			}
			if (times <= 1) func = null
			return memo
		}
	}

	// 只执行一次的函数
	_.once = _.partial(_.before, 2)

	_.restArgs = restArgs

	// 操作对象的函数
	

	// IE9的bug，改写了原型的属性后，用for..in遍历不到该属性
	var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString')
	var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
		'propertyIsEnumerable', 'hasOwnProperty', 'toLocalString']

	var collectNomEnumProps = function(obj, keys) {
		var nonEnumIdx = nonEnumerableProps.length
		var constructor = obj.constructor
		var proto = _.isFunction(constructor) && constructor.prototype || ObjProto
		
		var prop = 'constructor'
		if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop)

		while (nonEnumIdx--) {
			prop = nonEnumerableProps[nonEnumIdx]
			if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
				keys.push(prop)
			}
		} 
	}

	// 返回只在实例上的属性
	_.keys = function(obj) {
		if (!_.isObject(obj)) return []
		if (nativeKeys) return nativeKeys(obj)
		var keys = []
		for (var key in obj) if (_.has(obj, key)) keys.push(key)
		if (hasEnumBug) collectNomEnumProps(obj, keys)
		return keys
	}


	// 返回实例上能遍历到的属性
	_.allKeys = function(obj) {
		if (!_.isObject(obj)) return []
		var keys = []
		for (var key in obj) keys.push(key)
		// Ahem, IE < 9
		if (hasEnumBug) collectNomEnumProps(obj, keys)
		return keys
	}

	// 返回对象上只在实例上能遍历的值的数组
	_.values = function(obj) {
		va keys = _.keys(obj)
		var length = keys.length
		var values = Array(length)
		for (var i = 0; i < length; i++) {
			values[i] = obj[keys[i]]
		}
		return values
	}

	// 类似集合的`map`，不过是返回对象
	_.mapObject = function(obj, iteratee, context) {
		iteratee = cb(iteratee, context)
		var keys = _.keys(obj),
			length = keys.length, 
			results = {}
		for (var index = 0; index < length; index++) {
			var currentKey = keys[index]
			results[currentKey] = iteratee(obj[currentKey], currentKey, obj)
		}
		return results
	}

	// 返回对象的`key,value`对的数组
	_.pairs = function(obj) {
		var keys = _.keys(obj)
		var length = keys.length
		var pairs = Array(length)
		for (var i = 0; i < length; i++) {
			pairs[i] = [keys[i], obj[keys[i]]]
		}
		return pairs
	}

	// 将对象的`key:value`翻转为`value:key`
	_.invert = function(obj) {
		var result = {}
		var keys = _.keys(obj)
		for (var i = 0, length = keys.length; i < length; i++) {
			result[obj[keys[i]]] = keys[i]
		}
		return result
	}

	// 返回一个对象中的方法名的排序数组
	_.functions = methods = function(obj) {
		var names = []
		for (var key in obj) {
			if (_.isFunction(obj[key])) names.push(key)
		}
		return names.sort()
	}

	var createAssigner = function(keysFunc, defaults) {
		return function(obj) {
			var length = arguments.length
			if (defaults) obj = Object(obj)
			if (length < 2 || obj == null) return obj
			for (var index = 1; index < length; index++) {
				var source = arguments[index],
					keys = keysFunc(source),
					l - keys.length
				for (var i = 0; i < l; i++) {
					var key = keys[i]
					if (!default || obj[key] === void 0) obj[key] = source[key]
				}
			}
			return obj
		}
	}

	// 扩展一个对象用对象参数的所有可遍历属性
	_.extend = createAggsigner(_.allKeys)

	// 扩展一个对象用对象实例参数的所有可遍历属性
	_.extendOwn = _.assign = createAssigner(_.keys)

	// 返回对象中第一个通过Predicate测试的key
	_.findKey = function(obj, predicate, context) {
		predicate = cb(predicate, context)
		var keys = _.keys(obj), key
		for (var i = 0, length = keys.length; i < length; i++) {
			key = keys[i]
			if (predicate(obj[key], key, obj)) return key
		}
	}

	var keyInObj = function(value, key, obj) {
		return key in obj
	}

	// 只返回白名单keys中的对象属性
	_.pick = restArgs(function(obj, keys)) {
		var result = {}, iteratee = keys[0]
		if (obj == null) return result
		if (_.isFunction(iteratee)) {
			if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1])
			keys = _.allKeys(obj)
		} else {
			iteratee = keyInObj
			keys = flatten(keys, false, false)
			obj = Object(obj)
		}
		for (var i = 0, length = keys.length; i < length; i++) {
			var key = keys[i]
			var value = obj[key]
			if (iteratee(value, key, obj)) result[key] = value
		}
		return result
	}

	_.omit = restArgs(function(obj, keys) {
		var iteratee = keys[0], context
		if (_.isFunction(iteratee)) {
			iteratee = _.negate(iteratee)
			if (keys.length > 1) context = keys[1]
		} else {
			keys = _.map(flatten(keys, false, false), String)
			iteratee = function(value, key) {
				return !_.contains(keys, key)
			}
		}
		return _.pick(obj, iteratee, context)
	})

	// 填写Object对象中的undefined属性
	_.defaults = createAssigner(_.allKeys, true)

	// 返回一个新的带props属性、以prototype为_proto_的对象
	_.create = function(prototype, props) {
		var result = baseCreate(prototype)
		if (props) _.extendOwn(result, props)
		return result
	}

	// 浅复制
	_.clone = function(obj) {
		if (!_isObject(obj)) return obj
		return _.isArray(obj) ? obj.slice() : _.extend({}, obj)
	}

	// 以obj为参数的拦截器，返回obj，主要意图是作为函数链调用的一环
	_.tap = function(obj, interceptor) {
		interceptor(obj)
		return obj
	}

	_.isMatch = function(object, attrs) {
		var keys = _.keys(attrs), length = keys.length
		if (object == null) return !length
		var obj = Object(object)
		for (var i = 0; i < length; i++) {
			var key = keys[i]
			if (attrs[key] !== obj[key] || !(key in obj)) return false
		}
		return true
	}

	var eq, deepEq
	eq = function(a, b, aStack, bStack) {
		// `0 === -0`但它们是相等，但不是完全一致等价的
		if (a === b) return a !== 0 || 1 / a === 1 / b
		// null、undefined只等于它们自己
		if (a == null || b == null) return false
		// `NaN`s是相等的，但不是非自反的
		if (a !==a) return b !== b
		var type = typeof a
		if (type !== 'function' && type !== 'object' && typeof b != 'object') return false
		return deepEq(a, b, aStack, bStack)
	}

	deepEq = function(a, b, aStack, bStack) {
		if (a instanceof _) a = a._wrapped
		if (b instanceof _) b = b._wrapped
		var className = toString.call(a)
		if (className !== toString.call(b)) return false
		switch (className) {
			case '[object RegExp]':
			case '[object String]':
				return '' + a === '' + b
			case '[object Number]':
				if (+a !== +a) return +b !== +b
				return +a === 0 ? 1 / +a === 1 / b : +a === +b
			case '[object Date]':
			case '[object Boolean]':
				return +a === +b
			case '[object Symbol]':
				return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b)
		}

		var areArrays = className === 'Object Array'
		if (!areArrays) {
			if (typeof a != 'object' || typeof b != 'object') return false
			// 有不同constructor的对象不相等，但不同frames中不同constructor的对象不一样不相等
			var aCtor = a.constructor, bCtor = b.constructor
			if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
				_.isFunction(bCtor) && bCtor instanceof bCtor)
				&& ('constructor' in a && 'constructor' in b)) {
				return false
			}
		}
		aStack = aStack || []
		bStack = bStack || []
		var length = aStack.length
		while (length--) {
			if (aStack[length] === a) return bStack[length] === b
		}

		aStack.push(a)
		bSTack.push(b)

		if (areArrays) {
			length = a.length
			if (length !== b.length) return false
			while (length--) {
				if (!eq(a[length], b[length], aStack, bStack)) return false
			}
		} else {
			var keys = _.keys(a), key
			length = keys.length
			if (_.keys(b).length !== length) return false
			while (length--) {
				key = keys[length]
				if (!(_has(b, key) && eq(a[key], b[key], aStack, bStack))) return false
			}
		}

		aStack.pop()
		bStack.pop()
		return true
	}

	// 用深度比较两个对象是否相等
	_.isEqual = function(a, b) {
		return eq(a, b)
	}

	// 一个空的对象没有枚举的自己的属性
	_.isEmpty = function(obj) {
		if (obj == null) return true
		if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) 
			|| _.isArguments(obj))) return obj.length
		return _.keys(obj).length === 0
	} 


	// 判断是否是一个DOM元素
	_.isElement = function(obj) {
		return !!(obj &&  obj.nodeType === 1) 
	}

	_.isArray = nativeIsArray || function(obj) {
		return toString.call(obj) === '[object Array]'
	}

	_.isObject = function(obj) {
		var type = typeof obj
		return type === 'function' || type === 'object' && !!obj
	}

	// 判断类型的方法
	_.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol',
		'Map', 'WeakMap', 'Set', 'WeakSet'], function(name) {
		_['is' + name] = function(obj) {
			return toString.call(obj) === '[object ' + name + ']'
		}
	})

	// 兼容在IE < 9的判断isArguments的方法
	// IE < 9 下对 arguments 调用 Object.prototype.toString.call 方法 结果是 => [object Object]
	if (!_.isArguments(arguments)) {
		_.isArguments = function(obj) {
			return _.has(obj, 'callee')
		}
	}

	// 解决在old v8等的isFunction的bug
	var nodelist = root.document && root.document.childNodes
	if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
		_.isFunction = function(obj) {
			return typeof obj == 'function' || false
		}
	}

	// 判断一个给定对象是否是一个有限的数字
	_.isFinite = function(obj) {
		return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj))
	}

	_.isNaN = function(obj) {
		return _.isNumber(obj) && isNaN(obj)
	}

	_.isBoolean = function(obj) {
		return obj === true || obj === false || toString.call(obj) === '[object Boolean]'
	}

	_.isNull = function(obj) {
		return obj === null
	}

	_.isUndefined = function(obj) {
		return obj === void 0
	}

	_.has = function(obj, path) {
		if (!_.isArray(path) {
			return obj != null && hasOwnProperty.call(obj, path)
		})
		var length = path.length
		for (var i = 0; i < length; i++) {
			var key = path[i]
			if (obj == null || !hasOwnProperty.call(obj, key)) {
				return false
			}
			obj = obj[key]
		}
		return !!length
	}

	// 工具函数
	
	// 如果全局环境已经使用了`_`变量
	// 则返回此变量继续使用
	_.noConflict = function() {
		root._ = previousUnderscore
		return this
	}

	_.identity = function(value) {
		return value
	}

	_.constant = function(value) {
		return function() {
			return value
		}
	}

	_.noop = function(){}

	_.property = function(path) {
		if (!_.isArray(path)) {
			return shallowPerperty(path)
		}
		return function(obj) {
			return deepGet(obj, path)
		}
	}

	_.propertyOf = function(obj) {
		if (obj == null) {
			return function(){}
		}
		return function(path) {
			return !_isArray(path) ? obj[path] : deepGet(obj, path)
		}
	}

	// 判断一个对象是否有给定的`key:value`对
	_.matcher = _.matches = function(attrs) {
		attrs = _.extentOwn({}, attrs)
		return function(obj) {
			return _.isMatch(obj, attrs)
		}
	}

	// 执行一个函数n次
	_.times = function(n, iteratee, context) {
		var accum = Array(Math.max(0, n))
		iteratee = optimizeCb(iteratee, context, 1)
		for (var i = 0; i < n; i++) accum[i] = iteratee(i)
		return accum
	}

	_.random = function(min, max) {
		if (max == null) {
			max= min
			min = 0
		}
		return min + Math.floor(Math.random() * (max - min + 1))
	}

	_.now = Date.now || function() {
		return new Date().getTime()
	}

	var escapeMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#27;',
		'`': '&#x60'
	}
	var unescapeMap = _.invert(escaoeMap)

	var createEscaper = function(map) {
		var escaper = function(match) {
			return map[math]
		}
		var source = '(?:' + _.keys(map).join('|') + ')'
		var testRegexp = RegExp(source)
		var replaceRegexp = RegExp(source, 'g')
		return function(string) {
			string = string == null ? '' : '' + string
			return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string
		}
	}
	_.escape = createEscaper(escapeMap)
	_.unescape = createEscaper(unescapeMap)


	_.result = function(obj, path, fallback) {
		if (!_.isArray(path)) path = [path]
		var length = path.length
		if (!length) {
			return _.isFunction(fallback) ? fallback.call(obj) : fallback
		}
		for (var i = 0; i < length; i++) {
			var prop = obj == null ? void 0 : obj[path[i]]
			if (prop === void 0) {
				prop = fallback
				i = length
			}
			obj = _.isFunction(prop) ? prop.call(obj) : prop
		}
		return obj
	}

	// 生成读一个的整数id
	var idCounter = 0
	_.uniqueId = function(prefix) {
		var id = ++idCounter + ''
		return prefix ? prefix + id : id
	}

	_.chain = function(obj) {
		var instance = _(obj)
		instance._chain = true
		return instance
	}

	var chainResult = function(instance, obj) {
		return instance._chain ? _(obj).chian() : obj
	}

	_.mixin = function(obj) {
		_.each(_.functions(obj), function(name)) {
			var func = _[name] = obj[name]
			_.prototype[name] = function() {
				var args = [this._wrapped]
				push.apply(args, arguments)
				return chainResult(this, func.apply(_, args))
			}
		}
		return _
	}

	_.mixin(_)

	_.each(['pop', 'push', 'reverse', 'shift', 'sort', 'unshift'], function(name) {
		var method = ArrayProto[name]
		_.prototype[name] = function() {
			var obj = this._wrapped
			if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0]
			return chainResult(this, obj)
		}
	})


})