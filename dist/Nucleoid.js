

    (function( root, factory ){
    
        let moduleName = 'Nucleoid';
    
        if( typeof module !== 'undefined' && typeof exports === 'object' ) {
            module.exports = factory();
        }
        else if ( typeof define === 'function' && (define.amd || define.cmd) ) {
            define(function() { return factory; });
        } 
        else {
            root[moduleName] = factory();
        }
    
    })( this || (typeof window !== 'undefined' ? window : global), function(){
        /**
 * @class Supports
 * @desc 一些可通用的function
 */

class Supports {
    
    /**
     * @function each(target,callback)
     * @static
     * @desc 各種迴圈適應
     * @callback (data,index|key)
     */
    
    static each(target, callback) {
        if (Array.isArray(target)) {
            var len = target.length;
            for( let i = 0 ; i < len ; i++){
                var br = callback(target[i], i)
                if( br === "_break" ){ break }
                if( br === "_continue" ){ continue }
            }
            return
        }
        let type = typeof target
        if (type === "object") {
            for( let key in target ){
                var br = callback( target[key], key )
                if( br === "_break" ){ break }
                if( br === "_continue" ){ continue }
            }
            return
        }
        if (type === 'number') {
            for (let i = 0; i < target; i++) {
                var br = callback(i,i)
                if( br === "_break" ){ break }
                if( br === "_continue" ){ continue }
            }
            return
        }
        Supports.systemError("Supports", "each", "Each only support object, array, number.", target);
    }

    /**
     * @function systemError
     * @static
     * @desc 執出錯誤訊息
     */

    static systemError(name, functionName, message, object = '$_no_error'){
        if (object !== '$_no_error') {
            console.log('error data => ', object )
        }
        throw new Error(`(☉д⊙)!! Nucleoid::${name} => ${functionName} -> ${message}`)
    }

    /**
     * @function deepClone(obj)
     * @static
     * @desc 深拷貝一個物件，並回傳此物件
     */

    static deepClone(obj, hash = new WeakMap()) {
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
                result.set(key, Supports.deepClone(val, hash))
            })
        }
        return Object.assign(result, ...Object.keys(obj).map((key) => {
            return ({
                [key]: Supports.deepClone(obj[key], hash)
            })
        }))
    }

    /**
     * @function inspect()
     * @static
     * @desc 移除迴圈結構的物件
     */

    static inspect(target, used = []) {
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
                    output[key] = Supports.inspect(aims, newUsed)
                }
            } else {
                output[key] = aims
            }
        }
        return output
    }

    /**
     * @function getAllPrototype()
     * @static
     * @desc 獲取所有含繼承的propotype
     */

    static getAllPrototype(target) {
        let prototypes = []
        if (target.prototype) {
            prototypes = Object.getOwnPropertyNames(target.prototype)
        }
        if (target.__proto__) {
            prototypes = prototypes.concat(Supports.getAllPrototype(target.__proto__))
        }
        return prototypes.filter((text, index, arr) => {
            return arr.indexOf(text) === index && text !== 'constructor'
        })
    }

}
/**
 * @class ModuleBase
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

    $systemError(functionName, message, object){
        Supports.systemError(this.$moduleBase.name, functionName, message, object)
    }

    /**
     * @function $noKey(functionName,target,key)
     * @desc 檢查該物件是否含有key
     * @returns {boolean} 如果沒有，回傳true，如果有則報錯
     */

    $noKey(functionName, target, key) {
        if (target[key] == null) {
            return true
        } else {
            this.$systemError(functionName, `Name(${key}) already exists.`)
            return false
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
        Object.defineProperty(object, key, {
            set: () => {
                this.$systemError('protection', "This key is a private key, can't be change.", key)
            },
            get: () => {
                return getter[key]
            },
        })
    }

}

class Case {}

