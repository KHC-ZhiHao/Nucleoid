

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
            console.log( `%c error object is : `, 'color:#FFF; background:red' );
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
                return getter[key];
            },
        })
    }

}

class Case {}
class Root extends ModuleBase {

    constructor(name) {
        super("Root")
        this.name = name
        this.delay = 10
        this.startTime = 0
        this.operating = typeof window === 'undefined' ? 'node' : 'browser'
        this.pollingEvents = []
    }

    get operationTime() {
        return Date.now() - this.startTime
    }

    install() {
        this.status = new Status(this, null, this.name, 'root')
        this.startTime = Date.now()
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

    polling(options, status) {
        this.pollingEvents.push(new PollingEvent(this, status || this.status, options))
    }

    clearPollingEvents() {
        this.pollingEvents = this.pollingEvents.filter((d) => {
            return d.finish === false
        })
    }

    createFragment(name, status) {
        let fragment = new Fragment(this, status || this.status, name)
        return fragment.use()
    }

    bindFragment(status) {
        return (name) => {
            return this.createFragment(name, status)
        }
    }

    bindPolling(status) {
        return (options) => {
            return this.polling(options, status)
        }
    }

    close() {
        clearInterval(this.interval)
    }

}

class PollingEvent extends ModuleBase {

    constructor(root, status, options) {
        super('PollingEvent')
        this.status = new Status(root, status, options.name, 'polling')
        this.action = options.action
        this.finish = false
    }

    activate() {
        this.action(this.close.bind(this))
    }

    close() {
        this.finish = true
        this.status.set(true)
    }

}

class Fragment extends ModuleBase {

    constructor(root, status, name) {
        super('Fragment')
        this.root = root
        this.over = 0
        this.name = name || 'no name'
        this.stop = false
        this.thread = []
        this.status = new Status(this.root, status, this.name, 'fragment')
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
            status.set(false, error)
            if( this.stop === false ){
                this.stop = true
                this.status.set(false, error)
                this.callback(error)
            }
        }
    }

    regsterOnload(status) {
        return () => {
            status.set(true)
            this.over += 1
            if( this.stop === false ){
                if( this.over >= this.thread.length ){
                    this.stop = true
                    this.status.set(true)
                    this.callback()
                }
            }
        }
    }

