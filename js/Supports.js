class Supports {
    
    /**
     * @function each(target,callback)
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
     * @description 執出錯誤訊息
     */

    static systemError(name, functionName, message, object = '$_no_error'){
        if (object !== '$_no_error') {
            console.log('error data => ', object )
        }
        throw new Error(`(☉д⊙)!! Nucleoid::${name} => ${functionName} -> ${message}`)
    }

}