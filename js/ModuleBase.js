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

    $systemError( functionName, message, object = '$_no_error' ){
        if( object !== '$_no_error' ){
            console.log( `%c error object is : `, 'color:#FFF; background:red' );
            console.log( object );
        }
        throw new Error( `(☉д⊙)!! Nucleoid::${this.$moduleBase.name} => ${functionName} -> ${message}` );
    }

    $noKey( functionName, target, key ) {
        if( target[key] == null ){
            return true;
        } else {
            this.$systemError( functionName, 'Name already exists.', key );
            return false;
        } 
    }

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

    $protection(object, key, getter, value) {
        getter[key] = value
        Object.defineProperty( object, key, {
            set: ()=>{
                this.$systemError('protection', "This key is a private key, can't be change.", key );
            },
            get: ()=>{
                return getter[key];
            },
        })
    }

}

class Case {}