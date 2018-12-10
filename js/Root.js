class Root extends ModuleBase {

    constructor(name) {
        super("Root")
        this.name = name
        this.delay = 10
        this.startTime = 0
        this.operating = typeof window === 'undefined' ? 'node' : 'browser'
        this.pollingEvents = []
    }

    get operationTime() {
        return Date.now() - this.startTime
    }

    install() {
        this.status = new Status(this, null, this.name, 'root')
        this.startTime = Date.now()
        this.initPolling()
    }

    initPolling() {
        this.interval = setInterval(() => {
            let clear = false
            for (let i = 0; i < this.pollingEvents.length; i++) {
                let event = this.pollingEvents[i]
                if (event.finish) {
                    clear = true
                } else {
                    event.activate()
                }
            }
            if (clear) {
                this.filterPollingEvents()
            }
        }, this.delay)
    }

    polling(options, status) {
        this.pollingEvents.push(new PollingEvent(this, status || this.status, options))
    }

    clearPollingEvents() {
        this.pollingEvents = this.pollingEvents.filter((d) => {
            return d.finish === false
        })
    }

    createFragment(name, status) {
        let fragment = new Fragment(this, status || this.status, name)
        return fragment.use()
    }

    bindFragment(status) {
        return (name) => {
            return this.createFragment(name, status)
        }
    }

    bindPolling(status) {
        return (options) => {
            return this.polling(options, status)
        }
    }

    close() {
        clearInterval(this.interval)
    }

}

class PollingEvent extends ModuleBase {

    constructor(root, status, options) {
        super('PollingEvent')
        this.status = new Status(root, status, options.name, 'polling')
        this.action = options.action
        this.finish = false
    }

    activate() {
        this.action(this.close.bind(this))
    }

    close() {
        this.finish = true
        this.status.set(true)
    }

}

class Fragment extends ModuleBase {

    constructor(root, status, name) {
        super('Fragment')
        this.root = root
        this.over = 0
        this.name = name || 'no name'
        this.stop = false
        this.thread = []
        this.status = new Status(this.root, status, this.name, 'fragment')
    }

    install(callback) {
        this.callback = callback
    }

    use() {
        return {
            add: this.add.bind(this),
            activate: this.activate.bind(this)
        }
    }

    add(options) {
        this.thread.push(this.$verify(options, {
            name: [true, '#string'],
            action: [true, '#function'] 
        }))
    }

    regsterError(status) {
        return (error) => {
            status.set(false, error)
            if( this.stop === false ){
                this.stop = true
                this.status.set(false, error)
                this.callback(error)
            }
        }
    }

    regsterOnload(status) {
        return () => {
            status.set(true)
            this.over += 1
            if( this.stop === false ){
                if( this.over >= this.thread.length ){
                    this.stop = true
                    this.status.set(true)
                    this.callback()
                }
            }
        }
    }

    actionThread(thread) {
        let func = async() => {
            let status = new Status(this.root, this.status, thread.name, 'fragment-base')
            let onload = this.regsterOnload(status)
            let error = this.regsterError(status)
            thread.action(error, onload)
        }
        func()
    }

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
