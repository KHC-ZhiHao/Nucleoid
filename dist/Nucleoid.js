

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
        this.baseName = name;
    }

    /**
     * @function systemError(functionName,maessage,object)
     * @desc 於console呼叫錯誤，中斷程序並顯示錯誤的物件
     */

    systemError( functionName, message, object = '$_no_error' ){
        if( object !== '$_no_error' ){
            console.log( `%c error object is : `, 'color:#FFF; background:red' );
            console.log( object );
        }
        throw new Error( `(☉д⊙)!! Nucleoid::${this.baseName} => ${functionName} -> ${message}` );
    }

    noKey( functionName, target, key ) {
        if( target[key] == null ){
            return true;
        } else {
            this.systemError( functionName, 'Name already exists.', key );
            return false;
        } 
    }

    verify(data, validate) {
        let newData = {}
        for( let key in validate ){
            let v = validate[key];
            if( v[0] && data[key] == null ){
                this.systemError('verify', 'Must required', key);
                return;
            }
            if( data[key] ){
                if( typeof v[1] === typeof data[key] ){
                    newData[key] = data[key];
                } else {
                    this.systemError('verify', `Type(${typeof v[1]}) error`, key);
                }
            } else {
                newData[key] = v[1];
            }
        }
        return newData;
    }

}

class Case {}
class MethodGroup extends ModuleBase {

    constructor(options = {}, main) {
        super("MethodGroup")
        this.main = main || false
        this.case = new Case();
        this.pool = {};
        this.store = {};
        this.data = this.verify(options, {
            create: [false, function(){}]
        })
    }

    create(options){
        this.data.create.bind(this.case)(this.store, options)
        this.create = null;
    }

    getMethod(name) {
        if( this.main ){
            return MethodBucket.getMethod(name)
        } else {
            if( this.pool[name] ){
                return this.pool[name]
            } else {
                this.systemError('getMethod', 'method not found.', name)
            }
        }
    }

    addMethod(options) {
        let method = new Method(options, this)
        if( this.noKey('addMethod', this.pool, method.name ) ){
            this.pool[method.name] = method
        }
    }

    hasMethod(name) {
        return !!this.pool[name]
    }

}
class Method extends ModuleBase {
    
    constructor( options = {}, group ) {
        super('Method');
        this.used = [];
        this.store = {};
        this.group = group;
        this.data = this.verify(options, {
            name: [true, ''],
            create: [false, function(){}],
            action: [true, function(){}]
        })
        this.init();
    }

    get name() { return this.data.name }

    init() {
        if( this.group == null ){
            this.systemError('init', 'No has group', this)
        }
        if( this.name.includes('-') ){
            this.systemError('init', 'Symbol - is group protection.', name)
        }
        this.case = new Case()
    }

    create() {
        this.data.create.bind(this.case)({
            store: this.store,
            include: this.include.bind(this)
        });
        this.create = null
    }

    include(name) {
        if( this.used.includes(name) === false ){
            this.used.push(name)
        }
        return this.group.getMethod(name).use()
    }

    getGroupStore(name) {
        return this.group.store[name]
    }

    system() {
        return {
            store: this.store,
            getGroupStore: this.getGroupStore.bind(this)
        }
    }

    direct(params){
        let output = null
        let success = function(data){
            output = data
        }
        this.data.action.bind(this.case)( params, this.system(), function(){}, success );
        return output
    }

    action(params, callback = function(){}) {
        let error = function(error){
            callback(error, null);
        }
        let success = function(success) {
            callback(null, success);
        }
        this.data.action.bind(this.case)( params, this.system(), error, success );
    }

    promise(params) {
        return new Promise(( resolve, reject )=>{
            this.data.action.bind(this.case)( params, this.system(), reject, resolve );
        })
    }

    getStore(key) {
        if( this.store[key] ){
            return this.store[key]
        } else {
            this.systemError('getStore', 'Key not found.', key)
        }
    }

    use() {
        if( this.create ){ 
            this.create()
        }
        return {
            store: this.getStore.bind(this),
            direct: this.direct.bind(this),
            action: this.action.bind(this),
            promise: this.promise.bind(this)
        }
    }

}

class Bucket extends ModuleBase {

    constructor() {
        super("Bucket")
        this.mainGroup = new MethodGroup( {}, true );
        this.groups = {};
    }

    hasGroup(name) {
        return !!this.groups[name]
    }

    hasMethod(name) {
        return !!this.mainGroup.hasMethod(name)
    }