/**
 * @class PollingEvent
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
 * @class Fragment
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
            if( this.stop === false ){
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
            if( this.stop === false ){
                if( this.over >= this.thread.length ){
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
        let func = async() => {
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
     * @callback (error,onload)
     */

    activate(callback) {
        let length = this.thread.length
        this.install(callback)
        for (let i = 0; i < length; i++) {
            this.actionThread(this.thread[i])
        }
        if( length === 0 ){
            this.callback(null)
        }
        this.activate = () => {
            this.$systemError('activate', `This template(${this.name}) already  called`)
        }
    }

}

/**
 * @class Auto
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

    /**
     * @function init
     * @desc 初始化狀態
     */

    init() {
        this.root.status.addChildren(this.status)
        this.action(this.error.bind(this), this.onload.bind(this))
    }

    /**
     * @function createAction
     * @desc 建立自動化行為
     */

    createAction(action) {
        if (typeof action !== 'function') {
            this.$systemError('createAction', 'Action not a function', action)
        }
        return async function (error, onload) {
            action(error, onload)
        }
    }

    /**
     * @function error
     * @desc 自動化行為出錯
     */

    error(error) {
        this.finish = true
        this.status.set(false, error)
    }

    /**
     * @function onload
     * @desc 自動化行為執行完畢
     */

    onload() {
        this.finish = true
        this.status.set(true)
    }

}
/**
 * @class Operon
 * @desc 統一io狀態的物件
 */

class Operon extends ModuleBase {

    constructor(options) {
        super('Operon')
        this.data = this.$verify(options, {
            units: [true, {}],
            structure: [true, []] 
        })
        this.validate()
    }

    get units() {
        return this.data.units
    }

    /**
     * @function validate
     * @desc 驗證Operon結構是否正確
     */

    validate() {
        if (Array.isArray(this.data.structure) === false) {
            this.$systemError('validate', `Structure not a array.`, this.data.structure)
        }
        for (let key in this.units) {
            let unit = this.units[key]
            if (unit.constructor == null || unit.prototype == null) {
                this.$systemError('validate', 'Unit not a constructor.', key)
            }
            let prototypes = Supports.getAllPrototype(unit)
            for (let name of this.data.structure) {
                if (prototypes.includes(name) === false) {
                    this.$systemError('validate', `Property(${name}) not found.`, name)
                }
            }
        }
    }

    /**
     * @function use
     * @desc 使用選擇的Unit
     */

    use(name, options) {
        let context = this.createContext(name, options)
        let unit = this.getUnit(name)
        return this.useUnit(unit, context)
    }

    /**
     * @function createContext
     * @desc 建立傳入Unit的Context
     */

    createContext(name, options) {
        return {
            data: options,
            useName: name
        }
    }

    /**
     * @function useUnit(unit,context)
     * @desc 使用Unit的邏輯層
     */

    useUnit(unit, context) {
        let target = new unit(context)
        let output = {}
        for (let key of this.data.structure) {
            output[key] = target[key].bind(target)
        }
        return output
    }

    /**
     * @function getUnit(name)
     * @desc 獲取Unit的邏輯層
     */

    getUnit(name) {
        if (this.data.units[name]) {
            return this.data.units[name]
        } else {
            this.$systemError('getUnit', 'Unit not found.', name)
        }
    }

