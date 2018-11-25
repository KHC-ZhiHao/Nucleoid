class MethodGroup extends ModuleBase {

    constructor(options = {}, main) {
        super("MethodGroup")
        this.main = main || false
        this.case = new Case();
        this.pool = {};
        this.store = {};
        this.data = this.verify(options, {
            create: [false, function(){}]
        })
    }

    create(options){
        this.data.create.bind(this.case)(this.store, options)
        this.create = null;
    }

    getMethod(name) {
        if( this.main ){
            return MethodBucket.getMethod(name)
        } else {
            if( this.pool[name] ){
                return this.pool[name]
            } else {
                this.systemError('getMethod', 'method not found.', name)
            }
        }
    }

    addMethod(options) {
        let method = new Method(options, this)
        if( this.noKey('addMethod', this.pool, method.name ) ){
            this.pool[method.name] = method
        }
    }

    hasMethod(name) {
        return !!this.pool[name]
    }

}