    getMethod(name) {
        let groupMode = name.includes('-');
        let split = groupMode ? name.split('-') : [null, name];
        let target = groupMode ? this.groups[split[0]] : this.mainGroup
        if( target ){
            let method = target.pool[split[1]];
            if( method ){
                return method
            } else {
                console.log(this)
                this.systemError('getMethod', 'Method not found.', split[1])
            }
        } else {
            this.systemError('getMethod', 'Group not found.', split[0])
        }
    }

    addMethod(method) {
        this.mainGroup.addMethod(method)
    }

    addGroup(name, group, options) {
        if( this.groups[name] == null ) {
            if( group instanceof MethodGroup ){
                if( group.create ){
                    group.create(options)
                }
                this.groups[name] = group;
            } else {
                this.systemError('addGroup', 'Must group.', group)
            }
        } else {
            this.systemError('addGroup', 'Name already exists.', name);
        }
    }

}

let MethodBucket = new Bucket()
/**
 * @class Transcription(nucleoid,callback)
 * @desc 轉錄nucleoid並輸出messenger，他會在運行Nucleoid Transcription實例化，保護其不被更改到
 */

class Transcription extends ModuleBase {

    constructor( nucleoid, callback, reject ){
        super("Transcription");
        this.name = "";
        this.used = [];
        this.start = Date.now();
        this.stack = [];
        this.fail = null;
        this.finish = false;
        this.reject = reject;
        this.operating = typeof window === 'undefined' ? 'node' : 'browser';
        this.runIndex = 0;
        this.callback = callback;
        this.nucleoid = nucleoid;
        this.targetStack = null;
        this.initTimeOut();
        this.initGenerator();
        this.initUncaughtException();
        this.validateNucleoid();
    }

    getSystem() {
        return {
            fail: this.callFail.bind(this),
            mixin: this.mixin.bind(this),
            methods: this.methods.bind(this),
            template: this.template.bind(this)
        }
    }

    template({thread, error, finish}) {
        let over = 0;
        let stop = false;
        let uning = 0;
        let threadList = [];
        let onload = function() {
            over += 1;
            if( over === uning && stop === false ){
                finish();
            }
        }
        let reject = function(e) {
            if( stop === false ){
                stop = true
                error(e);
            }
        }
        let regster = async function(action){
            uning += 1;
            threadList.push(action);
        }
        thread(regster);
        for( let i = 0; i < threadList.length; i++ ){
            threadList[i](onload, reject);
        }
        if( threadList.length === 0 ){
            finish();
        }
    }
    
    /**
     * @function method()
     * @desc 獲取使用的模塊
     */

    methods(name){
        let method = MethodBucket.getMethod(name).use();
        this.addStackExtra('used', {
            name : name,
            used : MethodBucket.getMethod(name).used
        }, 'list');
        return method;
    }

    mixin(nucleoid, callback) {
        if (nucleoid instanceof Nucleoid) {
            nucleoid.transcription().then((result)=>{
                this.addStackExtra('mixin', {
                    status: result.status
                });
                callback(null, result.messenger)
            }, (error) => {
                callback(error, null)
            })
        } else {
            this.systemError('mixin', `Target not a nucleoid module.`, nucleoid)
        }
    }

    callFail(error) {
        this.fail = true
        this.reject({
            error,
            messenger: this.nucleoid.messenger,
            status: this.createStatus()
        })
    }

    /**
     * @member {numbre} 當前時間
     */

    get now(){
        return Date.now() - this.start;
    }

    /**
     * @function validateNucleoid()
     * @desc 驗證Nucleoid的結構是否正確，是開始運行
     */

    validateNucleoid(){
        if( this.validate() ){
            this.name = this.nucleoid.name;
            this.doNext();
        }
    }

    /**
     * @function validate()
     * @desc 驗證Nucleoid過程
     */

    validate(){
        let template = {
            name : [true, 'string'],
            tryCatchMode : [true, 'boolean'],
            tryCatchModeAction : [false, 'function'],
            timeout : [false, 'number'],
            timeoutAction : [false, 'function'],
            promoter : [false, 'function'],
            messenger : [true, 'object'],
            mediator : [false, 'function'],
            terminator : [false, 'function'],
            uncaughtException: [true, 'boolean'],
            uncaughtExceptionAction: [false, 'function']
        }
        //cycle
        for( let key in template ){
            let target = this.nucleoid[key];
            if( template[key][0] && target == null ){
                this.systemError( 'validateNucleoid', `Data ${key} must required.`, target );
                return false;
            }
            if( target !== null && template[key][1] !== typeof target ){
                this.systemError( 'validateNucleoid', `Data type must ${template[key][1]}.`, target );
                return false;
            }
        }
        //gene
        if( Array.isArray(this.nucleoid.queues) === false ){
            this.systemError( 'validateNucleoid', `Data type must array.`, this.nucleoid.queues );
            return false;
        }
        for( let i = 0; i < this.nucleoid.queues.length; i++ ){
            let target = this.nucleoid.queues[i]
            if( typeof target.name !== "string" || typeof target.action !== "function" ){
                this.systemError( 'validateNucleoid', `Queues type Incorrect.`, target );
                return false;
            }
        }
        return true;
    }

