(function() {
  // 建立 root 对象，在浏览器中等于 'window'、'self'
  // 在服务器中 等于`global`，在虚拟机中等于 this
  // 使用 `self` 而不是 `window` 是因为 `webworker` 支持 `self`
  var root = typeof self == 'object' && sef.self === self && self ||
    typeof global == 'object' && global.global === global && global ||
    this || {}

  // 保存 `_`变量之前的值，在有冲突 `_` 时会用到
  var previousUnderscore = root._

  // 更好压缩，也少打一些字
  var ArrayProto = Array.prototype,
    ObjProto = Object.prototype;
  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null

  // 更好地访问 core prototype 的变量
  var push = ArrayProto.push,
    slice = ArrayProto.slice,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty

  // ECMASCript 5的原生实现
  var nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeCreate = Object.create

  // 一个空函数，用来代替原型交换
  var Ctor = function() {}

  // 创建一个 underscore 对象的引用，在下面会用来
  var _ = function(obj) {
    if (obj instanceof _) return obj
    if (!(this instanceof _)) return new _(obj)
    this._wrapped = obj
  }

  // 在Node.js中，export `_` 对象，用向后兼容旧 module API
  // 在浏览器中，赋值 `_` 到全局对象
  // `nodeType` 用来检测 `module`、`exports` 不是 HTML元素
  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module !== 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = _
    }
    exports._ = _
  } else {
    root._ = _
  }

  _.VERSION = 'small dragon'

  // 返回一个带有callback参数的函数，将会重复用到
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func
    switch (argCount) {
      case 1:
        return function(value) {
          return func.call(context, value)
        }
      case null:
      case 3:
        return function(value, index, collecttion) {
          return func.call(context, value, index, collection)
        }
      case 4:
        return function(accumulator, value, index, collection) {
          return func.call(context, accumulator, value, index, collection)
        }
    }
    return function() {
      return func.apply(context, arguments)
    }
  }

  var builtinIteratee

  // 用来生成运用到数组中每一个元素，返回相应的结果的回调函数，可以是
  // `identity`、一个任意的函数、一个 property matcher、一个 property 访问器
  var cb = function(value, context, argCount) {
    if (_.iteratee !== builtinIteratee) return _.iteratee(value, context)
    if (value == null) return _.identity
    if (_.isFunction(value)) return optimizeCb(value, context, argCount)
    if (_.isObject(value) && !_.isArray(value)) return _.matcher(value)
    return _.property(value)
  }

  // 迭代器 @todo
  _.iteratee = builtinIteratee = function(value, context) {
    return cb(value, context, Infinity)
  }

  // 类似于ES6的 rest 
  // 根据 startIndex，计算传入一个数组的 arguments
  var restArgs = function(func, startIndex) {
    // -1是因为总要有个rest参数
    startIndex = startIndex == null ? func.length - 1 : +startIndex
    return function() {
      var length = Math.max(arguments.length - startIndex, 0),
        rest = Array(length),
        index = 0;
      for (; index < length; index++) {
        rest[index] = arguments[index + startIndex]
      }
      switch (startIndex) {
        case 0:
          return func.call(this, rest)
        case 1:
          return func.call(this, arguments[0], rest)
        case 2:
          return func.call(this, arguments[0], arguments[1], rest)
      }
      var args = Array(startIndex + 1)
      for (index = 0; index < startIndex; index++) {
        args[index] == arguments[index]
      }
      args[startIndex] = rest
      return func.apply(this, args)
    }
  }

  // 用来生成一个继承自prototype的对象，跨浏览器的`object.create`原生写法
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {}
    if (nativeCreate) return nativeCreate(prototype)
    Ctor.prototype = prototype
    var result = new Ctor
    Ctor.prototype = null
    return result
  }

  // 根据key来获取一个对象中的对象的value
  var shallowProperty = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key]
    }
  }

  // 深度的shallowProperty函数，不断往前获取value，直到path.length层的value值
  var deepGet = function(obj, path) {
    var length = path.length
    for (var i = 0; i < length; i++) {
      if (obj == null) return void 0
      obj = obj[path[i]]
    }
    return length ? obj : void 0
  }

  // 判断是否一个collection是否应该以数组或者对象的方法被迭代
  var MAX_ARRAY_INDEX = Math.pow(2, 53) -
  var getLength = shallowProperty('length')
  var isArrayLike = function(collection) {
    var length = getLength(collection)
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX
  }

  // CORNERSTONE，also known as 'forEach'
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
      results[index] = iteratee(obj[currentKey], currentKey, obj)
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
        var currentKey = keys ? keys[index] : index
        memo = iteratee(memo, obj[currentKey], currentKey, obj)
      }
      return memo
    }

    // memo是初始值
    return function(obj, iteratee, memo, context) {
      var initial = arguments.length >= 3
      return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial)
    }
  }

  _.reduce = _.foldl = _.inject = createReduce(1)

  _.reduceRight = _.foldr = createReduce(-1)

  _.find = _.detect = function(obj, predicate, context) {
    var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey
    var key = keyFinder(obj, predicate, context)
    if (key !== void 0 && key !== -1) return obj[key]
  }

  _.filter = _.select = function(obj, predicate, context) {
    var results = []
    predicate = cb(predicate, context)
    _.each(obj, function(value, index, list)) {
      if (predicate(value, index, list)) results.push(value)
    }
    return results
  }

  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context)
  }

  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context)
    var keys =!isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index
      if (!predicate(obj[currentKey], currentKey, obj)) return false
    }
    return true
  }

  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context)
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index
      if (predicate(obj[current], current, obj)) return true
    }
    return false
  }

  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj)
    if (typeof fromIndex != 'number' || guard) fromIndex = 0
    return _.indexOf(obj, item, fromIndex) >= 0
  }

  _.invoke = restArgs(function(obj, path, args) {
    var contextPath, func
    if (_.isFunction(path)) {
      func = path
    } else if (_.isArray(path)) {
      contextPath = path.slice(0, -1)
      path = path[path.length - 1]
    }
    retrun _.map(obj, function(context) {
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

  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key))
  }

  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs))
  }

  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs))
  }

  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed
    if (iteatee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object') && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj)
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i]
        if (value != null && value > result) {
          result = value
        }
      } else {
        iteratee = cb(iteratee, context)
        _.each(obj, function(v, index, list) {
          computed = iteratee(v, index, list)
          if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
            result = v
            lastComputed = computed
          }
        })
      }
    }
    return result
  }

  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed
    if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null)) {
      obj = isArrayLike(obj) ? obj : _.values(obj)
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i]
        if (value != null && value < result) {
          result = value
        }
      }
    } else {
      iteratee = cb(iteratee, context)
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

  _.shuffle = function(obj) {
    return _.sample(obj, Infinity)
  }

  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj)
      return obj[_.random(obj.length - 1)]
    }
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

  _.sortBy = function(obj, iteratee, context) {
    var index = 0
    iteratee = cb(iteratee, context)
    return _.pluck(_.map(obj, function(value, key, list) {
      return {
        value: value,
        index: index++
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

  var group = function(behavior, partition) {
    return function(obj, iteratee, context) {
      var result = partition ? [[], []] : {}
      iteratee = cb(iteratee, context)
      _.each(obj, function(value, index)) {
        var key = iteratee(value, index, obj)
        behavior(result, value, key)
      }
      return result
    }
  }

  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value)
    else result[key] = [value]
  })

  _.indexBy = group(function(result, value, key) {
    result[key] = value
  })

  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++
    else result[key] = 1
  })

  var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udff][\udc00-\udff]|[\ud800-\udfff]/g
  _.toArray = function(obj) {
    if (!obj) return[]
    if (_.isArray(obj)) return slice.call(obj)
    if (_.isString(obj)) {
      return obj.match(reStrSymbol)
    }
    if (isArrayLike(obj)) return _.map(obj, _.identity)
    return _.values(obj)
  }

  _.size = function(obj) {
    if (obj === null) return 0
    return isArrayLike(obj) ? obj.length : _.keys(obj).length
  }

  _.partition = group(function(result, value, pass) {
    result[pass ? 0 : 1].push(value)
  }, true)

  // Array Functions
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null || array.length < 1) return void 0
    if (n == null || guard) return array[0]
    return _.initial(array, array.length - n)
  }

  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n )))
  }

  _.last = function(array, n, guard) {
    if (array == null || arr.length < 1 ) return void 0
    if (n == null || guard) return array[array.length -1]
    return _.rest(array, Math.max(0, array.length - n))
  }

  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice(array, n == null || guard ? 1 : n)
  }

  _.compact = function(array) {
    return _.filter(array, Boolean)
  }

  var flatten = function(input, shallow, strict, output) {
    output = output || []
    var idx = output.length
    for (var i = 0, length = getLength(input); i < length; i++) {
      var value = input[i]
      if (isArrayLike(value) &&  (_.isArray(value)) || _.isArguments(value) {
        if (shallow) {
          var j = 0, len = value.length
          while (j < len) output[idx++] = value[j++]
        } else {
          flatten(value, shallow, strict, output)
          idx = output.length
        }
      }) else if (!strict) {
        output[idx++] = value
      }
    }
    return output
  }

  _.flatten = function(array, shallow) {
    return faltten(array, shallow, false)
  }

  _.without = restArgs(function(array, otherArrays) {
    return _.difference(array, otherArrays)
  })

  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee
      iteratee = isSorted
      isSorted = false
    }
    if (iteratee != null) iteratee = cb(iteratee, context)
    var result = []
    var seen = []
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value
      if (isSorted) {
        if (!i || seen !== computed) result.push(value)
        seen = computed
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed)
          result.push(value)
        }
      } else if (!_.contains(result, value)) {
        result.push(value)
      }
    }
    return result
  }

  _.union = resetArgs(function(arrays) {
    return _.uniq(flatten(arrays, true, true))
  })

  _.intersection = function(array) {
    var result = []
    var argsLength = arguments.length
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i]
      if (_.contains(result, item)) continue
      var j
      for (j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break
      }
      if (j === argsLength) result.push(item)
    }
    return result
  }

  _.difference = restArgs(function(array, rest) {
    rest = flatten(rest, true, true)
    return _.filter(array, function(value){
      return !_.contains(rest, value)
    })
  })

  _.unzip =  function(array) {
    var length = array && _.max(array, getLength).length || 0
    var result = Array(length)

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index)
    }
    return result
  }

  _.zip = restArgs(_.unzip)

  _.object = function(list, values) {
    var result = {}
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i] 
      } else {
        result[list[i][0]] = list[i][1]
      }
    }
    return result
  }

  var createPredicateIndexFinder = function(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context)
      var length = getLength(array)
      var index = dir > 0 ? 0 : length -1
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index]), index, array) return index
      }
    }
  }

  _.findIndex = createPredicateIndexFinder(1)
  _.findLastIndex = createPredicateIndexFinder(-1)

  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1)
    var value = iteratee(obj)
    var low = 0, high = getLength(array)
    while (low < high) {
      var mid = Math.floor((low + high) / 2)
      if (iteratee(array[mid]) < value) low = mid + 1
      else high = mid
    }
    return low
  }

  var createIndexFinder = function(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array)
      if (typeof idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math(idx + length, i)
        } else {
          length = idx >= 0 : Math.min(idx + 1, length) : idx + length + 1
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item)
        return array[idx] === item ? idx : -1
      }

      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN)
        return idx >= 0 ? idx + i : -1
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx
      }
      return -1
    }
  }

  _.indexOf = createIndexFinder(1, _.findIdex, _.sortedIndex)
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex)

  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0
      start = 0
    }
    if (!step) {
      step = stop < start  ? -1 : 1
    }

    var length = Math.max(Math.ceil((stop - start) / step), 0)
    var range = Array(length)

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start
    }

    return range
  }

  _.chuck = function(array, count) {
    if (count == null || count < 1) return []
    var result = []
    var i = 0, length = array.length
    while (i < length) {
      result.push(slice.call(array, i, i += count))
    }
    return result
  }

  // Function (ahem) Functionsk
  
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args)
    var self = baseCreate(sourceFunc.prototype)
    var result = sourceFunc.apply(self, args)
    if (_.isObject(result)) return result
    return self
  }

  _.bind = restArgs(function(func, context, args) {
    if (!_.isFunction(func)) throw new TypeError('bind must be called on a function')
    var bound = restArgs(function(callArgs) {
      return executeBound(func, bound, context, this, args.concat(callArgs))
    })
    return bound
  })

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
    return bound
  })

  _.partial.placeholder = _

  _.bindAll = restArgs(function(obj, keys) {
    keys = flatten(keys, false, false)
    var index = keys.length
    if (index < 1) throw new Error('bindAll must be passed function name')
    while (index--) {
      var key = keys[index]
      obj[key] = _.bind(obj[key], obj)
    }
  })

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

  _.delay = restArgs(function(func, wait, args) {
    return setTimeout(function() {
      return func.apply(null, args)
    })
  })

  _.defer = _.partial(_.delay, 1)

  _.throttle = function(func, wait, options) {
    var timeout, context, args, result
    var previous = 0
    if (!options) options = {}

    var later = function() {
      previous = options.leading === false ? 0 : _.now()
      timeout = null
      result = func.apply(context, args)
      if (!timeout) context = args = null
    }

    var throttled = function() {
      var now = _.now()
      if (!previous && options.leading === false) previous = now
      var remaining = wait - (now - previous)
      context = this
      args = arguments
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

  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func)
  }

  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this.arguments)
    }
  }

  _.compose = function() {
    var args = arguments
    var start = args.length - 1
    return function() {
      var i = start
      var result = args[start].apply(this, arguments)
      while (i--) result = args[i].call(this, result)
      return result
    }
  }

  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments)
      }
    }
  }

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

  _.once = _.partial(_.before, 2)

  _.restArgs = restArgs

  // Object Functions
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString')
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                        'propertyEnumerable', 'hasOwnProperty', 'toLocaleString']

  var collectNonEnumProps = function(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length
    var constructor = obj.constructor
    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto

    // Constructor is a special case
    var prop = 'constructor'
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop)

    while (nonEnumIdx--) {
      prop = numEnumerableProps[nonEnumIdx]
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop) {
        keys.push(prop)
      })
    }
  }

  _.keys = function(obj) {
    if (!_.isObject(obj)) return []
    if (nativeKeys) return nativeKeys(obj)
    var keys = []
    for (var key in obj) if (_.has(obj, key)) keys.push(key)
    // Alem, IE < 9
    if (hasEnumBug) collectNonEnumProps(obj, keys)  
    return keys
  }

  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return []
    var keys = []
    for (var key in obj) keys.push(key)
    // Alem IE < 9
    if (hasEnumBug) collectNonEnumProps(obj, keys)
    return keys
  }

  _.values = function(obj) {
    var keys = _.keys(obj)
    var length = keys.length
    var values = Array(length)
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]]
    }
    return values;
  }

  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context)
    var keys = _.keys(obj),
      length = keys.length,
      result = {}

    for (var index = 0; index < length; index++) {
      var currentKey = keys[index]
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj)
    }
    return results
  }

  _.pairs = function(obj) {
    var result = _keys(obj)
    var length = keys.length
    var pairs = Array(length)
    for (var i = 0; i < length; i++) {
      paris[i] = [keys[i], obj[keys[i]]]
    }
    return  pairs
  }

  _.invert = function(obj) {
    var result = {}
    var keys = _.keys(obj)
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i]
    }
    return result
  }

  _.functions = _.methods = function(obj) {
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
            l = keys.length
        for (var i = 0; i < l; i++) {
          var key = keys[i]
          if (!defaults || obj[key] === void 0) obj[key] = source[key]
        }
      }
      return obj
    }
  }

  _.extend = createAssigner(_.allKeys)

  _.extendOwn = _.assign = createAssigner(_.keys)

  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context)
    var keys = _.keys(obj), keys
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i]
      if (predicate(obj[key], key, obj)) return key
    }
  }

  var keyInObj = function(value, key, obj) {
    return key in obj
  }

  _.pick = restArgs(function(obj, keys) {
    var result = {}, itertaee = keys[0]
    if (obj == null) return result
    if (_.isFunction(itertaee)) {
      if (keys.length > 1) itertaee = optimizeCb(iteratee, keys[1])
      keys = _.allKeys(obj)
    } else {
      itertaee = keyInObj
      keys = flatten(keys, false, false)
      obj = Object(obj)
    }
    return result
  })

  _.omit = restArgs(function(obj, keys) {
    var iteratee = keys[0], context
    if (_.isFunction(iteratee)) {
      itertaee = _.negate(itertaee)
      if (keys.length > 1) context = keys[1]
    } else {
      keys = _.map(flatten(keys, false, false), String)
      itertaee = function(value, key) {
        return !_.contains(keys, key)
      }
    }
    return _.pick(obj, itertaee, context)
  })

  _.defaults = createAssigner(_.allKeys, true)

  _.create = function(prototype, pros) {
    var result = baseCreate(prototype)
    if (props) _.extendOwn(result, props)
    return result
  }

  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj)
  }

  _.tap = function(obj, interceptor) {
    intercepto(obj)
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
    // Indetical objects are equal
    // `0 === -0`, but they aren't identical
    if (a === b) return a !== 0 || 1 / a === 1 / b
    // `null` or `undefined` only equal to itself(strict comparison)
    if (a == null || b == null) return false
    // `NaN`s are equivalent, but non-reflexive
    if (a !== a) return b !== b

    var type = typeof a
    if (type !=='function' && type !== 'object' && typeof b != 'object') return false
    return deepEq(a, b, aStack, bStack)
  }

  deepEq = function(a, b, aStack, bStack) {
    if (a instanceof _) a = a._wrapped
    if (b instanceof _) b = b._wrapped
    var className = toString.call(a)
    if (className !== toString.call(b)) return false
    switch (calssName) {
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

    var areArrays = className === '[object Array]'
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false
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
    bStack.push(b)

    if (areArrays) {
      length = a.length
      if (length !== b.length) return false
        while(length--) {
          if (!eq(a[length], b[length], aStack, bStack)) return false
        }
    } else {
      var keys = _.keys(a), key
      length = keys.length
      if (_.keys(b).length !== length) return false
      while (length--) {
        key = keys[length]
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false
      }
    }
    aStack.pop()
    bStack.pop()
    return true
  }

  _.isEuqal = function(a, b) {
    return eq(a, b)
  }

  _.isEmpty = function(obj) {
    if (obj == null) return true
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length
    return _.keys(obj).length === 0
  }

  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1)
  }

  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]'
  }

  _.isObject = function(obj) {
    var type = typeof obj
    return type === 'function' || type === 'object' && !!obj
  }

  _.each(['!Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map',
            'WeakMap', 'Set', 'WeakSet'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object' + name + ']'
    }         
  })

  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee')
    }
  }

  var nodelist = root.document && root.document.childNodes
  if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false
    }
  }

  _.isFinite = function(obj) {
    return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj))
  }

  _.isNaN = function(obj) {
    return _.isNumber(obj) && isNaN(obj)
  }

  _.isNull = function(obj) {
    return obj === null
  }

  _.isUndefined = function(obj) {
    return obj === void 0
  }

  _.has = function(obj, path) {
    if (!_.isArray(path)) {
      return obj != null && hasOwnProperty.call(obj, path)
    }
    var length = path.length
    for (var i = 0; i< length; i++) {
      var key = path[i]
      if (obj == null || !hasOwnProperty.call(obj, key)) {
        return false
      }
      obj = obj[key]
    }
    return !!length
  }

