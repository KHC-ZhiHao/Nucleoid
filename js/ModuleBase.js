/**
 * @class ModuleBase()
 * @desc 系統殼層
 */

class ModuleBase {

    constructor(name){
        this.baseName = name;
    }

    /**
     * @function systemError(functionName,maessage,object)
     * @desc 於console呼叫錯誤，中斷程序並顯示錯誤的物件
     */

    systemError( functionName, message, object = '$_no_error' ){
        if( object !== '$_no_error' ){
            console.log( `%c error object is : `, 'color:#FFF; background:red' );
            console.log( object );
        }
        throw new Error( `(☉д⊙)!! Nucleoid::${this.baseName} => ${functionName} -> ${message}` );
    }

    noKey( functionName, target, key ) {
        if( target[key] == null ){
            return true;
        } else {
            this.systemError( functionName, 'Name already exists.', key );
            return false;
        } 
    }

    verify(data, validate) {
        let newData = {}
        for( let key in validate ){
            let v = validate[key];
            if( v[0] && data[key] == null ){
                this.systemError('verify', 'Must required', key);
                return;
            }
            if( data[key] ){
                if( typeof v[1] === typeof data[key] ){
                    newData[key] = data[key];
                } else {
                    this.systemError('verify', `Type(${typeof v[1]}) error`, key);
                }
            } else {
                newData[key] = v[1];
            }
        }
        return newData;
    }

}

class Case {}