class Curry extends ModuleBase {

    constructor(options, group) {
        super("Curry");
        this.group = group;
        this.data = this.$verify(options, {
            name: [true, ''],
            input: [true, '#function'],
            output: [true, '#function'],
            opener: [false, []],
            methods: [true, {}]
        })
        this.opener = this.data.opener || null
        this.methods = {}
        this.checkPrivateKey()
    }

    get name() { return this.data.name }

    checkPrivateKey() {
        let methods = this.data.methods
        if( methods.action || methods.promise ){
            this.$systemError('init', 'Methods has private key(action, promise)')
        }
    }

    use() {
        let self = this
        return function() {
            let unit = new CurryUnit(self, [...arguments]);
            return unit.getRegisterMethod();
        }
    }

}

class CurryUnit extends ModuleBase {

    constructor(main, params) {
        super("CurryUnit")
        this.case = new Case()
        this.flow = []
        this.main = main
        this.index = 0
        this.params = params
        this.methods = {}
        this.previousFlow = null
        this.initRegisterMethod()
    }

    initRegisterMethod() {
        let self = this;
        this.registergMethod = {
            action: this.action.bind(this),
            promise: this.promise.bind(this)
        }

        let input = new Method({
            name: 'input',
            action: this.main.data.input
        }, this.main.group)

        let output = new Method({
            name: 'output',
            action: this.main.data.output
        }, this.main.group)

        this.input = input.turn(this.case).use()
        this.output = output.turn(this.case).use()

        for (let name in this.main.data.methods) {
            this.methods[name] = new Method({
                name: name,
                action: this.main.data.methods[name]
            }, this.main.group)
            this.registergMethod[name] = function() {
                self.register(name, [...arguments])
                return self.getRegisterMethod()
            }
        }
    }

    getRegisterMethod() {
        return this.registergMethod
    }

    register(name, params) {
        if (this.main.opener.length !== 0 && this.flow.length === 0) {
            if (!this.main.opener.includes(name)) {
                this.$systemError('register', 'First call method not inside opener.', name)
            }
        }
        let data = {
            name: name,
            nextFlow: null,
            previous: this.flow.slice(-1),
            index: this.index,
            method: this.methods[name].turn(this.case).use(),
            params: params
        }
        if( this.previousFlow ){
            this.previousFlow.nextFlow = data
        }
        this.previousFlow = data
        this.index += 1
        this.flow.push(data)
    }

    include(name) {
        return this.main.group.getMethod(name).use()
    }

    action(callback) {
        let error = function(error){ callback(error, null) }
        let success = function(success) { callback(null, success) }
        this.activation( error, success )
    }

    promise() {
        return new Promise(( resolve, reject )=>{
            this.activation( reject, resolve )
        })
    }

    activation(error, success) {
        let stop = false
        let index = 0
        let run = () => {
            let flow = this.flow[index]
            if( flow ){
                flow.method.action(...flow.params, (err) => {
                    if (err) {
                        error(err)
                        stop = true
                    } else {
                        index += 1
                        if( stop === false ){ run() }
                    }
                })
            } else {
                this.output.action((err, result) => {
                    if (err) {
                        error(err)
                    } else {
                        success(result)
                    }
                })
            }
        }
        this.input.action(...this.params, (err) => {
            if (err) {
                error(err)
            } else {
                run()
            }
        })
    }

}