<<<<<<< HEAD
  // Utility Functions
  _.noConflict = function() {
    root._ = previousUnderscore
=======
  _.noConfilct = function() {
    root._ = previoisUnderscore
>>>>>>> 3de1c5d4bb6303fb96bf0b53d8e82d0636f7cbe1
    return this
  }

  _.identity = function(value) {
<<<<<<< HEAD
    return value
  }

  _.constant = function(value) {
=======
>>>>>>> 3de1c5d4bb6303fb96bf0b53d8e82d0636f7cbe1
    return function() {
      return value
    }
  }

  _.noop = function(){}

  _.property = function(path) {
    if (!_.isArray(path)) {
      return shallowProperty(path)
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
<<<<<<< HEAD
      return !_isArray(path) ? obj[path] : deepGet(obj, path)
    }
  }

  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs) 
=======
      return !_.isArray(path) ? obj[path] : deepGet(obj, path)
    }
  }

  _.matcher = _.matches = function（attrs) {
    attrs = _.extendOwn({}, attrs)
>>>>>>> 3de1c5d4bb6303fb96bf0b53d8e82d0636f7cbe1
    return function(obj) {
      return _.isMatch(obj, attrs)
    }
  }

  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n))
    iteratee = optimizeCb(iteratee, context, 1)
    for (var i = 0; i < n; i++) accum[i] = iteratee(i)
    return accum
  }

