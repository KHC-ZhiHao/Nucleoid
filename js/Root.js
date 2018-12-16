class Root extends ModuleBase {

    constructor(gene) {
        super("Root")
        this.gene = gene
        this.name = gene.name
        this.base = {}
        this.delay = 10
        this.operating = typeof window === 'undefined' ? 'node' : 'browser'
        this.pollingEvents = []
        this.init()
    }

    init() {
        this.status = new Status(this.name, 'root')
        this.initBase()
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

    initBase() {
        if (this.gene.genetic) {
            let datas = this.gene.genetic()
            if (typeof datas === "object") {
                for (let key in datas) {
                    this.addBase(key, datas[key])
                }
            } else {
                this.$systemError('initBase', 'Genetic retrun not a object', datas)
            }
        }
    }

    /**
     * @function addBase(key,value)
     * @desc 加入一個全域屬性
     */

    addBase( key, value ){
        if( this.base[key] == null ){
            if( key.slice(0, 1) === "$" ){
                this.$protection(this.base, key, this.protection, value)
            } else {
                this.base[key] = value
            }
        } else {
            this.$systemError('addBase', 'Base key already exists.', key );
        }
    }

    polling(options) {
        this.pollingEvents.push(new PollingEvent(options))
    }

    clearPollingEvents() {
        this.pollingEvents = this.pollingEvents.filter((d) => {
            return d.finish === false
        })
    }

    createFragment(name) {
        let fragment = new Fragment(this, name)
        return fragment.use()
    }

    close() {
        clearInterval(this.interval)
    }

}

class PollingEvent extends ModuleBase {

    constructor(options) {
        super('PollingEvent')
        this.name = options.name
        this.action = options.action
        this.finish = false
    }

    activate() {
        this.action(this.close.bind(this))
    }

    close() {
        this.finish = true
    }

}

class Fragment extends ModuleBase {

    constructor(root, name) {
        super('Fragment')
        this.root = root
        this.over = 0
        this.name = name || 'no name'
        this.stop = false
        this.thread = []
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

    regsterError() {
        return (error) => {
            if( this.stop === false ){
                this.stop = true
                this.callback(error)
            }
        }
    }

    regsterOnload() {
        return () => {
            this.over += 1
            if( this.stop === false ){
                if( this.over >= this.thread.length ){
                    this.stop = true
                    this.callback()
                }
            }
        }
    }

    actionThread(thread) {
        let func = async() => {
            let onload = this.regsterOnload()
            let error = this.regsterError()
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
