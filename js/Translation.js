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