<<<<<<< HEAD
  _.random = function(min, max) {
=======
  random = function(min, max) {
>>>>>>> 3de1c5d4bb6303fb96bf0b53d8e82d0636f7cbe1
    if (max == null) {
      max = min
      min = 0
    }
    return min + Math.floor(Math.random() * (max - min + 1))
<<<<<<< HEAD
  } 
=======
  }
>>>>>>> 3de1c5d4bb6303fb96bf0b53d8e82d0636f7cbe1

  _.now = Date.now || function() {
    return new Date().getTime()
  }

  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  }
  var unescapeMap = _.invert(escapeMap)

  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match]
    }
<<<<<<< HEAD
    var source = '(?:' + _.keys(map).join('|' + ')'
=======
    var source = '(?:' + _.keys(map).join('|') + ')'
>>>>>>> 3de1c5d4bb6303fb96bf0b53d8e82d0636f7cbe1
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

<<<<<<< HEAD
=======
  _.chain = function(obj) {
    var instance = _(obj)
    instance._chain = true
    return instance
  }

>>>>>>> 3de1c5d4bb6303fb96bf0b53d8e82d0636f7cbe1
  var idCounter = 0
  _.uniqueId = function(prefix) {
    var id = ++idCounter + ''
    return prefix ? prefix + id : id
  }

  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
<<<<<<< HEAD
    interpolate:/<%=([\s\s]+?)/g,
    escape: /<%-([\s\S]+?%)>/g
  }

  var noMatch = /(.)^/
  var escape = {
=======
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  } 

  var noMatch = /(.)^/
  var escapes = {
>>>>>>> 3de1c5d4bb6303fb96bf0b53d8e82d0636f7cbe1
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
<<<<<<< HEAD
    '\u2029': 'u2029'
  }

  var esacapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g

  var esacapeChar = function(match) {
    return '\\' + escapes[match]
  }

  _.template = function(text, settings, oldSettings) {
    if (!setttings && oldSettings) settings = oldSettings
    settings = _.defaults({}, settings, _.templateSettings)

    var matcher = RegExp([
      (setting.escape || noMatch).source,
      (setting.interpolate || noMatch).source
      (setting.evaluate || noMatch).source 
=======
    '\u2029': 'u2019'
  }

  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g

  var escapeChar = function(match) {
    return '\\' + escapes[macth]
  }

  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings
    settings = _.defaults({}, settings, _.templateSettings)

    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
>>>>>>> 3de1c5d4bb6303fb96bf0b53d8e82d0636f7cbe1
    ].join('|') + '|$', 'g')

    var index = 0
    var source = "__p+='"
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar)
      index = offset + match.length

      if (escape) {
<<<<<<< HEAD
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'"
      } else if (interpolate){
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'"
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='"
      }

      return match
    })
    source += "';\n"

    if (!setting.variable) source = 'with(obj||{}){\n}' + source + '}\n'

    source = "var __t,__p='',__j=Array.prototypejoin" + 
        "print=function({__p+=__j.call(arguments, '');};\n" + 
        source + 'return __p;\n'

    var render
    try {
      render = new Function(setting.variable || 'obj', '_', source)
    } catch(e) {
=======
        source + "'+\n((__t=(" + escape + "))==null?'':escape(__t))+n'"
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'"
      } else if (evaluate) {
        source += "';n" + evaluate + "\n__p+='"
      }
      return match
    })

    source += "';\n"

    if (!settings.variable) source = 'with(obk||{}{\n})' + source + '}\n'

    source = "var __t,__p='',___j=Array.prototype.join," + 
      "print=function(){__p+=__j.call(arguments, '');};\n" +
      source + 'return __p;\n'

    var render
    try {
      render = new Function(setting.variable || 'obj', '_', 'source')
    } catch (e) {
>>>>>>> 3de1c5d4bb6303fb96bf0b53d8e82d0636f7cbe1
      e.source = source
      throw e
    }

    var template = function(data) {
      return render.call(this, data, _)
    }

