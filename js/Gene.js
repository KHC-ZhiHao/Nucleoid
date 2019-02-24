/**
 * @class Gene(name)
 * @desc 建立貯列模板與生命週期，為整體流程控制的最高物件
 */

class Gene extends ModuleBase {

    constructor(name, options){
        super("Gene")
        this.setName(name || 'no name')
        this.mode = (new Mode()).exports()
        this.alias = null
        this.templates = []
        this.setOptions(options)
    }

    get name() {
        return this.mainName + (this.alias || '')
    }

    /**
     * @function setOptions(options)
     * @desc 當實體化時帶有options時，執行設定動作
     */

    setOptions(options = {}) {
        if (typeof options !== 'object') {
            this.$systemError('setOptions', 'Options not a object.', options)
        }
        if (options.timeoutMode) {
            this.mode.set('timeout', options.timeoutMode)
        }
        if (options.catchMode) {
            this.mode.set('try-catch-mode', options.catchMode)
        }
        if (options.uncaughtCatchMode) {
            this.mode.set('uncaught-exception-mode', options.uncaughtCatchMode)
        }
        if (options.traceBaseMode) {
            this.mode.set('trace-base-mode', options.traceBaseMode)
        }
        if (options.initiation) {
            this.mode.set('initiation', options.initiation)
        }
        if (options.elongation) {
            this.mode.set('elongation', options.elongation)
        }
        if (options.termination) {
            this.mode.set('termination', options.termination)
        }
        if (options.genetic) {
            this.mode.set('genetic', options.genetic)
        }
        if (options.templates) {
            this.cloning(options.templates)
        }
    }

    /**
     * @function addName
     * @desc 名稱尾端追加名稱，會一直疊加下去
     */

    addName(name) {
        if (typeof name === "string") {
            this.mainName += '-' + name
        } else {
            this.$systemError('addName', 'Name not a string.', name)
        }
    }

    /**
     * @function setName(name)
     * @desc 設定名稱
     */

    setName(name) {
        if (typeof name === "string") {
            this.mainName = name
        } else {
            this.$systemError('setName', 'Name not a string.', name)
        }
    }

    /**
     * @function setAlias(alias)
     * @desc 設定別名
     */

    setAlias(alias) {
        if (typeof alias === "string") {
            this.alias = '-' + alias
        } else {
            this.$systemError('setAlias', 'Name not a string.', alias)
        }
    }

    /**
     * @function setTraceBaseMode(enable,action,options)
     * @desc 鹼基追蹤模式，將每個template的鹼基變化紀錄下來，這功能將吞噬你的效能，僅適用於測試
     * @param {function} action (cloneBase, nowStatus)
     */

    setTraceBaseMode(enable, action, options = {}) {
        this.mode.set('trace-base-mode', { enable, action, ...options })
    }

    /** 
     * @function setTimeoutMode(enable,ms,action,options)
     * @desc 設定逾時事件
     * @param {function} action (base, exit, fail)
     */

    setTimeoutMode(enable, ms, action, options = {}) {
        this.mode.set('timeout', { enable, ms, action, ...options })
    }

    /** 
     * @function setCatchExceptionMode(enable,action,options)
     * @desc 設定捕捉Exception模式，這功能將吞噬你的效能，僅適用於測試
     * @param {function} action (base, exception, exit, fail)
     */

    setCatchExceptionMode(enable, action, options = {}){
        this.mode.set('try-catch-mode', { enable, action, ...options })
    }

    /**
     * @function setCatchUncaughtExceptionMode(enable,action,options)
     * @desc 設定捕捉未捕獲Exception模式
     * @param {function} action (base, exception, exit, fail)
     */

    setCatchUncaughtExceptionMode(enable, action, options = {}) {
        this.mode.set('uncaught-exception-mode', { enable, action, ...options })
    }

    /**
     * @function setGenetic(callback,options)
     * @desc 設定遺傳，callback必須回傳一個物件，他將在你執行transcription時將回傳的值賦予base中
     */

    setGenetic(action, options = {}){
        this.mode.set('genetic', { enable: true, action, ...options })
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
     * @function setInitiation(action,options)
     * @desc 設定啟動事件，此事件猶如定義為一個template，必須宣告next才能繼續運行
     * @param {function} initiation (base, skill, next, exit, fail)
     */

    setInitiation(action, options = {}) {
        this.mode.set('initiation', { enable: true, action, ...options })
    }

    /** 
     * @function setElongation(action,options)
     * @desc 設定延長事件，自動過渡，沒有next也無法處裡非同步資源
     * @param {function} elongation (base, exit, fail)
     */

    setElongation(action, options = {}) {
        this.mode.set('elongation', { enable: true, action, ...options })
    }

    /** 
     * @function setTermination(action,options)
     * @desc 設定結束事件
     * @param {function} termination (base, rootStatus)
     */

    setTermination(action, options = {}) {
        this.mode.set('termination', { enable: true, action, ...options })
    }

    /** 
     * @function cloning(templates)
     * @desc 複用template的接口
     */

    cloning(templates) {
        if (typeof templates === 'object') {
            for (let key in templates) {
                if (typeof templates[key] === 'function') {
                    this.template(key, templates[key])
                } else {
                    this.$systemError('cloning', 'template data not a function.', key)
                }
            }
        } else {
            this.$systemError('cloning', 'Template not a object.' );
        }
    }

    /** 
     * @function clearTemplate()
     * @desc 清空模板
     */

    clearTemplate() {
        this.templates = []
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
