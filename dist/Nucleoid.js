

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
            console.log( `%c error : `, 'color:#FFF; background:red' );
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
                return getter[key]
            },
        })
    }

}

class Case {}
class Root extends ModuleBase {

    constructor(gene) {
        super("Root")
        this.gene = gene
        this.name = gene.name
        this.base = {}
        this.delay = 10
        this.operating = typeof window === 'undefined' ? 'node' : 'browser'
        this.rootStatus = new Status(this.name, 'root')
        this.protection = {}
        this.carryStatus = null
        this.pollingEvents = []
        this.init()
    }

    get status() {
        return this.carryStatus || this.rootStatus
    }

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

    setTargetStatus(status) {
        this.carryStatus = status
    }

    createSystemStatus(name, success, message) {
        let status = new Status(name, 'system')
            status.set(success, message)
        this.status.addChildren(status)
    }

    init() {
        this.initBase()
        this.initPolling()
    }

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
                this.filterPollingEvents()
            }
        }, this.delay)
    }

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

    polling(options) {
        this.pollingEvents.push(new PollingEvent(this, options))
    }

    clearPollingEvents() {
        this.pollingEvents = this.pollingEvents.filter((d) => {
            return d.finish === false
        })
    }

    createFragment(name) {
        let fragment = new Fragment(this, name)
        return fragment.use()
    }

    close(success, message) {
        this.rootStatus.set(success, message)
        clearInterval(this.interval)
    }

}

class PollingEvent extends ModuleBase {

    constructor(root, options) {
        super('PollingEvent')
        this.name = options.name
        this.status = new Status(this.name, 'polling')
        this.action = options.action
        this.finish = false
        root.status.addChildren(this.status)
    }

    activate() {
        this.action(this.close.bind(this))
    }

    close() {
        this.status.set(true)
        this.finish = true
    }

}

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

    install(callback) {
        this.callback = callback
    }

    use() {
        return {
            add: this.add.bind(this),
            activate: this.activate.bind(this)
        }
    }

    add(options) {
        this.thread.push(this.$verify(options, {
            name: [true, '#string'],
            action: [true, '#function'] 
        }))
    }

    regsterError(status) {
        return (error) => {
            if( this.stop === false ){
                status.set(false, error)
                this.stop = true
                this.callback(error)
            }
        }
    }

    regsterOnload(status) {
        return () => {
            this.over += 1
            if( this.stop === false ){
                if( this.over >= this.thread.length ){
                    status.set(true)
                    this.stop = true
                    this.callback()
                }
            }
        }
    }

    actionThread(thread) {
        let func = async() => {
            let status = new Status(thread.name, 'thread')
            let onload = this.regsterOnload(status)
            let error = this.regsterError(status)
            this.status.addChildren(status)
            thread.action(error, onload)
        }
        func()
    }

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

class Messenger {

    constructor(root) {
        this.name = root.name
        this.base = root.base
        this.gene = root.gene
        this.status = root.rootStatus
        this.success = root.rootStatus.success
        this.getBase = root.getBase
    }

    isError() {
        return !this.success
    }

    getErrorMessage() {
        return this.isError ? this.status.message : null
    }

    getStatusToJson() {
        return this.status.json()
    }

    /**
     * @function getMethods()
     * @desc 獲取模式
     */

