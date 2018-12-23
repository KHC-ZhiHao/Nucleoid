/**
 * @class Gene(name)
 * @desc 建立貯列模板與生命週期，為整體流程控制的最高物件
 */

class Gene extends ModuleBase {

    constructor(name){
        super("Gene")
        this.setName(name || 'no name')
        this.templates = []
        this.genetic = null
        this.mode = {
            timeout: null,
            traceBase: null,
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
            this.$systemError('setName', 'Name not a string.', name)
        }
    }

    /**
     * @function setTraceBaseMode(enable,action)
     * @desc 鹼基追蹤模式，將每個template的鹼基變化紀錄下來，注意!這功能將強暴你的效能!
     * @param {function} action (cloneBase, nowStatus)
     */

    setTraceBaseMode(enable, action) {
        if (typeof enable === "boolean" && typeof action === "function") {
            if (enable) {
                this.mode.traceBase = { action }
            }
        } else {
            this.$systemError('setTraceBaseMode', 'Params type error. try setTraceBaseMode(boolean, function)')
        }
    }

    /** 
     * @function setTimeoutMode(enable,millisecond,action)
     * @desc 設定逾時事件
     * @param {function} action (base, exit, fail)
     */

    setTimeoutMode(enable, millisecond, action) {
        if (typeof enable === "boolean" && typeof millisecond === "number" && typeof action === "function") {
            if (enable) {
                this.mode.timeout = { action, millisecond }
            }
        } else {
            this.$systemError('setTimeout', 'Params type error. try setTimeoutMode(boolean, number, function)')
        }
    }

    /** 
     * @function setCatchExceptionMode(enable,action)
     * @desc 設定捕捉Exception模式
     * @param {function} action (base, exception, exit, fail)
     */

    setCatchExceptionMode(enable, action){
        if (typeof enable === "boolean" && typeof action === "function") {
            if (enable) {
                this.mode.catchException = { action }
            }
        } else {
            this.$systemError('setCatchExceptionMode', 'Params type error, try setCatchExceptionMode(boolean, function).')
        }
    }

    /**
     * @function setCatchUncaughtExceptionMode(enable,action)
     * @desc 設定捕捉未捕獲Exception模式
     * @param {function} action (base, exception, exit, fail)
     */

    setCatchUncaughtExceptionMode(enable, action) {
        if (typeof enable === "boolean" && typeof action === "function") {
            if (enable) {
                this.mode.catchUncaughtException = { action }
            }
        } else {
            this.$systemError('setCatchUncaughtException', 'Params type error, try setCatchUncaughtException(boolean, function).')
        }
    }

    /**
     * @function setGenetic(callback)
     * @desc 設定遺傳，callback必須回傳一個物件，他將在你執行transcription時將回傳的值賦予base中
     */

    setGenetic(callback){
        if (typeof callback === "function") {
            this.genetic = callback
        } else {
            this.$systemError('setGenetic', 'Params type error, try setGenetic(callback).')
        }
    }

    /**
     * @function template(name,action)
     * @desc 加入一個貯列模版，他將在執行transcription時依宣告順序執行
     */

    template(name, action) {
        if( typeof name === 'string' && typeof action === 'function' ){
            this.templates.push({ name, action })
        } else {
            this.$systemError('template', 'Params type error, try template(string, function).')
        }
    }

    /** 
     * @function setInitiation(initiation)
     * @desc 設定啟動事件，此事件猶如定義為一個template，必須宣告next才能繼續運行
     * @param {function} initiation (base, skill, next, exit, fail)
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
     * @desc 設定延長事件，自動過渡，沒有next也無法處裡非同步資源
     * @param {function} elongation (base, exit, fail)
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
     * @param {function} termination (base, rootStatus)
     */

    setTermination(termination) {
        if( typeof termination === 'function' ){
            this.synthesis.termination = termination
        }else{
            this.$systemError('setTermination', 'Params type error, try setTermination(function).' );
        }
    }

    /** 
     * @function transcription()
     * @desc 執行系統，不論錯誤或成功皆會回傳一個Messenger物件
     * @returns {Promise}
     */

    transcription() {
        return new Promise((resolve, reject) => {
            new Transcription(this, resolve, reject)
        })
    }

}
