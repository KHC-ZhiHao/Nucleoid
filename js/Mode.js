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