    /**
     * @function addStack(step,desc)
     * @desc 加入一個堆棧追蹤
     * @param {string} step 堆棧名稱 
     */

    addStack( step, desc ){
        let stack = {
            step : step,
            start : this.now,
        }
        if( desc ){
            stack.desc = desc
        }
        this.stack.push(stack)
        return stack
    }

    addStackExtra( name, extra, mode ){
        if( this.targetStack ){
            if( mode === "list" ){
                if( this.targetStack[name] == null ){
                    this.targetStack[name] = [];
                }
                this.targetStack[name].push(extra);
            } else {
                this.targetStack[name] = extra;
            }
        }
    }

    /**
     * @function initGenerator()
     * @desc 初始化Generator
     */

    initGenerator(){
        let max = 10000;
        let self = this;
        let exit = this.exit.bind(this);
        let generator = function * (){
            if( self.nucleoid.timeoutAction && self.nucleoid.timeout ){
                self.timeout = setTimeout( self.timeoutEvent, self.nucleoid.timeout )
            }
            if( self.nucleoid.promoter ){
                self.addStack('promoter');
                self.nucleoid.promoter( self.nucleoid.messenger, exit );
            }
            while( max >= 0 ){
                if( self.finish ){
                    break;
                } else {
                    if( self.nucleoid.queues[self.runIndex] == null ){
                        self.addStack('finish');
                        exit();
                    } else {
                        let next = self.next.bind(self);
                        self.targetStack = self.addStack( 'queue', self.nucleoid.queues[self.runIndex].name );
                        self.nucleoid.queues[self.runIndex].action( self.nucleoid.messenger, self.getSystem(), ()=>{
                            if( next ){ 
                                next();
                                next = null;
                            } else {
                                console.warn(`Nucleoid(${self.nucleoid.name}) => Next already called.`)
                            }
                        })
                        self.runIndex += 1;
                    }
                }
                max--
                yield;
            }
            return;
        }
        this.runtime = generator();
    }

    /**
     * @function initUncaughtException
     * @desc 初始化捕捉異步錯誤
     */

    initUncaughtException(){
        if( this.nucleoid.uncaughtException ){
            let error = (error) => {
                this.addStack('uncaught exception', error.message);
                this.nucleoid.uncaughtExceptionAction( this.nucleoid.messenger, error, this.callFail.bind(this) )
                this.exit()
            }
            this.uncaughtExceptionError = error.bind(this)
            if( this.operating === 'node' ){
                this.uncaughtExceptionDomain = require('domain').create();
                this.uncaughtExceptionDomain.on('error', this.uncaughtExceptionError);
            }else{
                window.addEventListener('error', this.uncaughtExceptionError);
            }
        }
    }

    /**
     * @function initTimeOut()
     * @desc 初始化Timeout事件與now時間追蹤
     */

    initTimeOut(){
        this.timeout = null;
        this.timeoutEvent = ()=>{
            this.addStack('timeout');
            this.nucleoid.timeoutAction(this.nucleoid.messenger, this.callFail.bind(this));
            this.exit();
        }
    }

    /**
     * @function getMethods()
     * @desc 獲取模式
     */

    getMode(){
        let mode = [];
        if( this.nucleoid.tryCatchMode ){
            mode.push('try-catch-mode');
        }
        if( this.nucleoid.timeoutAction ){
            mode.push('timeout');
        }
        if( this.nucleoid.uncaughtException ){
            mode.push('uncaught-exception-mode');
        }
        if( this.fail ){
            mode.push('fail');
        }
        return mode
    }

    /**
     * @function createStatus()
     * @desc 建立狀態
     */

    createStatus(){
        return {
            name : this.name,
            mode : this.getMode(),
            step : this.stack.slice(-1)[0].step,
            stack : this.stack,
            totalRunTime : this.now
        }
    }

    /**
     * @function exit()
     * @desc 跳出貯列
     */