    /**
     * @function exports()
     * @desc 輸出API
     */

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
        if (this.gene.mode.isEnable('genetic')) {
            let items = this.gene.mode.use('genetic').action()
            if (typeof items === "object") {
                for (let key in items) {
                    this.addBase(key, items[key])
                }
            } else {
                this.$systemError('initBase', 'Genetic retrun not a object', items)
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

    addBase( key, value ){
        if( this.base[key] == null ){
            if( key.slice(0, 1) === "$" ){
                this.$protection(this.base, key, this.protection, value)
            } else {
                this.base[key] = value
            }
        } else {
            this.$systemError('addBase', 'Base key already exists.', key );
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
     * @param {any} message 如果錯誤，是怎樣的錯誤
     */

    close(success, message) {
        this.rootStatus.set(success, message)
        if (this.interval) {
            clearInterval(this.interval)
        }
    }

    /**
     * @function checkAutoOnload()
     * @desc Auto是否執行完畢
     */

    checkAutoOnload() {
        let check = this.autos.find((auto) => {
            return auto.finish === false
        })
        return check == null
    }

}

/**
 * @class Messenger
 * @desc 負責被擲出Gene的物件
 */

class Messenger {

    constructor(root) {
        this.name = root.name
        this.base = root.base
        this.gene = root.gene
        this.status = root.rootStatus
        this.success = root.rootStatus.isSuccess()
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
        return this.isError ? this.status.getMessage() : null
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

    getMode(){
        return this.gene.mode.used()
    }

}
/**
 * @class Status
 * @desc 堆棧狀態
 */

class Status extends ModuleBase{

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
     * @function getMessage()
     * @desc 獲取該狀態的訊息
     */

    getMessage() {
        return this.message || 'no message'
    }

    /**
     * @function isSuccess()
     * @desc 該狀態是否已成功結束
     */

    isSuccess() {
        return this.success
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
                operationTime : this.operationTime
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
     * @function getErrorStatus()
     * @desc 只獲取錯誤狀態並平面化資料
     */

    getErrorStatus() {
        let data = Supports.inspect(this.get())
        let output = []
        let action = function(status, start) {
            if (status.success === false) {
                output.push(status)
            }
            for (let child of status.children) {
                action(child)
            }
            if (start) {
                return output
            }
        }
        return action(data, true)
    }

    /**
     * @function json()
     * @desc 取得序列化參數並轉為json文本
     */

    json() {
        let data = Supports.inspect(this.get())
        return JSON.stringify(data, null, 4)
    }

    /**
     * @function html()
     * @desc 取得序列化參數並轉成html文本
     */

    html() {
        let data = Supports.inspect(this.get())
        let createCard = function(status) {
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
 * @class Mode
 * @desc 處理所有基因行為的模塊
 */

class Mode extends ModuleBase {

    constructor() {
        super('Mode')
        this.data = {}
        this.init()
    }

    /**
     * @function init
     * @desc 初始化所有事件
     */

    init() {
        this.createMode('try-catch-mode')
        this.createMode('uncaught-exception-mode')
        this.createMode('trace-base-mode')
        this.createMode('genetic')
        this.createMode('initiation')
        this.createMode('elongation')
        this.createMode('termination')
        this.createMode('timeout', {
            ms: {
                type: 'number',
                value: 0,
                require: true
            }
        })
    }

    /**
     * @function proxy
     * @desc 保護物件模式
     * @param {object} options [require,type,default]
     */

    proxy(target) {
        let self = this
        return new Proxy(target, {
            get(object, key) {
                let oriData = key[0] === '_'
                if (oriData) {
                    key = key.slice(1)
                }
                let target = object[key]
                if (target == null) {
                    return self.$systemError('getMode', `Param(${key}) not found.`)
                }
                return oriData ? target : target.value
            },
            set(object, key, value) {
                let target = object[key]
                if (target == null) {
                    self.$systemError('setMode', `Param(${key}) not allowed.`)
                    return false
                }
                if (object.protect.value) {
                    self.$systemError('setMode', `Param(${key}) is protect.`)
                    return false
                }
                if (typeof value !== target.type) {
                    self.$systemError('setMode', `Param(${key}) type is ${typeof value}, must require ${target.type}.`)
                    return false
                }
                target.value = value
                return true
            }
        })
    }

    /**
     * @function createMode
     * @desc 為Mode建立一些基礎屬性
     */

    createMode(name, options = {}) {
        this.data[name] = this.proxy({
            action: {
                type: 'function',
                value: null,
                require: true
            },
            enable: {
                type: 'boolean',
                value: false,
                require: true
            },
            protect: {
                type: 'boolean',
                value: false,
                require: false
            },
            ...options
        })
    }

    /**
     * @function exports
     * @desc 輸出接口
     */

    exports() {
        return {
            use: this.use.bind(this),
            set: this.set.bind(this),
            used: this.getUsed.bind(this),
            isEnable: this.isEnable.bind(this)
        }
    }

    /**
     * @function getUsed
     * @desc 獲取正在使用的mode
     */

    getUsed() {
        let mode = [];
        for (let key in this.data) {
            if (this.data[key].enable) {
                mode.push(key)
            }
        }
        return mode
    }

    /**
     * @function isEnable
     * @desc 該模式有無被啟用
     */

    isEnable(name) {
        if (this.data[name] == null) {
            this.$systemError('isEnable', `Mode(${name}) not found.`)
        }
        return this.data[name].enable
    }

    /**
     * @function hasRequire
     * @desc 檢查必要參數
     */

    hasRequire(target, options) {
        for (let key in target) {
            if (target['_' + key].require && options[key] == null) {
                this.$systemError('hasRequire', `Param(${key}) is require.`, options)
                return false
            }
        }
        return true
    }

    /**
     * @function use
     * @desc 獲取一個模式
     */

    use(name) {
        if (this.data[name] == null) {
            this.$systemError('useMode', `Mode(${name}) not found.`)
        }
        return this.data[name]
    }

    /**
     * @function set
     * @desc 檢查各種狀況，通過則賦值
     */

    set(name, options) {
        let target = this.data[name]
        if (typeof options !== 'object') {
            this.$systemError('setMode', `Options not a object.`)
        }
        if (target == null) {
            this.$systemError('setMode', `Mode(${name}) not found.`)
        }
        if (this.hasRequire(target, options)) {
            this.setMode(target, options)
        }
    }

    /** 
     * @function setMode
     * @desc 個別賦值
     */

    setMode(target, options) {
        for (let key in options) {
            target[key] = options[key]
        }
    }

}
/**
 * @class Gene
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

/**
 * @class Transcription
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
        this.templates = this.gene.templates.slice()
        this.modeEnable = this.gene.mode.isEnable
        this.forceClose = false
        this.stackOverflow = 0
        this.init()
        this.synthesis()
    }

    get status() {
        return this.root.status
    }

    get base() {
        return this.root.base
    }

    /**
     * @function init
     * @desc 初始化狀態
     */

    init() {
        this.initBind()
        this.initSkill()
        this.initIterator()
        this.initTimeoutMode()
        this.initCatchUncaughtExceptionMode()
    }

    initSkill() {
        this.skill = {
            each: Supports.each,
            auto: this.bind.auto,
            frag: this.bind.createFragment,
            cross: this.bind.cross,
            polling: this.bind.polling,
            addBase: this.bind.addBase,
            deepClone: Supports.deepClone,
            setStatusAttr: this.bind.setStatusAttr,
            setRootStatusAttr: this.bind.setRootStatusAttr,
            createFragment: this.bind.createFragment
        }
    }

    /**
     * @function initBind
     * @desc 初始化綁定狀態
     */

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

    /**
     * @function initTimeoutMode
     * @desc 初始化愈時處理
     */

    initTimeoutMode() {
        if (this.modeEnable('timeout')) {
            let timeout = this.gene.mode.use('timeout')
            this.timeoutSystem = setTimeout(() => {
                this.forceClose = true
                this.root.createSystemStatus('timeout', true)
                timeout.action.call(this.case, this.base, this.bind.exit, this.bind.fail)
            }, timeout.ms)
        }
    }

    /**
     * @function initCatchUncaughtExceptionMode
     * @desc 初始化捕捉異步錯誤
     */

    initCatchUncaughtExceptionMode(){
        if (this.modeEnable('uncaught-exception-mode')) {
            this.uncaughtExceptionAction = (error) => {
                let exception = error.stack ? error : error.error
                this.forceClose = true
                this.root.createSystemStatus('uncaught exception', true, exception.stack)
                this.gene.mode.use('uncaught-exception-mode').action.call(this.case, this.base, exception, this.bind.exit, this.bind.fail)
            }
            if( this.root.operating === 'node' ){
                this.uncaughtExceptionDomain = require('domain').create();
                this.uncaughtExceptionDomain.on('error', this.uncaughtExceptionAction);
            }else{
                window.addEventListener('error', this.uncaughtExceptionAction);
            }
        }
    }

    initIterator() {
        this.iteratorStart = false
    }

    iterator() {
        if (this.iteratorStart === false && this.modeEnable('initiation')) {
            this.iteratorStart = true
            this.gene.mode.use('initiation').action.call(this.case, this.base, this.skill, this.bind.next, this.bind.exit, this.bind.fail)
            return
        }
        let template = this.templates.shift()
        if (this.finish === false) {
            if (template == null) {
                this.bind.exit()
            } else {
                let status = new Status(template.name, 'template')
                let next = () => {
                    next = null
                    status.set(true)
                    this.root.setTargetStatus(null)
                    this.bind.next()
                }
                this.root.status.addChildren(status)
                this.root.setTargetStatus(status)
                template.action.call(this.case, this.base, this.skill, next, this.bind.exit, this.bind.fail)
            }
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
        if (this.forceClose) {
            this.root.close(success, message)
            if (this.timeoutSystem) {
                clearTimeout(this.timeoutSystem)
            }
            if (this.modeEnable('uncaught-exception-mode') && this.root.operating !== 'node') {
                window.removeEventListener('error', this.uncaughtExceptionAction)
            }
            if (this.modeEnable('termination')) {
                this.gene.mode.use('termination').action.call(this.case, this.base, this.root.rootStatus)
            }
            callback()
        } else {
            if (this.root.checkAutoOnload()) {
                this.forceClose = true
            }
            setTimeout(() => {
                this.close(success, message, callback)
            }, 10)
        }
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

    exit(message){
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

    next(){
        if (this.finish === false) {
            if (this.modeEnable('trace-base-mode')) {
                this.gene.mode.use('trace-base-mode').action.call(this.case, Supports.deepClone(this.base), this.status)
            }
            if (this.modeEnable('elongation')) {
                this.gene.mode.use('elongation').action.call(this.case, this.base, this.bind.exit, this.bind.fail)
            }
            this.stackOverflow += 1
            if (this.stackOverflow > 200) {
                this.stackOverflow = 0
                setTimeout(this.synthesis.bind(this), 1)
            } else {
                this.synthesis()
            }
        }
    }

    /**
     * @function synthesis()
     * @desc TryCatch與CatchUncaughtException其實需要一個統一的傳遞街口
     */

    synthesis(){
        if (this.modeEnable('try-catch-mode')) {
            this.synthesisTryCatchMode()
        } else {
            this.synthesisCatchUncaughtExceptionMode()
        }
    }

    /**
     * @function synthesisTryCatchMode()
     * @desc 開啟TryCatch模式
     */

    synthesisTryCatchMode(){
        try {
            this.synthesisCatchUncaughtExceptionMode()
        } catch (exception) {
            this.forceClose = true
            this.root.createSystemStatus('error catch', true, exception.stack)
            this.gene.mode.use('try-catch-mode').action.call(this.case, this.base, exception, this.bind.exit, this.bind.fail)
            return false
        }
    }

    /**
     * @function synthesisCatchUncaughtExceptionMode()
     * @desc 開啟CatchUncaughtException模式
     */

    synthesisCatchUncaughtExceptionMode(){
        if (this.modeEnable('uncaught-exception-mode') && this.root.operating === "node") {
            this.uncaughtExceptionDomain.run(() => {
                this.iterator()
            })
        } else {
            this.iterator()
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
     * @function isMessenger(messenger)
     * @static
     * @desc 驗證該模組是否為messenger
     */

    static isMessenger(messenger) {
        return messenger instanceof Messenger
    }
    /**
     * @function isStatus(status)
     * @static
     * @desc 驗證該模組是否為status
     */

    static isStatus(status) {
        return status instanceof Status
    }

    /**
     * @function isGene(gene)
     * @static
     * @desc 驗證該模組是否為基因
     */

    static isGene(gene) {
        return gene instanceof Gene
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
