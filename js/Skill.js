/**
 * @class PollingEvent(root,options)
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
 * @class Fragment(root,name)
 * @desc 建立一個片段，你可以一次加入多個排程，他將會同時進行並等待回傳onload
 */

class Fragment extends ModuleBase {

    constructor(root, name) {
        super('Fragment')
        this.over = 0
        this.name = name || 'no name'
        this.stop = false
        this.status = new Status(this.name, 'fragment')
        this.thread = []
        root.status.addChildren(this.status)
    }

    /**
     * @function install(callback)
     * @desc 執行activate時初始化
     */

    install(callback) {
        this.callback = callback
    }

    /**
     * @function use()
     * @desc 建立對外接口
     */

    use() {
        return {
            add: this.add.bind(this),
            activate: this.activate.bind(this)
        }
    }

    /**
     * @function add(options)
     * @public
     * @desc 加入一個排程
     * @param {object} options {name:string, action:function} 
     */

    add(options) {
        this.thread.push(this.$verify(options, {
            name: [true, '#string'],
            action: [true, '#function'] 
        }))
    }

    /**
     * @function regsterError(status)
     * @desc 註冊每個排程的error事件
     */

    regsterError(status) {
        return (error) => {
            if( this.stop === false ){
                status.set(false, error)
                this.stop = true
                this.callback(error || 'unknown error')
            }
        }
    }

    /**
     * @function regsterOnload(status)
     * @desc 註冊每個排程的onload事件
     */

    regsterOnload(status) {
        return () => {
            this.over += 1
            if( this.stop === false ){
                if( this.over >= this.thread.length ){
                    status.set(true)
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
            let status = new Status(thread.name, 'thread')
            let onload = this.regsterOnload(status)
            let error = this.regsterError(status)
            this.status.addChildren(status)
            thread.action(error, onload)
        }
        func()
    }

    /**
     * @function activate(callback)
     * @public
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
