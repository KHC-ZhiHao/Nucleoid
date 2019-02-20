(function (root, factory) {

    let moduleName = 'Nucleoid';

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = factory();
    }
    else if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(function () { return factory; });
    }
    else {
        root[moduleName] = factory();
    }

})(this || (typeof window !== 'undefined' ? window : global), function () {
    class Supports {

        /**
         * @function each(target,callback)
         * @desc 各種迴圈適應
         * @callback (data,index|key)
         */

        static each(target, callback) {
            if (Array.isArray(target)) {
                var len = target.length;
                for (let i = 0; i < len; i++) {
                    var br = callback(target[i], i)
                    if (br === "_break") { break }
                    if (br === "_continue") { continue }
                }
                return
            }
            let type = typeof target
            if (type === "object") {
                for (let key in target) {
                    var br = callback(target[key], key)
                    if (br === "_break") { break }
                    if (br === "_continue") { continue }
                }
                return
            }
            if (type === 'number') {
                for (let i = 0; i < target; i++) {
                    var br = callback(i, i)
                    if (br === "_break") { break }
                    if (br === "_continue") { continue }
                }
                return
            }
            this.systemError("each", "Each only support object, array, number.", target);
        }

    }
    /**
     * @class ModuleBase()
     * @desc 系統殼層
     */

    class ModuleBase {

        constructor(name) {
            this.$moduleBase = {
                name: name || 'no name'
            };
        }

        /**
         * @function $systemError(functionName,maessage,object)
         * @desc 於console呼叫錯誤，中斷程序並顯示錯誤的物件
         */

        $systemError(functionName, message, object = '$_no_error') {
            if (object !== '$_no_error') {
                console.log(`%c error : `, 'color:#FFF; background:red')
                console.log(object)
            }
            throw new Error(`(☉д⊙)!! Nucleoid::${this.$moduleBase.name} => ${functionName} -> ${message}`)
        }

        /**
         * @function $noKey(functionName,target,key)
         * @desc 檢查該物件是否含有key
         * @returns {boolean} 如果沒有，回傳true，如果有則報錯
         */

        $noKey(functionName, target, key) {
            if (target[key] == null) {
                return true;
            } else {
                this.$systemError(functionName, 'Name already exists.', key);
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
            for (let key in validate) {
                let v = validate[key];
                if (v[0] && data[key] == null) {
                    this.$systemError('verify', 'Must required', key);
                    return;
                }
                if (data[key]) {
                    if (typeof v[1] === (typeof data[key] === 'string' && data[key][0] === "#") ? data[key].slice(1) : 'string') {
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
            Object.defineProperty(object, key, {
                set: () => {
                    this.$systemError('protection', "This key is a private key, can't be change.", key);
                },
                get: () => {
                    return getter[key]
                },
            })
        }

    }

    class Case { }

    /**
     * @class PollingEvent(root,options)
     * @desc 輪循的事件單位
     */

    class PollingEvent extends ModuleBase {

        constructor(root, options) {
            super('PollingEvent')
            this.name = options.name
            this.status = new Status(this.name, 'polling')
            this.action = options.action
            this.finish = false
            root.status.addChildren(this.status)
        }

        /**
         * @function activate()
         * @desc 每次輪循呼叫一次action
         */

        activate() {
            this.action(this.close.bind(this))
        }

        /**
         * @function close()
         * @desc 關閉這個事件，他將在下次輪循時被移除
         */

        close() {
            this.status.set(true)
            this.finish = true
        }

    }

    /**
     * @class Fragment(root,name)
     * @desc 建立一個片段，你可以一次加入多個排程，他將會同時進行並等待回傳onload
     */

    class Fragment extends ModuleBase {

        constructor(root, name) {
            super('Fragment')
            this.over = 0
            this.name = name || 'no name'
            this.stop = false
            this.status = new Status(this.name, 'fragment')
            this.thread = []
            root.status.addChildren(this.status)
        }

        /**
         * @function install(callback)
         * @desc 執行activate時初始化
         */

        install(callback) {
            this.callback = (error) => {
                if (error) {
                    this.status.set(false, error)
                } else {
                    this.status.set(true)
                }
                callback(error)
            }
        }

        /**
         * @function use()
         * @desc 建立對外接口
         */

        use() {
            return {
                add: this.add.bind(this),
                eachAdd: this.eachAdd.bind(this),
                activate: this.activate.bind(this)
            }
        }

        /**
         * @function add(options)
         * @public
         * @desc 加入一個排程
         * @param {object} options {name:string, action:function} 
         */

        add(options) {
            this.thread.push(this.$verify(options, {
                name: [true, '#string'],
                action: [true, '#function']
            }))
        }

        /**
         * @function eachAdd(target,name,action)
         * @public
         * @desc 迭代加入frag
         */

        eachAdd(target, name = 'no name', action) {
            Supports.each(target, (data, key) => {
                this.add({
                    name: name + `(${key})`,
                    action: function (error, onload) {
                        action(data, key, error, onload)
                    }
                })
            })
            return this.use()
        }

        /**
         * @function regsterError(status)
         * @desc 註冊每個排程的error事件
         */

        regsterError(status) {
            return (error) => {
                if (this.stop === false) {
                    status.set(false, error)
                    this.stop = true
                    this.callback(error || 'unknown error')
                }
            }
        }

        /**
         * @function regsterOnload(status)
         * @desc 註冊每個排程的onload事件
         */

        regsterOnload(status) {
            return () => {
                status.set(true)
                this.over += 1
                if (this.stop === false) {
                    if (this.over >= this.thread.length) {
                        this.stop = true
                        this.callback()
                    }
                }
            }
        }

        /**
         * @function actionThread(thread)
         * @desc 執行一個排程
         */

        actionThread(thread) {
            let func = async () => {
                let status = new Status(thread.name, 'frag-thread')
                let onload = this.regsterOnload(status)
                let error = this.regsterError(status)
                this.status.addChildren(status)
                thread.action(error, onload)
            }
            func()
        }

        /**
         * @function activate(callback)
         * @public
         * @callback (error,onload)
         */

        activate(callback) {
            let length = this.thread.length
            this.install(callback)
            for (let i = 0; i < length; i++) {
                this.actionThread(this.thread[i])
            }
            if (length === 0) {
                this.callback(null)
            }
            this.activate = () => {
                this.$systemError('activate', `This template(${this.name}) already  called`)
            }
        }

    }

    /**
     * @class Auto(root, options)
     * @desc 建立一個獨立的非同步執行續，在宣告結束前transcription不會結束
     */

    class Auto extends ModuleBase {

        constructor(root, options) {
            super('Auto')
            this.name = options.name || 'No name'
            this.root = root
            this.status = new Status(this.name, 'auto')
            this.action = this.createAction(options.action)
            this.finish = false
            this.init()
        }

        init() {
            this.root.status.addChildren(this.status)
            this.action(this.error.bind(this), this.onload.bind(this))
        }

        createAction(action) {
            if (typeof action !== 'function') {
                this.$systemError('createAction', 'Action not a function', action)
            }
            return async function (error, onload) {
                action(error, onload)
            }
        }

        error(error) {
            this.finish = true
            this.status.set(false, error)
        }

        onload() {
            this.finish = true
            this.status.set(true)
        }

    }
    class Operon extends ModuleBase {

        constructor(options) {
            super('Operon')
            this.data = this.$verify(options, {
                units: [true, {}],
                structure: [false, []]
            })
            this.validate()
        }

        get units() {
            return this.data.units
        }

        validate() {
            if (Array.isArray(this.data.structure) === false) {
                this.$systemError('validate', `Structure not a array.`, this.data.structure)
            }
            for (let key in this.units) {
                let unit = this.units[key]
                if (unit.constructor == null || unit.prototype == null) {
                    this.$systemError('validate', 'Unit not a constructor.', key)
                }
                let prototypes = Object.getOwnPropertyNames(unit.prototype)
                for (let name of this.data.structure) {
                    if (prototypes.includes(name) === false) {
                        this.$systemError('validate', `Property(${name}) not found.`, name)
                    }
                }
            }
        }

        use(name, options) {
            let context = this.createContext(name, options)
            let unit = this.getUnit(name)
            return this.useUnit(unit, context)
        }

        createContext(name, options) {
            return {
                data: options,
                useName: name
            }
        }

        useUnit(unit, context) {
            let target = new unit(context)
            let output = {}
            for (let key of this.data.structure) {
                output[key] = target[key].bind(target)
            }
            return output
        }

        getUnit(name) {
            if (this.data.units[name]) {
                return this.data.units[name]
            } else {
                this.$systemError('getUnit', 'Unit not found.', name)
            }
        }

        exports() {
            return {
                use: this.use.bind(this)
            }
        }

    }

    /**
     * @class Root
     * @desc Gene執行Transcription時，掌控Status和Polling的源頭
     */

    class Root extends ModuleBase {

        constructor(gene) {
            super("Root")
            this.gene = gene
            this.name = gene.name
            this.base = {}
            this.autos = []
            this.delay = 5
            this.interval = null
            this.operating = typeof window === 'undefined' ? 'node' : 'browser'
            this.rootStatus = new Status(this.name, 'root')
            this.protection = {}
            this.carryStatus = null
            this.pollingEvents = []
            this.initBase()
        }

        get status() {
            return this.carryStatus || this.rootStatus
        }

        /**
         * @function initPolling()
         * @desc 初始化輪尋機制
         */

        initPolling() {
            this.interval = setInterval(() => {
                let clear = false
                for (let i = 0; i < this.pollingEvents.length; i++) {
                    let event = this.pollingEvents[i]
                    if (event.finish) {
                        clear = true
                    } else {
                        event.activate()
                    }
                }
                if (clear) {
                    this.clearPollingEvents()
                }
            }, this.delay)
        }

        /**
         * @function initBase()
         * @desc 初始化鹼基
         */

        initBase() {
            if (this.gene.genetic) {
                let datas = this.gene.genetic()
                if (typeof datas === "object") {
                    for (let key in datas) {
                        this.addBase(key, datas[key])
                    }
                } else {
                    this.$systemError('initBase', 'Genetic retrun not a object', datas)
                }
            }
        }

        /**
         * @function getBase()
         * @desc 直接獲取base是不會得到protection物件的
         */

        getBase() {
            let base = {}
            for (let key in this.base) {
                base[key] = this.base[key]
            }
            for (let key in this.protection) {
                base[key] = this.protection[key]
            }
            return base
        }

        /**
         * @function setTargetStatus(status)
         * @desc 轉移指定的status對象
         * @param {Status} status 
         */

        setTargetStatus(status) {
            this.carryStatus = status
        }

        /**
         * @function createSystemStatus(name,success,message)
         * @desc 快捷建立一個status至指定的對象中
         */

        createSystemStatus(name, success, message) {
            let status = new Status(name, 'system')
            status.set(success, message)
            this.status.addChildren(status)
        }

        /**
         * @function addBase(key,value)
         * @desc 加入一個全域屬性
         */

        addBase(key, value) {
            if (this.base[key] == null) {
                if (key.slice(0, 1) === "$") {
                    this.$protection(this.base, key, this.protection, value)
                } else {
                    this.base[key] = value
                }
            } else {
                this.$systemError('addBase', 'Base key already exists.', key);
            }
        }

        /**
         * @function polling(options)
         * @desc 輪循一個事件
         * @param {object} options {name:string, action:function} 
         */

        polling(options) {
            if (this.interval == null) {
                this.initPolling()
            }
            this.pollingEvents.push(new PollingEvent(this, options))
        }

        /**
         * @function auto(options)
         * @desc 建立自動執行續
         */

        auto(options) {
            this.autos.push(new Auto(this, options))
        }

        /**
         * @function clearPollingEvents()
         * @desc 清空宣告停止輪循的事件
         */

        clearPollingEvents() {
            this.pollingEvents = this.pollingEvents.filter((d) => {
                return d.finish === false
            })
        }

        /**
         * @function createFragment(name)
         * @desc 建立一個片段
         */

        createFragment(name) {
            let fragment = new Fragment(this, name)
            return fragment.use()
        }

        /**
         * @function close(success,message,callback)
         * @desc 完成Transcription後，關閉系統
         * @param {boolean} success 系統是否順利結束
         * @param {boolean} force 是否強行關閉
         * @param {any} message 如果錯誤，是怎樣的錯誤
         */

        close(success, message, force, callback) {
            let close = () => {
                this.rootStatus.set(success, message)
                if (this.interval) {
                    clearInterval(this.interval)
                }
                callback()
            }
            if (force) {
                close()
            } else {
                this.checkAutoOnload(close)
            }
        }

        checkAutoOnload(callback) {
            let check = this.autos.find((auto) => {
                return auto.finish === false
            })
            if (check == null) {
                callback()
            } else {
                setTimeout(() => {
                    this.checkAutoOnload(callback)
                }, 10)
            }
        }

    }

    class Messenger {

        constructor(root) {
            this.name = root.name
            this.base = root.base
            this.gene = root.gene
            this.status = root.rootStatus
            this.success = root.rootStatus.success
            this.getBase = root.getBase
        }

        /**
         * @function isError()
         * @desc 是否為執行錯誤的Messenger
         * @returns {boolean}
         */

        isError() {
            return !this.success
        }

        /**
         * @function getErrorMessage()
         * @desc 獲取錯誤訊息
         * @returns {string|null}
         */

        getErrorMessage() {
            return this.isError ? this.status.message : null
        }

        /**
         * @function getStatusToJson()
         * @desc 獲取狀態並轉換成json格式
         * @returns {string} json file
         */

        getStatusToJson() {
            return this.status.json()
        }

        /**
         * @function getMethods()
         * @desc 獲取模式
         * @returns {array}
         */

        getMode() {
            let mode = [];
            if (this.gene.mode.catchException) {
                mode.push('try-catch-mode')
            }
            if (this.gene.mode.timeout) {
                mode.push('timeout')
            }
            if (this.gene.mode.catchUncaughtException) {
                mode.push('uncaught-exception-mode')
            }
            if (this.gene.mode.traceBase) {
                mode.push('trace-base-mode')
            }
            return mode
        }

    }
    /**
     * @class Status()
     * @desc 堆棧狀態
     */

    class Status extends ModuleBase {

        constructor(name, type) {
            super("Status")
            this.name = name || 'no name'
            this.type = type || 'no type'
            this.detail = null
            this.message = ''
            this.success = false
            this.children = []
            this.startTime = Date.now()
            this.attributes = {}
            this.finishTime = null
        }

        get operationTime() {
            return (this.finishTime || Date.now()) - this.startTime
        }

        /**
         * @function addAttr(key,value)
         * @desc 這個屬性會被加入在一個名為attributes的物件內
         */

        addAttr(key, value) {
            this.attributes[key] = value
        }

        /**
         * @function installDetail()
         * @desc 顯示更多資訊
         */

        installDetail() {
            if (this.detail == null) {
                this.detail = {
                    operationTime: this.operationTime
                }
            }
        }

        /**
         * @function set(success,message)
         * @desc 當該狀態的模式進行到一個終點，設定成功與否和訊息
         */

        set(success, message = '') {
            if (this.finishTime == null) {
                this.success = success
                this.message = message instanceof Error ? message.stack : message
                this.finishTime = Date.now()
                this.installDetail()
            }
            return this
        }

        /**
         * @function get()
         * @desc 取得該狀態序列化的參數
         */

        get() {
            let data = {
                name: this.name,
                type: this.type,
                detail: this.detail,
                message: this.message,
                success: this.success,
                attributes: this.attributes,
                children: []
            }
            for (let child of this.children) {
                data.children.push(child.get())
            }
            return data
        }

        /**
         * @function inspect()
         * @desc 移除迴圈結構的物件
         */

        inspect(target, used = []) {
            if (target == null) {
                return null
            }
            let output = Array.isArray(target) ? [] : {}
            for (let key in target) {
                let aims = target[key]
                let type = typeof aims
                if (type === 'function') {
                    continue
                } else if (type === 'object') {
                    let newUsed = [target].concat(used)
                    if (newUsed.includes(aims)) {
                        output[key] = 'Circular structure object.'
                    } else {
                        output[key] = this.inspect(aims, newUsed)
                    }
                } else {
                    output[key] = aims
                }
            }
            return output
        }

        /**
         * @function json()
         * @desc 取得序列化參數並轉為json文本
         */

        json() {
            let data = this.inspect(this.get())
            return JSON.stringify(data, null, 4)
        }

        /**
         * @function html()
         * @desc 取得序列化參數並轉成html文本
         */

        html() {
            let data = this.inspect(this.get())
            let createCard = function (status) {
                let border = `solid 1px ${status.success ? 'blue' : 'red'}`
                let html = `<div style="padding:5px; margin: 5px; border:${border}">`
                html += `<div>type : ${status.type}</div>`
                html += `<div>name : ${status.name}</div>`
                html += status.message ? `<div>message : <br><pre>${status.message}</pre></div>` : ''
                if (status.detail) {
                    html += `<div>detail : `
                    html += `<pre>${JSON.stringify(status.detail, null, 4)}</pre>`
                    html += `</div>`
                }
                for (let key in status.attributes) {
                    html += `<div> attributes(${key}) : `
                    html += `<pre>${JSON.stringify(status.attributes[key], null, 4)}</pre>`
                    html += `</div>`
                }
                let length = status.children.length
                for (let i = 0; i < length; i++) {
                    html += createCard(status.children[i])
                }
                html += '</div>'
                return html
            }
            return createCard(data)
        }

        /**
         * @function addChildren(status)
         * @desc 將該status加入一個子狀態
         */

        addChildren(status) {
            if (status instanceof Status) {
                this.children.push(status)
            } else {
                this.$systemError('addChildren', 'Child not a status class.', status)
            }
        }

    }

    /**
     * @class Gene(name)
     * @desc 建立貯列模板與生命週期，為整體流程控制的最高物件
     */

    class Gene extends ModuleBase {

        constructor(name, options) {
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
            if (options) {
                this.setOptions(options)
            }
        }

        setOptions(options) {
            if (typeof options !== 'object') {
                this.$systemError('setOptions', 'Options not a object.', options)
            }
            if (options.timeoutMode) {
                let t = options.timeoutMode
                this.setTimeoutMode(t.enable, t.ms, t.action)
            }
            if (options.catchMode) {
                let t = options.catchMode
                this.setCatchExceptionMode(t.enable, t.action)
            }
            if (options.uncaughtCatchMode) {
                let t = options.uncaughtCatchMode
                this.setCatchUncaughtExceptionMode(t.enable, t.action)
            }
            if (options.traceBaseMode) {
                let t = options.traceBaseMode
                this.setTraceBaseMode(t.enable, t.action)
            }
            if (options.initiation && options.initiation.enable !== false) {
                this.setInitiation(options.initiation.action)
            }
            if (options.elongation && options.elongation.enable !== false) {
                this.setElongation(options.elongation.action)
            }
            if (options.termination && options.termination.enable !== false) {
                this.setTermination(options.termination.action)
            }
            if (options.genetic && options.genetic.enable !== false) {
                this.setGenetic(options.genetic.action)
            }
            if (options.templates) {
                this.cloning(options.templates)
            }
        }

        addName(name) {
            if (typeof name === "string") {
                if (this.name === 'no name') {
                    this.name = name
                } else {
                    this.name += '-' + name
                }
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
                this.name = name;
            } else {
                this.$systemError('setName', 'Name not a string.', name)
            }
        }

        /**
         * @function setTraceBaseMode(enable,action)
         * @desc 鹼基追蹤模式，將每個template的鹼基變化紀錄下來，這功能將吞噬你的效能，僅適用於測試
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
         * @desc 設定捕捉Exception模式，這功能將吞噬你的效能，僅適用於測試
         * @param {function} action (base, exception, exit, fail)
         */

        setCatchExceptionMode(enable, action) {
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

        setGenetic(callback) {
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
            if (typeof name === 'string' && typeof action === 'function') {
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
            if (typeof initiation === 'function') {
                this.synthesis.initiation = initiation
            } else {
                this.$systemError('setInitiation', 'Params type error, try setInitiation(function).')
            }
        }

        /** 
         * @function setElongation(elongation)
         * @desc 設定延長事件，自動過渡，沒有next也無法處裡非同步資源
         * @param {function} elongation (base, exit, fail)
         */

        setElongation(elongation) {
            if (typeof elongation === 'function') {
                this.synthesis.elongation = elongation
            } else {
                this.$systemError('setElongation', 'Params type error, try setElongation(function).')
            }
        }

        /** 
         * @function setTermination(termination)
         * @desc 設定結束事件
         * @param {function} termination (base, rootStatus)
         */

        setTermination(termination) {
            if (typeof termination === 'function') {
                this.synthesis.termination = termination
            } else {
                this.$systemError('setTermination', 'Params type error, try setTermination(function).');
            }
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
                this.$systemError('cloning', 'Template not a object.');
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

    /**
     * @class Transcription(gene)
     * @desc 轉譯gene並輸出messenger，他會在運行Gene Transcription實例化，保護其不被更改到
     */

    class Transcription extends ModuleBase {

        constructor(gene, resolve, reject) {
            super("Transcription");
            this.gene = gene
            this.case = new Case()
            this.root = new Root(this.gene)
            this.finish = false
            this.reject = reject
            this.resolve = resolve
            this.forceClose = false
            this.templates = this.gene.templates
            this.init()
            this.synthesis()
        }

        get status() {
            return this.root.status
        }

        get base() {
            return this.root.base
        }

        init() {
            this.initBind()
            this.initTimeoutMode()
            this.initGenerator()
            this.initCatchUncaughtExceptionMode()
        }

        initBind() {
            this.bind = {
                exit: this.exit.bind(this),
                fail: this.fail.bind(this),
                next: this.next.bind(this),
                auto: this.root.auto.bind(this.root),
                cross: this.cross.bind(this),
                addBase: this.root.addBase.bind(this.root),
                polling: this.root.polling.bind(this.root),
                setStatusAttr: this.setStatusAttr.bind(this),
                setRootStatusAttr: this.setRootStatusAttr.bind(this),
                createFragment: this.root.createFragment.bind(this.root)
            }
        }

        initTimeoutMode() {
            if (this.gene.mode.timeout) {
                let system = this.gene.mode.timeout
                this.timeoutSystem = setTimeout(() => {
                    this.forceClose = true
                    this.root.createSystemStatus('timeout', true)
                    system.action.bind(this.case)(this.base, this.bind.exit, this.bind.fail)
                }, system.millisecond)
            }
        }

        /**
         * @function initCatchUncaughtExceptionMode
         * @desc 初始化捕捉異步錯誤
         */

        initCatchUncaughtExceptionMode() {
            if (this.gene.mode.catchUncaughtException) {
                this.uncaughtExceptionAction = (error) => {
                    let exception = error.stack ? error : error.error
                    this.forceClose = true
                    this.root.createSystemStatus('uncaught exception', true, exception.stack)
                    this.gene.mode.catchUncaughtException.action.bind(this.case)(this.base, exception, this.bind.exit, this.bind.fail)
                }
                if (this.root.operating === 'node') {
                    this.uncaughtExceptionDomain = require('domain').create();
                    this.uncaughtExceptionDomain.on('error', this.uncaughtExceptionAction);
                } else {
                    window.addEventListener('error', this.uncaughtExceptionAction);
                }
            }
        }

        /**
         * @function initGenerator()
         * @desc 初始化一個生成器
         */

        initGenerator() {
            let self = this
            let generator = function* () {
                let index = 1
                let template = self.templates[0]
                if (self.gene.synthesis.initiation) {
                    self.gene.synthesis.initiation.bind(self.case)(self.base, self.getSkill(), self.bind.next, self.bind.exit, self.bind.fail)
                    yield
                }
                while (index <= 10000) {
                    if (self.finish) {
                        break
                    } else {
                        if (template == null) {
                            self.bind.exit()
                        } else {
                            let status = new Status(template.name, 'template')
                            self.root.status.addChildren(status)
                            self.root.setTargetStatus(status)
                            let next = () => {
                                next = null
                                template = self.templates[index++]
                                status.set(true)
                                self.bind.next()
                                self.root.setTargetStatus(null)
                            }
                            template.action.bind(self.case)(self.base, self.getSkill(), next, self.bind.exit, self.bind.fail)
                        }
                    }
                    yield
                }
                return
            }
            this.iterator = generator();
        }

        /**
         * @function deepClone(obj)
         * @desc 深拷貝一個物件，並回傳此物件
         */

        deepClone(obj, hash = new WeakMap()) {
            if (Object(obj) !== obj) {
                return obj
            }
            if (obj instanceof Set) {
                return new Set(obj)
            }
            if (hash.has(obj)) {
                return hash.get(obj)
            }
            const result = obj instanceof Date ? new Date(obj) : obj instanceof RegExp ? new RegExp(obj.source, obj.flags) : Object.create(null)
            hash.set(obj, result)
            if (obj instanceof Map) {
                Array.from(obj, ([key, val]) => {
                    result.set(key, this.deepClone(val, hash))
                })
            }
            return Object.assign(result, ...Object.keys(obj).map((key) => {
                return ({
                    [key]: this.deepClone(obj[key], hash)
                })
            }))
        }

        /**
         * @function getSkill()
         * @desc 獲取可用技能
         * @returns {each, auto, cross, polling, addBase, deepClone, newFrag, createFragment}
         */

        getSkill() {
            return {
                each: Supports.each,
                auto: this.bind.auto,
                frag: this.bind.createFragment,
                cross: this.bind.cross,
                polling: this.bind.polling,
                addBase: this.bind.addBase,
                deepClone: this.deepClone,
                setStatusAttr: this.bind.setStatusAttr,
                setRootStatusAttr: this.bind.setRootStatusAttr,
                createFragment: this.bind.createFragment
            }
        }

        /**
         * @function setRootStatusAttr(key,value)
         * @desc 可在skill中定義根狀態
         */

        setRootStatusAttr(key, value) {
            this.root.rootStatus.addAttr(key, value)
        }

        /**
         * @function setStatusAttr(key,value)
         * @desc 可在skill中定義狀態
         */

        setStatusAttr(key, value) {
            this.status.addAttr(key, value)
        }

        /**
         * @function cross(gene,callback)
         * @desc 有時不免俗需要抽出邏輯層，cross可以讓你呼叫外部基因並疊加狀態
         * @callback (error,messenger)
         */

        cross(gene, callback) {
            if (gene instanceof Gene) {
                gene.transcription().then((messenger) => {
                    this.root.status.addChildren(messenger.status)
                    callback(null, messenger)
                }, (messenger) => {
                    this.root.status.addChildren(messenger.status)
                    callback(messenger.getErrorMessage(), messenger)
                })
            } else {
                this.$systemError('cross', 'Target not a gene module.', gene)
            }
        }

        /**
         * @function close(success,message,callback)
         * @desc 不論是fail或exit都會處裡的邏輯層
         */

        close(success, message, callback) {
            this.root.close(success, message, this.forceClose, () => {
                if (this.timeoutSystem) {
                    clearTimeout(this.timeoutSystem)
                }
                if (this.gene.mode.catchUncaughtException && this.root.operating !== 'node') {
                    window.removeEventListener('error', this.uncaughtExceptionAction)
                }
                if (this.gene.synthesis.termination) {
                    this.gene.synthesis.termination.call(this.case, this.base, this.root.rootStatus);
                }
                callback()
            })
        }

        /**
         * @function fail(error)
         * @desc 拒絕並傳遞錯誤
         */

        fail(error) {
            if (this.finish === false) {
                this.finish = true
                this.close(false, error || 'unknown error', () => {
                    this.reject(new Messenger(this.root))
                })
            }
        }

        /**
         * @function exit()
         * @desc 成功並結束模板
         */

        exit(message) {
            if (this.finish === false) {
                this.finish = true
                this.close(true, message, () => {
                    this.resolve(new Messenger(this.root))
                })
            }
        }

        /**
         * @function next()
         * @desc 前往下個貯列
         */

        next() {
            if (this.finish === false) {
                if (this.gene.mode.traceBase) {
                    this.gene.mode.traceBase.action(this.deepClone(this.root.base), this.status)
                }
                if (this.gene.synthesis.elongation) {
                    this.gene.synthesis.elongation(this.base, this.bind.exit, this.bind.fail)
                }
                setTimeout(() => {
                    this.synthesis()
                }, 1)
            }
        }

        /**
         * @function synthesis()
         * @desc TryCatch與CatchUncaughtException其實需要一個統一的傳遞街口
         */

        synthesis() {
            this.synthesisTryCatchMode()
        }

        /**
         * @function synthesisTryCatchMode()
         * @desc 開啟TryCatch模式
         */

        synthesisTryCatchMode() {
            if (this.gene.mode.catchException) {
                try {
                    this.synthesisCatchUncaughtExceptionMode()
                } catch (exception) {
                    if (this.gene.mode.catchException) {
                        this.forceClose = true
                        this.root.createSystemStatus('error catch', true, exception.stack)
                        this.gene.mode.catchException.action.bind(this.case)(this.base, exception, this.bind.exit, this.bind.fail)
                    }
                    return false
                }
            } else {
                this.synthesisCatchUncaughtExceptionMode()
            }
        }

        /**
         * @function synthesisCatchUncaughtExceptionMode()
         * @desc 開啟CatchUncaughtException模式
         */

        synthesisCatchUncaughtExceptionMode() {
            if (this.gene.mode.catchUncaughtException && this.root.operating === "node") {
                this.uncaughtExceptionDomain.run(() => {
                    this.iterator.next()
                });
            } else {
                this.iterator.next()
            }
        }

    }

    /**
     * @class Nucleoid
     * @desc 掌控整個系統組成的核心物件，為建立Gene的接口
     */

    class Nucleoid {

        /**
         * @function createGene(name)
         * @static
         * @desc 建立一個Gene
         */

        static createGene(name, options) {
            return new Gene(name, options)
        }

        /**
         * @function createOperon(type,options)
         * @static
         * @desc 建立Operon
         */

        static createOperon(options) {
            let operon = new Operon(options)
            return operon.exports()
        }

    }

    let __re = Nucleoid;

    return __re;

})
