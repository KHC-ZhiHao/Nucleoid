class MethodGroup extends ModuleBase {

    constructor(options = {}) {
        super("MethodGroup")
        this.case = new Case()
        this.pool = {}
        this.curriedPool = {}
        this.data = this.$verify(options, {
            create: [false, function(){}]
        })
    }

    create(options){
        this.data.create.bind(this.case)(options)
        this.create = null;
    }

    // get

    getMethod(name) {
        if( this.pool[name] ){
            return this.pool[name]
        } else {
            this.$systemError('getMethod', 'method not found.', name)
        }
    }

    getCurriedFunction(name) {
        if( this.curriedPool[name] ){
            return this.curriedPool[name]
        } else {
            this.$systemError('getCurry', 'curry not found.', name)
        }
    }

    // compile

    currying(options){
        let curry = new Curry(options, this)
        if( this.$noKey('currying', this.curriedPool, curry.name ) ){
            this.curriedPool[curry.name] = curry
        }
    }

    addMethod(options) {
        let method = new Method(options, this)
        if( this.$noKey('addMethod', this.pool, method.name ) ){
            this.pool[method.name] = method
        }
    }

    // has

    hasCurry(name) {
        return !!this.curriedPool[name]
    }

    hasMethod(name) {
        return !!this.pool[name]
    }

}