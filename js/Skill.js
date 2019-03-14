/**
 * @class PollingEvent
 * @desc 輪循的事件單位
 */

class PollingEvent extends ModuleBase {

    constructor(root, options) {
        super('PollingEvent')
        this.name = options.name
        this.status = new Status(this.name, 'polling')
        this.action = options.action
        this.finish = false
        root.status.addChildren(this.status)
    }

    /**
     * @function activate()
     * @desc 每次輪循呼叫一次action
     */

    activate() {
        this.action(this.close.bind(this))
    }

    /**
     * @function close()
     * @desc 關閉這個事件，他將在下次輪循時被移除
     */

    close() {
        this.status.set(true)
        this.finish = true
    }

}

/**
 * @class Fragment
 * @desc 建立一個片段，你可以一次加入多個排程，他將會同時進行並等待回傳onload
 */

class Fragment extends ModuleBase {

    constructor(root, name) {
        super('Fragment')
        this.over = 0
        this.name = name || 'no name'
        this.stop = false
        this.error = null
        this.status = new Status(this.name, 'fragment')
        this.thread = []
        this.exports = {
            add: this.add.bind(this),
            eachAdd: this.eachAdd.bind(this),
            activate: this.activate.bind(this),
            setError: this.setError.bind(this)
        }
        root.status.addChildren(this.status)
    }

    /**
     * @function install(callback)
     * @desc 執行activate時初始化
     */

    install(callback) {
        this.callback = (error) => {
            if (error) {
                this.status.set(false, error)
            } else {
                this.status.set(true)
            }
            callback(error)
        }
    }

    /**
     * @function use()
     * @desc 建立對外接口
     */

    use() {
        return this.exports
    }

    /**
     * @function add(options)
     * @desc 加入一個排程
     * @param {object} options {name:string, action:function} 
     */

    add(options) {
        this.thread.push(this.$verify(options, {
            name: [true, '#string'],
            action: [true, '#function'] 
        }))
        return this.use()
    }

    /**
     * @function eachAdd(target,name,action)
     * @desc 迭代加入frag
     */

    eachAdd(target, name = 'no name', action) {
        Supports.each(target, (data, key) => {
            this.add({
                name: name + `(${key})`,
                action: function (error, onload) {
                    action(data, key, error, onload)
                }
            })
        })
        return this.use()
    }

    /**
     * @function setError()
     * @desc 註冊每個排程的error事件並回傳export
     */

    setError(callback) {
        if (typeof callback === 'function') {
            this.error = callback
        } else {
            this.$systemError('setError', 'Callback not a function')
        }
        return this.use()
    }

    /**
     * @function regsterError(status)
     * @desc 註冊每個排程的error事件
     */

    regsterError(status) {
        return (error) => {
            if( this.stop === false ){
                let message = error || 'unknown error'
                status.set(false, message)
                this.stop = true
                if (this.error) {
                    this.error(message)
                }
                this.callback(message)
            }
        }
    }

    /**
     * @function regsterOnload(status)
     * @desc 註冊每個排程的onload事件
     */

    regsterOnload(status) {
        return () => {
            status.set(true)
            this.over += 1
            if( this.stop === false ){
                if( this.over >= this.thread.length ){
                    this.stop = true
                    this.callback()
                }
            }
        }
    }

    /**
     * @function actionThread(thread)
     * @desc 執行一個排程
     */

    actionThread(thread) {
        let func = async() => {
            let status = new Status(thread.name, 'frag-thread')
            let onload = this.regsterOnload(status)
            let error = this.regsterError(status)
            this.status.addChildren(status)
            thread.action(error, onload)
        }
        func()
    }

    /**
     * @function activate(callback)
     * @callback (error,onload)
     */

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

/**
 * @class Auto
 * @desc 建立一個獨立的非同步執行續，在宣告結束前transcription不會結束
 */

class Auto extends ModuleBase {

    constructor(root, options) {
        super('Auto')
        this.name = options.name || 'No name'
        this.root = root
        this.status = new Status(this.name, 'auto')
        this.action = this.createAction(options.action)
        this.finish = false
        this.init()
    }

    /**
     * @function init
     * @desc 初始化狀態
     */

    init() {
        this.root.status.addChildren(this.status)
        this.action(this.error.bind(this), this.onload.bind(this))
    }

    /**
     * @function createAction
     * @desc 建立自動化行為
     */

    createAction(action) {
        if (typeof action !== 'function') {
            this.$systemError('createAction', 'Action not a function', action)
        }
        return async function (error, onload) {
            action(error, onload)
        }
    }

    /**
     * @function error
     * @desc 自動化行為出錯
     */

    error(error) {
        this.finish = true
        this.status.set(false, error)
    }

    /**
     * @function onload
     * @desc 自動化行為執行完畢
     */

    onload() {
        this.finish = true
        this.status.set(true)
    }

}