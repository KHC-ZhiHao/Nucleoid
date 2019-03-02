/**
 * @class Supports
 * @desc 一些可通用的function
 */

class Supports {
    
    /**
     * @function each(target,callback)
     * @static
     * @desc 各種迴圈適應
     * @callback (data,index|key)
     */
    
    static each(target, callback) {
        if (Array.isArray(target)) {
            var len = target.length;
            for( let i = 0 ; i < len ; i++){
                var br = callback(target[i], i)
                if( br === "_break" ){ break }
                if( br === "_continue" ){ continue }
            }
            return
        }
        let type = typeof target
        if (type === "object") {
            for( let key in target ){
                var br = callback( target[key], key )
                if( br === "_break" ){ break }
                if( br === "_continue" ){ continue }
            }
            return
        }
        if (type === 'number') {
            for (let i = 0; i < target; i++) {
                var br = callback(i,i)
                if( br === "_break" ){ break }
                if( br === "_continue" ){ continue }
            }
            return
        }
        Supports.systemError("Supports", "each", "Each only support object, array, number.", target);
    }

    /**
     * @function systemError
     * @static
     * @desc 執出錯誤訊息
     */

    static systemError(name, functionName, message, object = '$_no_error'){
        if (object !== '$_no_error') {
            console.log('error data => ', object )
        }
        throw new Error(`(☉д⊙)!! Nucleoid::${name} => ${functionName} -> ${message}`)
    }

    /**
     * @function deepClone(obj)
     * @static
     * @desc 深拷貝一個物件，並回傳此物件
     */

    static deepClone(obj, hash = new WeakMap()) {
        if (Object(obj) !== obj) {
            return obj
        }
        if (obj instanceof Set) {
            return new Set(obj)
        }
        if (hash.has(obj)) {
            return hash.get(obj)
        }
        const result = obj instanceof Date ? new Date(obj) : obj instanceof RegExp ? new RegExp(obj.source, obj.flags) : Object.create(null)
        hash.set(obj, result)
        if (obj instanceof Map) {
            Array.from(obj, ([key, val]) => {
                result.set(key, Supports.deepClone(val, hash))
            })
        }
        return Object.assign(result, ...Object.keys(obj).map((key) => {
            return ({
                [key]: Supports.deepClone(obj[key], hash)
            })
        }))
    }

    /**
     * @function inspect()
     * @static
     * @desc 移除迴圈結構的物件
     */

    static inspect(target, used = []) {
        if (target == null) {
            return null
        }
        let output = Array.isArray(target) ? [] : {}
        for (let key in target) {
            let aims = target[key]
            let type = typeof aims
            if (type === 'function') {
                continue
            } else if (type === 'object') {
                let newUsed = [target].concat(used)
                if (newUsed.includes(aims)) {
                    output[key] = 'Circular structure object.'
                } else {
                    output[key] = Supports.inspect(aims, newUsed)
                }
            } else {
                output[key] = aims
            }
        }
        return output
    }

    static getAllPrototype(target) {
        let prototypes = []
        if (target.prototype) {
            prototypes = Object.getOwnPropertyNames(target.prototype)
        }
        if (target.__proto__) {
            prototypes = prototypes.concat(Supports.getAllPrototype(target.__proto__))
        }
        return prototypes.filter((text, index, arr) => {
            return arr.indexOf(text) === index && text !== 'constructor'
        })
    }

}