    getMode(){
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
class Status extends ModuleBase{

    constructor(name, type) {
        super("Status")
        this.name = name || 'no name'
        this.type = type || 'no type'
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

    addAttr(key, value) {
        this.attributes[key] = value
    }

    set(success, message = '') {
        if (this.finishTime == null) {
            this.success = success
            this.message = message
            this.finishTime = Date.now()
        }
        return this
    }

    get() {
        let data = {
            name: this.name,
            type: this.type,
            message: this.message,
            success: this.success,
            attributes: this.attributes,
            operationTime: this.operationTime,
            children: []
        }
        for (let child of this.children) {
            data.children.push(child.get())
        }
        return data
    }

    json() {
        return JSON.stringify(this.get(), null, 4)
    }

    addChildren(status) {
        if (status instanceof Status) {
            this.children.push(status)
        } else {
            this.$systemError('addChildren', 'Child not a status class.', status)
        }
    }

}
class Curry extends ModuleBase {

    constructor(options, group) {
        super("Curry");
        this.group = group;
        this.data = this.$verify(options, {
            name: [true, ''],
            input: [true, '#function'],
            output: [true, '#function'],
            opener: [false, []],
            methods: [true, {}]
        })
        this.opener = this.data.opener || null
        this.methods = {}
        this.checkPrivateKey()
    }

    get name() { return this.data.name }

    checkPrivateKey() {
        let methods = this.data.methods
        if( methods.action || methods.promise ){
            this.$systemError('init', 'Methods has private key(action, promise)')
        }
    }

    use() {
        let self = this
        return function() {
            let unit = new CurryUnit(self, [...arguments]);
            return unit.getRegisterMethod();
        }
    }

}

class CurryUnit extends ModuleBase {

    constructor(main, params) {
        super("CurryUnit")
        this.case = new Case()
        this.flow = []
        this.main = main
        this.index = 0
        this.params = params
        this.methods = {}
        this.previousFlow = null
        this.initRegisterMethod()
    }

    initRegisterMethod() {
        let self = this;
        this.registergMethod = {
            action: this.action.bind(this),
            promise: this.promise.bind(this)
        }

        let input = new Method({
            name: 'input',
            action: this.main.data.input
        }, this.main.group)

        let output = new Method({
            name: 'output',
            action: this.main.data.output
        }, this.main.group)

        this.input = input.turn(this.case).use()
        this.output = output.turn(this.case).use()

        for (let name in this.main.data.methods) {
            this.methods[name] = new Method({
                name: name,
                action: this.main.data.methods[name]
            }, this.main.group)
            this.registergMethod[name] = function() {
                self.register(name, [...arguments])
                return self.getRegisterMethod()
            }
        }
    }

    getRegisterMethod() {
        return this.registergMethod
    }

    register(name, params) {
        if (this.main.opener.length !== 0 && this.flow.length === 0) {
            if (!this.main.opener.includes(name)) {
                this.$systemError('register', 'First call method not inside opener.', name)
            }
        }
        let data = {
            name: name,
            nextFlow: null,
            previous: this.flow.slice(-1),
            index: this.index,
            method: this.methods[name].turn(this.case).use(),
            params: params
        }
        if( this.previousFlow ){
            this.previousFlow.nextFlow = data
        }
        this.previousFlow = data
        this.index += 1
        this.flow.push(data)
    }

    include(name) {
        return this.main.group.getMethod(name).use()
    }

    action(callback) {
        let error = function(error){ callback(error, null) }
        let success = function(success) { callback(null, success) }
        this.activation( error, success )
    }

    promise() {
        return new Promise(( resolve, reject )=>{
            this.activation( reject, resolve )
        })
    }

    activation(error, success) {
        let stop = false
        let index = 0
        let run = () => {
            let flow = this.flow[index]
            if( flow ){
                flow.method.action(...flow.params, (err) => {
                    if (err) {
                        error(err)
                        stop = true
                    } else {
                        index += 1
                        if( stop === false ){ run() }
                    }
                })
            } else {
                this.output.action((err, result) => {
                    if (err) {
                        error(err)
                    } else {
                        success(result)
                    }
                })
            }
        }
        this.input.action(...this.params, (err) => {
            if (err) {
                error(err)
            } else {
                run()
            }
        })
    }

}

class MethodGroup extends ModuleBase {

    constructor(options = {}) {
        super("MethodGroup")
        this.case = new Case()
        this.pool = {}
        this.curriedPool = {}
        this.data = this.$verify(options, {
            create: [false, function(){}]
        })
    }

    create(options){
        this.data.create.bind(this.case)(options)
        this.create = null;
    }

    // get

    getMethod(name) {
        if( this.pool[name] ){
            return this.pool[name]
        } else {
            this.$systemError('getMethod', 'method not found.', name)
        }
    }

    getCurriedFunction(name) {
        if( this.curriedPool[name] ){
            return this.curriedPool[name]
        } else {
            this.$systemError('getCurry', 'curry not found.', name)
        }
    }

    // compile

    currying(options){
        let curry = new Curry(options, this)
        if( this.$noKey('currying', this.curriedPool, curry.name ) ){
            this.curriedPool[curry.name] = curry
        }
    }

    addMethod(options) {
        let method = new Method(options, this)
        if( this.$noKey('addMethod', this.pool, method.name ) ){
            this.pool[method.name] = method
        }
    }

    // has

    hasCurry(name) {
        return !!this.curriedPool[name]
    }

    hasMethod(name) {
        return !!this.pool[name]
    }

}
class Method extends ModuleBase {
    
    constructor(options = {}, group) {
        super('Method')
        this.id = 0
        this.case = new Case()
        this.used = []
        this.store = {}
        this.group = group
        this.data = this.$verify( options, {
            name : [true , ''],
            create : [false, function(){}],
            action : [true , '#function'],
            allowDirect : [false , true]
        })
        this.argumentLength = this.data.action.length
        if( this.group == null ){
            this.$systemError('init', 'No has group', this)
        }
    }

    get name() { return this.data.name }
    get groupCase() { return this.group.case }

    turn(target) {
        this.case = target
        return this
    }

    install() {
        this.initBindData()
        this.data.create.bind(this.case)(this.bind.create)
        this.install = null
    }

    initBindData() {
        this.bind = {
            create: {
                store: this.store,
                include: this.include.bind(this),
            },
            system: {
                store: this.store,
                group: this.groupCase,
                include: this.include.bind(this),
            },
            action: this.data.action.bind(this.case)
        }
    }

    createLambda(func, type) {
        let self = this
        return function () {
            let params = [...arguments]
            let callback = null
            if (type === 'action') {
                if (typeof params.slice(-1)[0] === 'function') {
                    callback = params.pop()
                } else {
                    self.$systemError('createLambda', 'Action must callback, no need? try direct!')
                }
            }
            let args = new Array(self.argumentLength - 3)
            for (let i = 0; i < args.length; i++) {
                args[i] = params[i]
            }
            return func.bind(self)(args, callback)
        }
    }

    include(name) {
        return this.group.getMethod(name).use()
    }

    direct(params){
        if (this.data.allowDirect === false) {
            this.$systemError('direct', 'Not allow direct.', this.data.name)
        }
        let output = null
        let error = function(error) {
            throw new Error(error)
        }
        let success = function(data) {
            output = data
        }
        this.bind.action(...params, this.bind.system, error, success);
        return output
    }

    action(params, callback = function() {}) {
        let error = function(error){
            callback(error, null);
        }
        let success = function(success) {
            callback(null, success);
        }
        this.bind.action(...params, this.bind.system, error, success);
    }

    promise(params) {
        return new Promise((resolve, reject)=>{
            this.bind.action(...params, this.bind.system, resolve, reject);
        })
    }

    getStore(key) {
        if (this.store[key]) {
            return this.store[key]
        } else {
            this.$systemError('getStore', 'Key not found.', key)
        }
    }

    use() {
        if (this.install) {
            this.install()
        }
        return {
            store: this.getStore.bind(this),
            direct: this.createLambda(this.direct),
            action: this.createLambda(this.action, 'action'),
            promise: this.createLambda(this.promise)
        }
    }

}

class Gene extends ModuleBase {

    /**
     * @member {object} genetic 預註冊的屬性，每次建立messenger會同步複製
     */

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
            this.$systemError( 'setName', 'Name not a string.', name );
        }
    }

    setTraceBaseMode(enable, action) {
        if (typeof enable === "boolean" && typeof action === "function") {
            if (enable) {
                this.mode.traceBase = { action }
            }
        } else {
            this.$systemError( 'setTraceBaseMode', 'Params type error. try setTraceBaseMode(boolean, function)' );
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
     * @function setCatchUncaughtExceptionMode(enable,action)
     * @desc 設定捕捉未捕獲Exception模式
     */

    setCatchUncaughtExceptionMode( enable, action ) {
        if (typeof enable === "boolean" && typeof action === "function") {
            if (enable) {
                this.mode.catchUncaughtException = { action }
            }
        } else {
            this.$systemError('setCatchUncaughtException', 'Params type error, try setCatchUncaughtException(boolean, function).')
        }
    }

    setGenetic(callback){
        if (typeof callback === "function") {
            this.genetic = callback
        } else {
            this.$systemError('setGenetic', 'Params type error, try setGenetic(callback).')
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
     * @function transcription()
     * @desc 執行系統
     * @returns {Promise}
     */

    transcription() {
        return new Promise((resolve, reject) => {
            new Transcription(this, resolve, reject)
        })
    }

}

class BioreactorBase extends ModuleBase {

    constructor() {
        super("Bioreactor")
        this.groups = {};
    }

    // Get

    getGroup(name) {
        return this.groups[name]
    }

    getMethod(groupName, name) {
        return this.getGroup(groupName).getMethod(name)
    }

    getCurriedFunction(groupName, name) {
        return this.getGroup(groupName).getCurriedFunction(name)
    }

    // Add

    addGroup(name, group, options) {
        if( this.groups[name] == null ) {
            if (group instanceof MethodGroup) {
                if (group.create) {
                    group.create(options)
                }
                this.groups[name] = group
            } else {
                this.$systemError('addGroup', 'Must group.', group)
            }
        } else {
            this.$systemError('addGroup', 'Name already exists.', name)
        }
    }

    // Has

    hasGroup(name) {
        return !!this.groups[name]
    }

    hasMethod(groupName, name) {
        return !!this.getGroup(groupName).hasMethod(name)
    }

    hasCurriedFunction(groupName, name) {
        return !!this.getGroup(groupName).hasCurriedFunction(name)
    }

}

let Bioreactor = new BioreactorBase()

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
        this.templates = this.gene.templates
        this.bioreactor = Bioreactor
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
            io: this.io.bind(this),
            exit: this.exit.bind(this),
            fail: this.fail.bind(this),
            next: this.next.bind(this),
            cross: this.cross.bind(this),
            methods: this.methods.bind(this),
            addBase: this.root.addBase.bind(this.root),
            polling: this.root.polling.bind(this.root),
            createFragment: this.root.createFragment.bind(this.root)
        }
    }

    initTimeoutMode() {
        if (this.gene.mode.timeout) {
            let system = this.gene.mode.timeout
            let params = {
                name: 'timeout',
                action: (finish) => {
                    if (this.root.status.operationTime > system.millisecond) {
                        this.root.createSystemStatus('timeout', true)
                        system.action.bind(this.case)(this.base, this.bind.exit, this.bind.fail)
                        finish()
                    }
                }
            }
            this.root.polling(params)
        }
    }

    /**
     * @function initCatchUncaughtExceptionMode
     * @desc 初始化捕捉異步錯誤
     */

    initCatchUncaughtExceptionMode(){
        if( this.gene.mode.catchUncaughtException ){
            this.uncaughtExceptionAction = (error) => {
                let exception = error.stack ? error : error.error
                this.root.createSystemStatus('uncaught exception', true, exception.message)
                this.gene.mode.catchUncaughtException.action.bind(this.case)(this.base, exception, this.bind.exit, this.bind.fail)
            }
            if( this.root.operating === 'node' ){
                this.uncaughtExceptionDomain = require('domain').create();
                this.uncaughtExceptionDomain.on('error', this.uncaughtExceptionAction);
            }else{
                window.addEventListener('error', this.uncaughtExceptionAction);
            }
        }
    }

    initGenerator(){
        let self = this
        let generator = function * (){
            let index = 1
            let template = self.templates[0]
            if( self.gene.synthesis.initiation ){
                self.gene.synthesis.initiation.bind(self.case)(self.base, self.getSkill(), self.bind.next, self.bind.exit, self.bind.fail)
                yield
            }
            while( index <= 10000 ){
                if (self.finish) {
                    break
                } else {
                    if( template == null ){
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

    deepClone(obj, hash = new WeakMap()) {
        if (Object(obj) !== obj) return obj
        if (obj instanceof Set) return new Set(obj)
        if (hash.has(obj)) return hash.get(obj)
        const result = obj instanceof Date ? new Date(obj)
                     : obj instanceof RegExp ? new RegExp(obj.source, obj.flags)
                     : Object.create(null)
        hash.set(obj, result)
        if (obj instanceof Map)
            Array.from(obj, ([key, val]) => result.set(key, this.deepClone(val, hash)) )
        return Object.assign(result, ...Object.keys(obj).map (
            key => ({ [key]: this.deepClone(obj[key], hash) }) ))
    }

    getSkill() {
        return {
            io: this.bind.io,
            cross: this.bind.cross,
            methods: this.bind.methods,
            polling: this.bind.polling,
            addBase: this.bind.addBase,
            createFragment: this.bind.createFragment
        }
    }

    /**
     * @function method()
     * @desc 獲取使用的模塊
     */

    methods(groupName, name){
        return this.bioreactor.getMethod(groupName, name).use()
    }

    io(groupName, name){
        return this.bioreactor.getCurriedFunction(groupName, name).use()
    }

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

    close(success, message) {
        this.root.close(success, message)
        if (this.gene.mode.catchUncaughtException && this.root.operating !== 'node') {
            window.removeEventListener('error', this.uncaughtExceptionAction)
        }
        if (this.gene.synthesis.termination) {
            this.gene.synthesis.termination.bind(this.case)(this.base, this.root.rootStatus);
        }
    }

    /**
     * @function fail(error)
     * @desc 拒絕並傳遞錯誤
     */

    fail(error) {
        if (this.finish === false) {
            this.finish = true
            this.close(false, error)
            this.reject(new Messenger(this.root))
        }
    }

    /**
     * @function exit()
     * @desc 成功並結束模板
     */

    exit(message){
        if (this.finish === false) {
            this.finish = true
            this.close(true, message)
            this.resolve(new Messenger(this.root))
        }
    }

    /**
     * @function next()
     * @desc 前往下個貯列
     */

    next(){
        if (this.finish === false) {
            if (this.gene.mode.traceBase) {
                this.gene.mode.traceBase.action(this.deepClone(this.root.getBase()), this.status)
            }
            if (this.gene.synthesis.elongation) {
                this.gene.synthesis.elongation(this.base, this.bind.exit, this.bind.fail)
            }
            setTimeout(()=>{
                this.synthesis()
            }, 1)
        }
    }

    synthesis(){
        this.synthesisTryCatchMode()
    }

    synthesisTryCatchMode(){
        if( this.gene.mode.catchException ){
            try{
                this.synthesisCatchUncaughtExceptionMode()
            } catch (exception) {
                if (this.gene.mode.catchException) {
                    this.root.createSystemStatus('error catch', true, exception.message)
                    this.gene.mode.catchException.action.bind(this.case)(this.base, exception, this.bind.exit, this.bind.fail)
                }
                return false
            }
        } else {
            this.synthesisCatchUncaughtExceptionMode()
        }
    }

    synthesisCatchUncaughtExceptionMode(){
        if( this.gene.mode.catchUncaughtException && this.root.operating === "node" ){
            this.uncaughtExceptionDomain.run(() => {
                this.iterator.next()
            });
        } else {
            this.iterator.next()
        }
    }

}

/**
 * @class Nucleoid()
 * @desc 核心
 */

class Nucleoid {

    static addGroup( groupName, group, options ) {
        Bioreactor.addGroup( groupName, group, options );
    }

    static hasCurriedFunction(groupName, name) {
        return Bioreactor.hasCurriedFunction(groupName, name)
    }

    static hasMethod(groupName, name) {
        return Bioreactor.hasMethod(groupName, name)
    }

    static hasGroup(name) {
        return Bioreactor.hasGroup(groupName, name)
    }

    static callMethod(groupName, name) {
        return Bioreactor.getMethod(groupName, name).use()
    }

    static callCurriedFunction(groupName, name) {
        return Bioreactor.getCurriedFunction(groupName, name).use()
    }

    static createMethodGroup(options) {
        return new MethodGroup(options)
    }

    static createGene(name) {
        return new Gene(name)
    }

}


            let __re = Nucleoid;
            
            return __re;
        
    })
