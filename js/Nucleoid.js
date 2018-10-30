/**
 * @class Nucleoid()
 * @desc 核心
 */

class Nucleoid extends ModuleBase {

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
        this.setName('No name');
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
            this.messenger[key] = value
        } else {
            this.systemError('addMessenger', 'Messenger key already exists.', key );
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

    transcription(trymode = false){
        this.transcription = function(){
            console.warn(`Nucleoid(${this.name}) => Transcription already called.`)
        }
        if( trymode ){
            this.trymode = trymode
        }
        return new Promise(( resolve )=>{
            new Transcription( this, resolve )
        })
    }

}
