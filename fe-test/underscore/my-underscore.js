(function() {
  var root = typeof self == 'object' && sef.self === self && self ||
    typeof global == 'object' && global.global === global && global ||
    this || {} // @todo

  var previousUnderscore = root._

  var ArrayProto = Array.prototype,
    ObjProto = Object.prototype;
  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null // @todo

  var push = ArrayProto.push,
    slice = ArrayProto.slice,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty

  var nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeCreate = Object.create

  var Ctor = function() {} // @todo

  var _ = function(obj) { // @todo
    if (obj instanceof _) return obj
    if (!(this instanceof _)) return new _(obj)
    this._wraooed = obj
  }

  if (typeof exports != 'undefined' && !exports.nodeType) { // @todo
    if (typeof module !== 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = _
    }
    exports._ = _
  } else {
    root._ = _
  }

  _.VERSION = 'small dragon'

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

  var cb = function(value, context, argCount) {
    if (_.iteratee !== builtinIteratee) return _.iteratee(value, context)
    if (value == null) return _.identity
    if (_.isFunction(value)) return optimizeCb(value, context, argCount)
    if (_is.Object(value) && !_isArray(value)) return _.matcher(value)
    return _.property(value)
  }

  _.iteratee = builtinIteratee = function(value, context) {
    return cb(value, context, Infinity)
  }

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

  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {}
    if (nativeCreate) return nativeCreate(prototype)
    Ctor.prototype = prototype
    var result = new Ctor
    Ctor.prototype = null
    return result
  }

  var shallowProperty = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key]
    }
  }

  var deepGet = function(obj, path) {
    var length = path.length
    for (var i = 0; i < length; i++) {
      if (obj == null) return void 0
      obj = obj[path[i]]
    }
    return length ? obj : void 0
  }

  var MAX_ARRAY_INDEX = Math.pow(2, 53) -
    var getLength = shallowProperty('length')
  var isArrayLike = function(collection) {
    var length = getLength(collection)
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX
  }

  // CORNERSTONE
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

  var crearerReduce = function(dir) {
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

  _.reduceRight = _.folder = createReduce(-1)

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

  _some = _.any = function(obj, predicate, context) {
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

  _defaults = createAssigner(_.allKeys, true)

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
    }
  }

})