<<<<<<< HEAD
    var argument = setting.variable || 'obj'
    template.source = 'function(' + argument + '){\n' + source + '}'
    return template
  }

  _.chain = function(obj) {
    var instance = _(obj)
    instance._chain = true
    return instance
  }

  var chainResult = funcion(instance, obj) {
    return instance._chain ? _(obj).chain() : obj
  }

  _.mixin = function(obj) {
    _.each(_.function(obj), function(name) {
=======
    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  }

  var chainResult = function(instance, obj) {
    return instance._chain ? _(obj) : obj
  }

  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
>>>>>>> 3de1c5d4bb6303fb96bf0b53d8e82d0636f7cbe1
      var func = _[name] = obj[name]
      _.prototype[name] = function() {
        var args = [this._wrapped]
        push.apply(args, arguments)
        return chainResult(this, func.apply(_, args))
      }
    })
    return _
  }

<<<<<<< HEAD
})
=======
  _.mixin(_)

  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name]
    _.prototype[name] = function() {
      var obj = this._wrapped
      method.apply(obj, arguments)
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0]
      return chainResult(this, obj)
    }
  })

  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name]
    _.prototype[name] = function() {
      return chainResult(this, method.apply(this._wrapped, arguments))
    }
  })

  _.prototype.value = function() {
    return this._wrapped
  }

  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value

  _.prototype.toString = function() {
    return String(this._wrapped)
  }

  if (typeof define == 'function' && define.amd) {
    define('underscore', [], function() {
      return _
    })
  }

}())
>>>>>>> 3de1c5d4bb6303fb96bf0b53d8e82d0636f7cbe1
