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
