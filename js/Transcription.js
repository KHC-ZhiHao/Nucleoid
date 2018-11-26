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