    actionThread(thread) {
        let func = async() => {
            let status = new Status(this.root, this.status, thread.name, 'fragment-base')
            let onload = this.regsterOnload(status)
            let error = this.regsterError(status)
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

class Status extends ModuleBase{

    constructor(root, parent, name, type) {
        super("Status")
        this.root = root || null
        this.name = name || 'no name'
        this.type = type || 'no type'
        this.parent = parent
        this.message = ''
        this.success = false
        this.children = []
        this.attributes = {}
        this.operationTime = 0
        if (this.parent) {
            this.parent.addChildren(this)
        }
    }

    add(name, message = null) {
        this.attributes[name] = message || ''
    }

    set(success, message) {
        this.success = success
        this.message = message || ''
        this.operationTime = this.root.operationTime
    }

    get() {
        let data = {
            name: this.name,
            type: this.type,
            message: this.message,
            success: this.success,
            attributes: this.attributes,
            children: [],
            operationTime: this.operationTime
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
            methods: [true, {}]
        })
        this.checkPrivateKey()
    }

    get name() { return this.data.name }

    checkPrivateKey() {
        let check = this.data.methods
        if( check.action || check.promise ){
            this.$systemError('init', 'Methods has private key(action, promise, direct)')
        }
    }

    use() {
        return (params) => {
            let unit = new CurryUnit(this, params);
            return unit.getRegisterMethod();
        }
    }

}

class CurryUnit extends ModuleBase {

    constructor(main, params) {
        super("CurryUnit");
        this.case = new Case()
        this.flow = []
        this.main = main;
        this.index = 0;
        this.params = params;
        this.previousFlow = null;
        this.initRegisterMethod();
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

    initRegisterMethod() {
        let self = this;
        this.registergMethod = {
            action: this.action.bind(this),
            promise: this.promise.bind(this)
        }
        for( let key in this.main.data.methods ){
            this.registergMethod[key] = function() {
                self.register(key, [...arguments]);
                return self.getRegisterMethod();
            }
        }
    }

    getRegisterMethod() {
        return this.registergMethod;
    }

    register(name, params) {
        let data = {
            name: name,
            nextFlow: null,
            previous: this.flow.slice(-1),
            index: this.index,
            method: this.main.data.methods[name],
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

    activation(error, success) {
        let stop = false;
        let index = 0;
        let reject = (err) => {
            error(err);
            stop = true
        }
        let finish = () => {
            index += 1
            if( stop === false ){ run() }
        }
        let run = () => {
            let flow = this.flow[index]
            if( flow ){
                flow.method.bind(this.case)( ...flow.params, {
                    index: flow.index,
                    include: this.include.bind(this),
                    nextFlow: flow.nextFlow,
                    previous: flow.previous
                }, reject, finish)
            } else {
                this.main.data.output.bind(this.case)({
                    include: this.include.bind(this),
                }, (error)=>{
                    reject(error)
                }, (result)=>{
                    success(result)
                })
            }
        }
        let pass = ()=>{
            run();
            pass = ()=>{}
        }
        this.main.data.input.bind(this.case)( this.params, { include: this.include.bind(this) }, reject, pass );
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
        super('Method');
        this.case = new Case()
        this.store = {};
        this.group = group;
        this.data = this.$verify( options, {
            name : [true , ''],
            create : [false, function(){}],
            action : [true , '#function'],
            allowDirect : [false , true]
        })
        if( this.group == null ){
            this.$systemError('init', 'No has group', this)
        }
    }

    get name() { return this.data.name }
    get groupCase() { return this.group.case }

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
        this.bind.action(params, this.bind.system, error, success);
        return output
    }

    action(params, callback = function(){}) {
        let error = function(error){
            callback(error, null);
        }
        let success = function(success) {
            callback(null, success);
        }
        this.bind.action(params, this.bind.system, error, success);
    }

    promise(params) {
        return new Promise((resolve, reject)=>{
            this.bind.action(params, this.bind.system, resolve, reject);
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
            direct: this.direct.bind(this),
            action: this.action.bind(this),
            promise: this.promise.bind(this)
        }
    }

}

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
 * @class Translation(gene)
 * @desc 轉譯gene並輸出messenger，他會在運行Gene Translation實例化，保護其不被更改到
 */

class Translation extends ModuleBase {

    constructor(gene, resolve, reject){
        super("Translation");
        this.case = new Case()
        this.gene = gene
        this.root = gene.root
        this.status = this.root.status
        this.finish = false
        this.reject = reject
        this.resolve = resolve
        this.templates = this.gene.templates
        this.messenger = this.gene.polymerase.messenger
        this.bioreactor = Bioreactor
        this.init()
        this.synthesis()
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
            mixin: this.mixin.bind(this),
            methods: this.methods.bind(this)
        }
    }

    initTimeoutMode() {
        if (this.gene.mode.timeout) {
            let system = this.gene.mode.timeout
            let params = {
                name: 'timeout',
                action: (finish) => {
                    if (this.root.operationTime > system.millisecond) {
                        this.status.add('timeout')
                        system.action.bind(this.case)(this.messenger, this.bind.exit, this.bind.fail)
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
                this.status.add('uncaughtException', exception.message);
                this.gene.mode.catchUncaughtException.action.bind(this.case)(this.messenger, exception, this.bind.exit, this.bind.fail)
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
            let index = 0
            let template = self.templates[0]
            if( self.gene.synthesis.initiation ){
                self.gene.synthesis.initiation.bind(self.case)(self.messenger, self.bind.exit, self.bind.fail)
            }
            while( index <= 10000 ){
                if( self.finish ){
                    break;
                } else {
                    if( template == null ){
                        self.bind.exit()
                    } else {
                        let status = new Status(self.root, self.status, template.name, 'template')
                        let next = () => {
                            next = null
                            status.set(true)
                            template = self.templates[index++]
                            self.bind.next()
                        }
                        template.action.bind(self.case)(self.messenger, self.getSkill(status), next, self.bind.exit, self.bind.fail)
                    }
                }
                yield;
            }
            return;
        }
        this.iterator = generator();
    }

    getSkill(status) {
        return {
            io: this.bind.io,
            mixin: this.bind.mixin,
            methods: this.bind.methods,
            polling: this.root.bindPolling(status),
            createFragment: this.root.bindFragment(status)
        }
    }

    /**
     * @function method()
     * @desc 獲取使用的模塊
     */

    methods(groupName, name){
        return this.bioreactor.getMethod(groupName, name).use();
    }

    io(groupName, name){
        return this.bioreactor.getCurriedFunction(groupName, name).use();
    }

    mixin(gene, callback) {
        if (gene instanceof Gene) {
            gene.translation().then((result) => {
                this.status.addChildren(result.status)
                callback(null, result.messenger)
            }, (error) => {
                this.status.addChildren(error.status)
                callback({
                    error: error.error,
                    messenger: error.messenger
                }, null)
            })
        } else {
            this.$systemError('mixin', 'Target not a gene module.', gene)
        }
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
        return mode
    }

    close() {
        this.status.add('mode', this.getMode())
        this.root.close()
        if (this.gene.mode.catchUncaughtException && this.root.operating !== 'node') {
            window.removeEventListener('error', this.uncaughtExceptionAction)
        }
        if (this.gene.synthesis.termination) {
            this.gene.synthesis.termination.bind(this.case)(this.messenger, this.status);
        }
    }

    /**
     * @function fail(error)
     * @desc 拒絕並傳遞錯誤
     */

    fail(error) {
        if (this.finish === false) {
            this.finish = true
            this.status.set(false, error)
            this.close()
            this.reject({
                error,
                status: this.status,
                messenger: this.messenger
            })
        }
    }

    /**
     * @function exit()
     * @desc 成功並結束模板
     */

    exit(){
        if (this.finish === false) {
            this.finish = true
            this.status.set(true)
            this.close()
            this.resolve({
                status: this.status,
                messenger : this.messenger
            });
        }
    }

    /**
     * @function next()
     * @desc 前往下個貯列
     */

    next(){
        if (this.finish === false) {
            if( this.gene.synthesis.elongation ){
                this.gene.synthesis.elongation( this.messenger, this.bind.exit, this.bind.fail )
            }
            setTimeout(()=>{
                this.synthesis();
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
                this.status.add('catch', exception.message)
                if (this.gene.mode.catchException) {
                    this.gene.mode.catchException.action.bind(this.case)(this.messenger, exception, this.bind.exit, this.bind.fail)
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
                this.iterator.next();
            });
        } else {
            this.iterator.next();
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
