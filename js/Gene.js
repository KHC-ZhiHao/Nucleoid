class Gene extends ModuleBase {

    constructor(name){
        super("Gene");
        this.setName(name || 'no name');
        this.root = new Root(this.name)
        this.templates = []
        this.polymerase = {
            messenger: {},
            protection : {}
        }
        this.mode = {
            timeout: null,
            catchException: null,
            catchUncaughtException: null
        }
        this.synthesis = {
            initiation: null,
            elongation: null,
            termination: null
        }
    }

    /**
     * @function setName(name)
     * @desc 設定名稱
     */

    setName(name){
        if( typeof name === "string" ){
            this.name = name;
        } else {
            this.$systemError( 'setName', 'Name not a string.', name );
        }
    }

    /** 
     * @function setTimeoutMode(enable,millisecond,action)
     * @desc 設定逾時事件
     */

    setTimeoutMode(enable, millisecond, action) {
        if (typeof enable === "boolean" && typeof millisecond === "number" && typeof action === "function") {
            if (enable) {
                this.mode.timeout = { action, millisecond }
            }
        } else {
            this.$systemError( 'setTimeout', 'Params type error. try setTimeoutMode(boolean, number, function)' );
        }
    }

    /** 
     * @function setCatchExceptionMode(enable,action)
     * @desc 設定捕捉Exception模式
     */

    setCatchExceptionMode( enable, action ){
        if (typeof enable === "boolean" && typeof action === "function") {
            if (enable) {
                this.mode.catchException = { action }
            }
        } else {
            this.$systemError('setCatchExceptionMode', 'Params type error, try setCatchExceptionMode(boolean, function).')
        }
    }

    /**
     * @function setCatchUncaughtException(enable,action)
     * @desc 設定捕捉未捕獲Exception模式
     */

    setCatchUncaughtException( enable, action ) {
        if (typeof enable === "boolean" && typeof action === "function") {
            if (enable) {
                this.mode.catchUncaughtException = { action }
            }
        }else{
            this.$systemError('setCatchUncaughtException', 'Params type error, try setCatchUncaughtException(boolean, function).')
        }
    }

    /**
     * @function addMessenger(key,value)
     * @desc 加入一個全域屬性
     */

    addMessenger( key, value ){
        if( this.polymerase.messenger[key] == null ){
            if( key.slice(0, 1) === "$" ){
                this.$protection(this.polymerase.messenger, key, this.polymerase.protection, value)
            } else {
                this.polymerase.messenger[key] = value
            }
        } else {
            this.$systemError('addMessenger', 'Messenger key already exists.', key );
        }
    }

    /**
     * @function template(name,action)
     * @desc 加入一個貯列模板
     */

    template( name, action ) {
        if( typeof name === 'string' && typeof action === 'function' ){
            this.templates.push({ name, action })
        } else {
            this.$systemError( 'template', 'Params type error, try template(string, function).' );
        }
    }

    /** 
     * @function setInitiation(initiation)
     * @desc 設定啟動事件
     */

    setInitiation(initiation) {
        if( typeof initiation === 'function' ){
            this.synthesis.initiation = initiation
        }else{
            this.$systemError('setInitiation', 'Params type error, try setInitiation(function).' )
        }
    }

    /** 
     * @function setElongation(elongation)
     * @desc 設定延長事件
     */

    setElongation(elongation) {
        if( typeof elongation === 'function' ){
            this.synthesis.elongation = elongation
        }else{
            this.$systemError('setElongation', 'Params type error, try setElongation(function).' )
        }
    }

    /** 
     * @function setTermination(termination)
     * @desc 設定結束事件
     */

    setTermination(termination) {
        if( typeof termination === 'function' ){
            this.synthesis.termination = termination
        }else{
            this.$systemError('setTermination', 'Params type error, try setTermination(function).' );
        }
    }

    /** 
     * @function translation()
     * @desc 執行系統
     * @returns {Promise}
     */

    translation() {
        return new Promise((resolve, reject) => {
            this.root.install()
            new Translation(this, resolve, reject)
        })
    }

}
