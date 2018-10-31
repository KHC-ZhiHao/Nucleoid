

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

    /**
     * @class ModuleBase()
     * @desc 系統殼層
     */

    class ModuleBase {

        constructor(name) {
            this.baseName = name;
        }

        /**
         * @function systemError(functionName,maessage,object)
         * @desc 於console呼叫錯誤，中斷程序並顯示錯誤的物件
         */

        systemError(functionName, message, object) {
            if (object) {
                console.log(`%c error object is : `, 'color:#FFF; background:red');
                console.log(object);
            }
            throw new Error(`(☉д⊙)!! Nucleoid::${this.baseName} => ${functionName} -> ${message}`);
        }

    }

    /**
     * @class Transcription(nucleoid,callback)
     * @desc 轉錄nucleoid並輸出messenger，他會在運行Nucleoid Transcription實例化，保護其不被更改到
     */

    class Transcription extends ModuleBase {

        constructor(nucleoid, callback) {
            super("Transcription");
            this.name = "";
            this.stack = [];
            this.finish = false;
            this.runIndex = 0;
            this.callback = callback;
            this.nucleoid = nucleoid;
            this.initTimeOut();
            this.initGenerator();
            this.validateNucleoid();
        }

        /**
         * @function validateNucleoid()
         * @desc 驗證Nucleoid的結構是否正確，是開始運行
         */

        validateNucleoid() {
            if (this.validate()) {
                this.name = this.nucleoid.name;
                this.next();
            }
        }

        /**
         * @function validate()
         * @desc 驗證Nucleoid過程
         */

        validate() {
            let template = {
                name: [true, 'string'],
                trymode: [true, 'boolean'],
                trymodeError: [false, 'function'],
                timeout: [false, 'number'],
                timeoutError: [false, 'function'],
                promoter: [false, 'function'],
                messenger: [true, 'object'],
                mediator: [false, 'function'],
                terminator: [false, 'function'],
            }
            //method
            for (let key in template) {
                let target = this.nucleoid[key];
                if (template[key][0] && target == null) {
                    this.systemError('validateNucleoid', `Data ${key} must required.`, target);
                    return false;
                }
                if (target !== null && template[key][1] !== typeof target) {
                    this.systemError('validateNucleoid', `Data type must ${template[key][1]}.`, target);
                    return false;
                }
            }
            //gene
            if (Array.isArray(this.nucleoid.genes) === false) {
                this.systemError('validateNucleoid', `Data type must array.`, this.nucleoid.genes);
                return false;
            }
            for (let i = 0; i < this.nucleoid.genes.length; i++) {
                let target = this.nucleoid.genes[i]
                if (typeof target.name !== "string" || typeof target.action !== "function") {
                    this.systemError('validateNucleoid', `Genes type Incorrect.`, target);
                    return false;
                }
            }
            return true;
        }

        /**
         * @function addStack(step)
         * @desc 加入一個堆棧追蹤
         * @param {string} step 堆棧名稱 
         */

        addStack(step) {
            this.stack.push({
                step: step,
                start: this.now,
            })
        }

        /**
         * @function initGenerator()
         * @desc 初始化Generator
         */

        initGenerator() {
            let max = 10000;
            let self = this;
            let exit = this.exit.bind(this);
            let generator = function* () {
                if (self.nucleoid.timeoutError && self.nucleoid.timeout) {
                    self.timeout = setTimeout(self.timeoutEvent, self.nucleoid.timeout)
                }
                if (self.nucleoid.promoter) {
                    self.addStack('promoter');
                    self.nucleoid.promoter(self.nucleoid.messenger, exit);
                }
                while (max >= 0) {
                    if (self.finish) {
                        break;
                    } else {
                        if (self.nucleoid.genes[self.runIndex] == null) {
                            self.addStack('finish');
                            exit();
                        } else {
                            let next = self.next.bind(self);
                            self.addStack('queue:' + self.nucleoid.genes[self.runIndex].name);
                            self.nucleoid.genes[self.runIndex].action(self.nucleoid.messenger, () => {
                                if (next) {
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
         * @function initTimeOut()
         * @desc 初始化Timeout事件與now時間追蹤
         */

        initTimeOut() {
            this.now = 0;
            this.timeout = null;
            this.timeoutEvent = () => {
                this.addStack('timeout');
                this.nucleoid.timeoutError(this.nucleoid.messenger);
                this.exit();
            }
            this.interval = setInterval(() => {
                this.now += 1
            }, 1)
        }

        /**
         * @function exit()
         * @desc 跳出貯列
         */

        exit() {
            if (this.finish == false) {
                this.finish = true;
                if (this.timeout) {
                    clearTimeout(this.timeout);
                    this.timeout = null;
                }
                clearInterval(this.interval);
                let status = {
                    name: this.name,
                    mode: this.nucleoid.trymode ? 'try-catch-mode' : 'normal',
                    step: this.stack.slice(-1)[0].step.split(":")[0],
                    stack: this.stack,
                }
                if (this.nucleoid.terminator) {
                    this.nucleoid.terminator(this.nucleoid.messenger, status);
                }
                this.callback({
                    status: status,
                    messenger: this.nucleoid.messenger,
                });
            } else {
                console.warn(`Nucleoid(${this.nucleoid.name}) => Exit already called.`)
            }
        }

        /**
         * @function next()
         * @desc 前往下個貯列
         */

        next() {
            if (this.finish === false) {
                if (this.nucleoid.mediator) {
                    this.addStack('mediator');
                    this.nucleoid.mediator(this.nucleoid.messenger, this.exit.bind(this))
                }
                setTimeout(() => {
                    if (this.nucleoid.trymode) {
                        try {
                            this.runtime.next();
                        } catch (exception) {
                            if (this.nucleoid.trymodeError) {
                                this.nucleoid.trymodeError(this.nucleoid.messenger, exception)
                            }
                            this.addStack('catch: ' + exception);
                            this.exit();
                        }
                    } else {
                        this.runtime.next();
                    }
                }, 1)
            }
        }

    }

    /**
     * @class Nucleoid()
     * @desc 核心
     */

    class Nucleoid extends ModuleBase {

        constructor() {
            super("Nucleoid");
            this.genes = [];
            this.trymode = false;
            this.trymodeError = null;
            this.timeout = 3600;
            this.timeoutError = null;
            this.promoter = null;
            this.mediator = null;
            this.terminator = null;
            this.messenger = {};
            this.setName('No name');
        }

        /**
         * @function setName(name)
         * @desc 設定名稱
         */

        setName(name) {
            if (typeof name === "string") {
                this.name = name;
            } else {
                this.systemError('setName', 'Name not a string.', name);
            }
        }

        /** 
         * @function setTimeout(time,error)
         * @desc 設定逾時事件
         */

        setTimeout(timeout, error) {
            if (typeof timeout === "number" && typeof error === "function") {
                this.timeout = timeout;
                this.timeoutError = error;
            } else {
                this.systemError('setTimeout', 'Params type error. try setTimeout(number, function)');
            }
        }

        /** 
         * @function setTrymode(open,error)
         * @desc 設定try-catch模式
         */

        setTrymode(open, error) {
            if (typeof open === "boolean" && (typeof error === "function" || error == null)) {
                this.trymode = open;
                this.trymodeError = error;
            } else {
                this.systemError('setTrymode', 'Params type error, try setTrymode(boolean, function).');
            }
        }

        /**
         * @function addMessenger(key,value,force)
         * @desc 加入一個全域屬性
         * @param {boolean} force 預設屬性會防止被重複宣告，設定force為true強制取代
         */

        addMessenger(key, value, force = false) {
            if (this.messenger[key] == null || force === true) {
                this.messenger[key] = value
            } else {
                this.systemError('addMessenger', 'Messenger key already exists.', key);
            }
        }

        /**
         * @function queue(name,action)
         * @desc 加入一個貯列
         */

        queue(name, action) {
            if (typeof name === 'string') {
                if (typeof action === 'function') {
                    this.genes.push({
                        name: name,
                        action: action,
                    });
                } else {
                    this.systemError('queue', 'Action not a function.', action);
                }
            } else {
                this.systemError('queue', 'Name not a string.', name);
            }
        }

        /** 
         * @function setPromoter(promoter)
         * @desc 設定啟動事件
         */

        setPromoter(promoter) {
            if (typeof promoter === 'function') {
                if (this.promoter == null) {
                    this.promoter = promoter;
                } else {
                    this.systemError('setPromoter', 'Promoter already exists.', this.promoter);
                }
            } else {
                this.systemError('setPromoter', 'Promoter not a function.', promoter);
            }
        }

        /** 
         * @function setMediator(mediator)
         * @desc 設定中介事件
         */

        setMediator(mediator) {
            if (typeof mediator === 'function') {
                if (this.mediator == null) {
                    this.mediator = mediator;
                } else {
                    this.systemError('setPromoter', 'Promoter already exists.', this.mediator);
                }
            } else {
                this.systemError('setMediator', 'Mediator not a function.', mediator);
            }
        }

        /** 
         * @function setTerminator(terminator)
         * @desc 設定結束事件
         */

        setTerminator(terminator) {
            if (typeof terminator === 'function') {
                if (this.terminator == null) {
                    this.terminator = terminator;
                } else {
                    this.systemError('setTerminator', 'Terminator already exists.', this.terminator);
                }
            } else {
                this.systemError('setTerminator', 'Terminator not a function.', terminator);
            }
        }

        /** 
         * @function transcription()
         * @desc 執行系統
         * @returns {Promise}
         */

        transcription(trymode = false) {
            this.transcription = function () {
                console.warn(`Nucleoid(${this.name}) => Transcription already called.`)
            }
            if (trymode) {
                this.trymode = trymode
            }
            return new Promise((resolve) => {
                new Transcription(this, resolve)
            })
        }

    }

    let __re = Nucleoid;

    return __re;

})
