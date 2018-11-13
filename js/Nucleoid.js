/**
 * @class Nucleoid()
 * @desc 核心
 */

class Nucleoid extends ModuleBase {

    /**
     * @member {object} _protection 保護變數，他不會被外部的變數給覆蓋到
     */

    constructor(){
        super("Nucleoid");
        this.genes = [];
        this.trymode = false;
        this.trymodeError = null;
        this.timeout = 3600;
        this.timeoutError = null;
        this.promoter = null;
        this.mediator = null;
        this.terminator = null;
        this.messenger = {};
        this.methods = {};
        this._protection = {};
        this.setName('No name');
    }

    static eat( groupName, { template } ) {
        if( template ){
            MethodBucket.regsterGroup( groupName, template );
        } else {
            this.systemError('eat', 'Template not found.')
        }
    }

    static regsterMethod( name, method ) {
        MethodBucket.regster(name, method);
    }

    static hasMethod(name){
        return !!MethodBucket.pool[name]
    }

    /**
     * @function setName(name)
     * @desc 設定名稱
     */

    setName(name){
        if( typeof name === "string" ){
            this.name = name;
        } else {
            this.systemError( 'setName', 'Name not a string.', name );
        }
    }

    /** 
     * @function setTimeout(time,error)
     * @desc 設定逾時事件
     */

    setTimeout( timeout, error ){
        if( typeof timeout === "number" && typeof error === "function" ){
            this.timeout = timeout;
            this.timeoutError = error;
        } else {
            this.systemError( 'setTimeout', 'Params type error. try setTimeout(number, function)' );
        }
    }

    /** 
     * @function setTrymode(open,error)
     * @desc 設定try-catch模式
     */

    setTrymode( open, error ){
        if( typeof open === "boolean" && ( typeof error === "function" || error == null ) ){
            this.trymode = open;
            this.trymodeError = error;
        } else {
            this.systemError( 'setTrymode', 'Params type error, try setTrymode(boolean, function).' );
        }
    }

    /**
     * @function addMessenger(key,value,force)
     * @desc 加入一個全域屬性
     * @param {boolean} force 預設屬性會防止被重複宣告，設定force為true強制取代
     */

    addMessenger( key, value, force = false ){
        if( this.messenger[key] == null || force === true ){
            if( key.slice(0, 1) === "$" ){
                this._protection[key] = value
                Object.defineProperty( this.messenger, key, {
                    set: ()=>{
                        this.systemError('addMessenger', "This key is a private key, can't be change.", key );
                    },
                    get: ()=>{
                        return this._protection[key];
                    },
                })
            } else {
                this.messenger[key] = value
            }
        } else {
            this.systemError('addMessenger', 'Messenger key already exists.', key );
        }
    }

    /**
     * @function use(name)
     * @desc 使用一個以註冊的方法
     */

    use(name){
        if( this.methods[name] == null ){
            this.methods[name] = MethodBucket.use(name)
        } else {
            this.systemError('use', 'Method already exists.', name );
        }
    }

    /**
     * @function queue(name,action)
     * @desc 加入一個貯列
     */

    queue( name, action ){
        if( typeof name === 'string' ){
            if( typeof action === 'function' ){
                this.genes.push({
                    name : name,
                    action : action,
                });
            }else{
                this.systemError( 'queue', 'Action not a function.', action );
            }
        } else {
            this.systemError( 'queue', 'Name not a string.', name );
        }
    }

    /** 
     * @function setPromoter(promoter)
     * @desc 設定啟動事件
     */

    setPromoter(promoter){
        if( typeof promoter === 'function' ){
            if( this.promoter == null ){
                this.promoter = promoter;
            } else {
                this.systemError('setPromoter', 'Promoter already exists.', this.promoter );
            }
        }else{
            this.systemError('setPromoter', 'Promoter not a function.', promoter );
        }
    }

    /** 
     * @function setMediator(mediator)
     * @desc 設定中介事件
     */

    setMediator(mediator){
        if( typeof mediator === 'function' ){
            if( this.mediator == null ){
                this.mediator = mediator;
            } else {
                this.systemError('setPromoter', 'Promoter already exists.', this.mediator );
            }
        }else{
            this.systemError('setMediator', 'Mediator not a function.', mediator );
        }
    }

    /** 
     * @function setTerminator(terminator)
     * @desc 設定結束事件
     */

    setTerminator(terminator){
        if( typeof terminator === 'function' ){
            if( this.terminator == null ){
                this.terminator = terminator;
            } else {
                this.systemError('setTerminator', 'Terminator already exists.', this.terminator );
            }
        }else{
            this.systemError('setTerminator', 'Terminator not a function.', terminator );
        }
    }

    /** 
     * @function transcription()
     * @desc 執行系統
     * @returns {Promise}
     */

    transcription(){
        this.transcription = function(){
            console.warn(`Nucleoid(${this.name}) => Transcription already called.`)
        }
        return new Promise(( resolve )=>{
            new Transcription( this, resolve )
        })
    }

}
