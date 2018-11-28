class Curry extends ModuleBase {

    constructor(options, group) {
        super("Curry");
        this.group = group;
        this.data = this.verify(options, {
            name: [true, ''],
            input: [true, function(){}],
            output: [true, function(){}],
            methods: [true, {}]
        })
        this.init();
    }

    get name() { return this.data.name }

    init() {
        let check = this.data.methods
        if( check.action || check.promise || check.direct ){
            this.systemError('init', 'Methods has private key(action, promise, direct)')
        }
    }

    use() {
        return (params) => {
            let unit = new CurryUnit(this, params);
            return unit.getRegisterMethod();
        }
    }

}

class CurryUnit extends ModuleBase {

    constructor(main, params) {
        super("CurryUnit");
        this.case = new Case()
        this.flow = []
        this.main = main;
        this.carry = {},
        this.index = 0;
        this.params = params;
        this.previousFlow = null;
        this.initRegisterMethod();
    }

    direct() {
        let output = null
        let error = function(error) { output = error }
        let success = function(data) { output = data }
        this.activation( error, success )
        return output;
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

    initRegisterMethod() {
        this.registergMethod = {
            direct: this.direct.bind(this),
            action: this.action.bind(this),
            promise: this.promise.bind(this)
        }
        for( let key in this.main.data.methods ){
            this.registergMethod[key] = (params) => {
                this.register(key, params);
                return this.getRegisterMethod();
            }
        }
    }

    getRegisterMethod() {
        return this.registergMethod;
    }

    register(name, params) {
        let data = {
            name: name,
            nextFlow: null,
            previous: this.flow.slice(-1),
            index: this.index,
            method: this.main.data.methods[name],
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

    addCarry(name, value) {
        this.carry[name] = value;
    }

    getCarry(name) {
        return this.carry[name];
    }

    setCarry(name, value) {
        this.carry[name] = value;
    }

    activation(error, success) {
        let stop = false;
        let index = 0;
        let reject = (err) => {
            error(err);
            stop = true
        }
        let next = () => {
            index += 1
            if( stop === false ){ run() }
        }
        let run = () => {
            let flow = this.flow[index]
            if( flow ){
                flow.method({
                    get: this.getCarry.bind(this),
                    set: this.setCarry.bind(this),
                    index: flow.index,
                    params: flow.params,
                    include: this.include.bind(this),
                    nextFlow: flow.nextFlow,
                    previous: flow.previous,
                    error: reject,
                    next: next
                })
            } else {
                success(this.main.data.output(this.carry))
            }
        }
        this.main.data.input(this.params, this.addCarry.bind(this), reject);
        if( stop === false ){ run() }
    }

}
