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
        this.templates = this.gene.templates.concat(this.gene.lastTemplates)
        this.forceClose = false
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
        this.initTimeoutMode()
        this.initGenerator()
        this.initCatchUncaughtExceptionMode()
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
        if (this.gene.mode.isEnable('timeout')) {
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
        if (this.gene.mode.isEnable('uncaught-exception-mode')) {
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

    /**
     * @function initGenerator()
     * @desc 初始化一個生成器
     */

    initGenerator(){
        let self = this
        let generator = function * (){
            let index = 1
            let template = self.templates[0]
            if (self.gene.mode.isEnable('initiation')) {
                self.gene.mode.use('initiation').action.call(self.case, self.base, self.getSkill(), self.bind.next, self.bind.exit, self.bind.fail)
                yield
            }
            while (index <= 10000) {
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
                        template.action.call(self.case, self.base, self.getSkill(), next, self.bind.exit, self.bind.fail)
                    }
                }
                yield
            }
            return
        }
        this.iterator = generator()
    }

    /**
     * @function getSkill()
     * @desc 獲取可用技能
     * @returns {each, auto, cross, polling, addBase, deepClone, frag, createFragment}
     */

    getSkill() {
        return {
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
            if (this.gene.mode.isEnable('uncaught-exception-mode') && this.root.operating !== 'node') {
                window.removeEventListener('error', this.uncaughtExceptionAction)
            }
            if (this.gene.mode.isEnable('termination')) {
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
            if (this.gene.mode.isEnable('trace-base-mode')) {
                this.gene.mode.use('trace-base-mode').action.call(this.case, Supports.deepClone(this.base), this.status)
            }
            if (this.gene.mode.isEnable('elongation')) {
                this.gene.mode.use('elongation').action.call(this.case, this.base, this.bind.exit, this.bind.fail)
            }
            setTimeout(()=>{
                this.synthesis()
            }, 1)
        }
    }

    /**
     * @function synthesis()
     * @desc TryCatch與CatchUncaughtException其實需要一個統一的傳遞街口
     */

    synthesis(){
        this.synthesisTryCatchMode()
    }

    /**
     * @function synthesisTryCatchMode()
     * @desc 開啟TryCatch模式
     */

    synthesisTryCatchMode(){
        if (this.gene.mode.isEnable('try-catch-mode')) {
            try{
                this.synthesisCatchUncaughtExceptionMode()
            } catch (exception) {
                this.forceClose = true
                this.root.createSystemStatus('error catch', true, exception.stack)
                this.gene.mode.use('try-catch-mode').action.call(this.case, this.base, exception, this.bind.exit, this.bind.fail)
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

    synthesisCatchUncaughtExceptionMode(){
        if (this.gene.mode.isEnable('uncaught-exception-mode') && this.root.operating === "node") {
            this.uncaughtExceptionDomain.run(() => {
                this.iterator.next()
            });
        } else {
            this.iterator.next()
        }
    }

}
