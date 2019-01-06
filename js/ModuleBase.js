/**
 * @class ModuleBase()
 * @desc 系統殼層
 */

class ModuleBase {

    constructor(name){
        this.$moduleBase = { 
            name: name || 'no name'
        };
    }

    /**
     * @function $systemError(functionName,maessage,object)
     * @desc 於console呼叫錯誤，中斷程序並顯示錯誤的物件
     */

    $systemError(functionName, message, object = '$_no_error'){
        if( object !== '$_no_error' ){
            console.log( `%c error : `, 'color:#FFF; background:red' )
            console.log( object )
        }
        throw new Error(`(☉д⊙)!! Nucleoid::${this.$moduleBase.name} => ${functionName} -> ${message}`)
    }

    /**
     * @function $noKey(functionName,target,key)
     * @desc 檢查該物件是否含有key
     * @returns {boolean} 如果沒有，回傳true，如果有則報錯
     */

    $noKey( functionName, target, key ) {
        if (target[key] == null) {
            return true;
        } else {
            this.$systemError( functionName, 'Name already exists.', key );
            return false;
        } 
    }

    /**
     * @function $verify(data,validate,assign)
     * @desc 驗證並返為一個新的物件，並在空屬性中賦予預設屬性
     * @param {object} data 驗證目標
     * @param {object} validate 驗證物件，value是一個array，內容是[require,default]
     * @param {object} assign 返回的物件與指定物件合併
     */

    $verify(data, validate, assign = {}) {
        let newData = {}
        for( let key in validate ){
            let v = validate[key];
            if( v[0] && data[key] == null ){
                this.$systemError('verify', 'Must required', key);
                return;
            }
            if( data[key] ){
                if( typeof v[1] === (typeof data[key] === 'string' && data[key][0] === "#") ? data[key].slice(1) : 'string' ){
                    newData[key] = data[key];
                } else {
                    this.$systemError('verify', `Type(${typeof v[1]}) error`, key);
                }
            } else {
                newData[key] = v[1];
            }
        }
        return Object.assign(newData, assign);
    }

    /**
     * @function $protection(object,key,getter,value)
     * @desc 建立一個保護變數
     * @param {object} object 保護變數必須要有一個目標物件
     * @param {string} key 為目標物建立一個key
     * @param {object} getter 這個保護變數被存入的外部物件
     * @param {any} value 變數值
     */

    $protection(object, key, getter, value) {
        getter[key] = value
        Object.defineProperty( object, key, {
            set: ()=>{
                this.$systemError('protection', "This key is a private key, can't be change.", key );
            },
            get: ()=>{
                return getter[key]
            },
        })
    }

}

class Case {}
