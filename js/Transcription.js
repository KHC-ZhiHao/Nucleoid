/**
 * @class Transcription(nucleoid,callback)
 * @desc 轉錄nucleoid並輸出messenger，他會在運行Nucleoid Transcription實例化，保護其不被更改到
 */

class Transcription extends ModuleBase {

    constructor( nucleoid, callback ){
        super("Transcription");
        this.name = "";
        this.start = Date.now();
        this.stack = [];
        this.finish = false;
        this.operating = typeof window === 'undefined' ? 'node' : 'browser';
        this.runIndex = 0;
        this.callback = callback;
        this.nucleoid = nucleoid;
        this.initTimeOut();
        this.initGenerator();
        this.initUncaughtException();
        this.validateNucleoid();
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
            trymode : [true, 'boolean'],
            trymodeError : [false, 'function'],
            timeout : [false, 'number'],
            timeoutError : [false, 'function'],
            promoter : [false, 'function'],
            messenger : [true, 'object'],
            mediator : [false, 'function'],
            methods : [false, 'object'],
            terminator : [false, 'function'],
            uncaughtExceptionError: [false, 'function']
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
        if( Array.isArray(this.nucleoid.genes) === false ){
            this.systemError( 'validateNucleoid', `Data type must array.`, this.nucleoid.genes );
            return false;
        }
        for( let i = 0; i < this.nucleoid.genes.length; i++ ){
            let target = this.nucleoid.genes[i]
            if( typeof target.name !== "string" || typeof target.action !== "function" ){
                this.systemError( 'validateNucleoid', `Genes type Incorrect.`, target );
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
        if( step === "queue" ){
            stack.used = [];
        }
        this.stack.push(stack)
    }

    /**
     * @function initGenerator()
     * @desc 初始化Generator
     */

    initGenerator(){
        let max = 10000;
        let self = this;
        let exit = this.exit.bind(this);
        let getMethods = this.getMethods.bind(this)
        let generator = function * (){
            if( self.nucleoid.timeoutError && self.nucleoid.timeout ){
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
                    if( self.nucleoid.genes[self.runIndex] == null ){
                        self.addStack('finish');
                        exit();
                    } else {
                        let next = self.next.bind(self);
                        self.addStack( 'queue', self.nucleoid.genes[self.runIndex].name );
                        self.nucleoid.genes[self.runIndex].action( self.nucleoid.messenger, ()=>{
                            if( next ){ 
                                next();
                                next = null;
                            } else {
                                console.warn(`Nucleoid(${self.nucleoid.name}) => Next already called.`)
                            }
                        }, getMethods)
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
        if( this.nucleoid.uncaughtExceptionError != null ){
            let error = (error) => {
                this.addStack('uncaught exception', error.message);
                this.nucleoid.uncaughtExceptionError( this.nucleoid.messenger, error )
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
            this.nucleoid.timeoutError(this.nucleoid.messenger);
            this.exit();
        }
    }

    /**
     * @function getMethods()
     * @desc 獲取使用的模塊
     */

    getMethods(name){
        if( this.nucleoid.methods[name] ){
            this.stack.slice(-1)[0].used.push(MethodBucket.getMaps(name))
            return this.nucleoid.methods[name]
        } else {
            this.systemError('getMethods', `Methods(${name}) not found`)
        }
    }

    /**
     * @function getMethods()
     * @desc 獲取模式
     */

    getMode(){
        let mode = [];
        if( this.nucleoid.trymode ){
            mode.push('try-catch-mode');
        }
        if( this.nucleoid.timeoutError ){
            mode.push('timeout');
        }
        if( this.nucleoid.uncaughtExceptionError ){
            mode.push('uncaught-exception-mode')
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
            totalRunTime : this.now,
            useMethods : Object.keys(this.nucleoid.methods)
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
            if( this.nucleoid.uncaughtExceptionError != null && this.operating !== 'node' ){
                window.removeEventListener('error', this.uncaughtExceptionError)
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
                this.nucleoid.mediator( this.nucleoid.messenger, this.exit.bind(this) )
            }
            setTimeout(()=>{
                this.doNext();
            }, 1)
        }
    }

    doNext(){
        this.actionTryMode()
    }

    actionTryMode(){
        if( this.nucleoid.trymode ){
            try{
                this.actionUncaughtException();
            } catch (exception) {
                if( this.nucleoid.trymodeError ){
                    this.nucleoid.trymodeError( this.nucleoid.messenger, exception )
                }
                this.addStack('catch', exception.message);
                this.exit();
            }
        } else {
            this.actionUncaughtException();
        }
    }

    actionUncaughtException(){
        if( this.nucleoid.uncaughtExceptionError && this.operating === "node" ){
            this.uncaughtExceptionDomain.run(() => {
                this.runtime.next();
            });
        } else {
            this.runtime.next();
        }
    }

}