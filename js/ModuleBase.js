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

    systemError( functionName, message, object ){
        if( object ){
            console.log( `%c error object is : `, 'color:#FFF; background:red' );
            console.log( object );
        }
        throw new Error( `(☉д⊙)!! Nucleoid::${this.baseName} => ${functionName} -> ${message}` );
    }

}
