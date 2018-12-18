class Method extends ModuleBase {
    
    constructor(options = {}, group) {
        super('Method')
        this.id = 0
        this.case = new Case()
        this.used = []
        this.store = {}
        this.group = group
        this.data = this.$verify( options, {
            name : [true , ''],
            create : [false, function(){}],
            action : [true , '#function'],
            allowDirect : [false , true]
        })
        this.argumentLength = this.data.action.length
        if( this.group == null ){
            this.$systemError('init', 'No has group', this)
        }
    }

    get name() { return this.data.name }
    get groupCase() { return this.group.case }

    turn(target) {
        this.case = target
        return this
    }

    install() {
        this.initBindData()
        this.data.create.bind(this.case)(this.bind.create)
        this.install = null
    }

    initBindData() {
        this.bind = {
            create: {
                store: this.store,
                include: this.include.bind(this),
            },
            system: {
                store: this.store,
                group: this.groupCase,
                include: this.include.bind(this),
            },
            action: this.data.action.bind(this.case)
        }
    }

    createLambda(func, type) {
        let self = this
        return function () {
            let params = [...arguments]
            let callback = null
            if (type === 'action') {
                if (typeof params.slice(-1)[0] === 'function') {
                    callback = params.pop()
                } else {
                    self.$systemError('createLambda', 'Action must callback, no need? try direct!')
                }
            }
            let args = new Array(self.argumentLength - 3)
            for (let i = 0; i < args.length; i++) {
                args[i] = params[i]
            }
            return func.bind(self)(args, callback)
        }
    }

    include(name) {
        return this.group.getMethod(name).use()
    }

    direct(params){
        if (this.data.allowDirect === false) {
            this.$systemError('direct', 'Not allow direct.', this.data.name)
        }
        let output = null
        let error = function(error) {
            throw new Error(error || 'unknown error')
        }
        let success = function(data) {
            output = data
        }
        this.bind.action(...params, this.bind.system, error, success);
        return output
    }

    action(params, callback = function() {}) {
        let error = function(error){
            callback(error || 'unknown error', null);
        }
        let success = function(success) {
            callback(null, success);
        }
        this.bind.action(...params, this.bind.system, error, success);
    }

    promise(params) {
        return new Promise((resolve, reject)=>{
            this.bind.action(...params, this.bind.system, resolve, reject);
        })
    }

    getStore(key) {
        if (this.store[key]) {
            return this.store[key]
        } else {
            this.$systemError('getStore', 'Key not found.', key)
        }
    }

    use() {
        if (this.install) {
            this.install()
        }
        return {
            store: this.getStore.bind(this),
            direct: this.createLambda(this.direct),
            action: this.createLambda(this.action, 'action'),
            promise: this.createLambda(this.promise)
        }
    }

}