    exit(){
        if( this.finish == false ){
            this.finish = true;
            if( this.timeout ){
                clearTimeout(this.timeout);
                this.timeout = null;
            }
            if( this.nucleoid.uncaughtException && this.operating !== 'node' ){
                window.removeEventListener('error', this.uncaughtExceptionAction)
            }
            let status = this.createStatus();
            if( this.nucleoid.terminator ){
                this.nucleoid.terminator(this.nucleoid.messenger, status);
            }
            this.callback({
                status : status,
                messenger : this.nucleoid.messenger,
            });
        } else {
            console.warn(`Nucleoid(${this.nucleoid.name}) => Exit already called.`)
        }
    }

    /**
     * @function next()
     * @desc 前往下個貯列
     */

    next(){
        if( this.finish === false ){
            if( this.nucleoid.mediator ){
                this.addStack('mediator');
                this.nucleoid.mediator( this.nucleoid.messenger, this.exit.bind(this), this.callFail.bind(this) )
            }
            setTimeout(()=>{
                this.doNext();
            }, 1)
        }
    }

    doNext(){
        this.actionTryCatchMode()
    }

    actionTryCatchMode(){
        if( this.nucleoid.tryCatchMode ){
            try{
                this.actionUncaughtException();
            } catch (exception) {
                if( this.nucleoid.tryCatchModeAction ){
                    this.nucleoid.tryCatchModeAction( this.nucleoid.messenger, exception, this.callFail.bind(this) )
                }
                this.addStack('catch', exception.message);
                this.exit();
            }
        } else {
            this.actionUncaughtException();
        }
    }

    actionUncaughtException(){
        if( this.nucleoid.uncaughtException && this.operating === "node" ){
            this.uncaughtExceptionDomain.run(() => {
                this.runtime.next();
            });
        } else {
            this.runtime.next();
        }
    }

}
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
        this.queues = [];
        this.tryCatchMode = false;
        this.tryCatchModeAction = null;
        this.timeout = 3600;
        this.timeoutAction = null;
        this.uncaughtException = false;
        this.uncaughtExceptionAction = null;
        this.promoter = null;
        this.mediator = null;
        this.terminator = null;
        this.messenger = {};
        this._protection = {};
        this.setName('No name');
    }

    static addGroup( groupName, group, options ) {
        MethodBucket.addGroup( groupName, group, options );
    }

    static addMethod(options) {
        MethodBucket.addMethod(options)
    }

    static hasMethod(name) {
        return MethodBucket.hasMethod(name)
    }

    static hasGroup(name) {
        return MethodBucket.hasGroup(name)
    }

    static callMethod(name) {
        return MethodBucket.getMethod(name).use()
    }

    static createMethodGroup(options) {
        return new MethodGroup(options)
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
            this.timeoutAction = error;
        } else {
            this.systemError( 'setTimeout', 'Params type error. try setTimeout(number, function)' );
        }
    }

    /** 
     * @function setTrymode(enable,error)
     * @desc 設定try-catch模式
     */

    setTrymode( enable, error ){
        if( typeof enable === "boolean" && ( typeof error === "function" || error == null ) ){
            this.tryCatchMode = enable;
            this.tryCatchModeAction = error;
        } else {
            this.systemError( 'setTrymode', 'Params type error, try setTrymode(boolean, function).' );
        }
    }

    /**
     * @function setUncaughtException(enable,uncaughtException)
     * @desc 設定未捕獲模式
     */

    setUncaughtException( enable, uncaughtException ) {
        if( typeof enable === "boolean" && typeof uncaughtException === "function" ){
            if( this.uncaughtExceptionAction == null ){
                this.uncaughtException = enable
                this.uncaughtExceptionAction = uncaughtException;
            } else {
                this.systemError('setUncaughtException', 'Uncaught Exception already exists.', this.uncaughtExceptionAction );
            }
        }else{
            this.systemError('setUncaughtException', 'Not a function.', uncaughtException );
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
     * @function queue(name,action)
     * @desc 加入一個貯列
     */

    queue( name, action ) {
        if( typeof name === 'string' ){
            if( typeof action === 'function' ){
                this.queues.push({
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

    setPromoter(promoter) {
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

    setMediator(mediator) {
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

    setTerminator(terminator) {
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

    transcription() {
        this.transcription = function(){
            console.warn(`Nucleoid(${this.name}) => Transcription already called.`)
        }
        return new Promise(( resolve, reject )=>{
            new Transcription( this, resolve, reject )
        })
    }

}


            let __re = Nucleoid;
            
            return __re;
        
    })
