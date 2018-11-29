class Method extends ModuleBase {
    
    constructor( options = {}, group ) {
        super('Method');
        this.case = new Case()
        this.used = [];
        this.store = {};
        this.group = group;
        this.data = this.verify(options, {
            name: [true, ''],
            create: [false, function(){}],
            action: [true, function(){}]
        })
        this.init();
    }

    get name() { return this.data.name }

    init() {
        if( this.group == null ){
            this.systemError('init', 'No has group', this)
        }
        if( this.name.includes('-') ){
            this.systemError('init', 'Symbol - is group protection.', name)
        }
        this.case = new Case()
    }

    create() {
        this.data.create.bind(this.case)({
            store: this.store,
            include: this.include.bind(this)
        });
        this.create = null
    }

    include(name) {
        if( this.used.includes(name) === false ){
            this.used.push(name)
        }
        return this.group.getMethod(name).use()
    }

    getGroupStore(name) {
        return this.group.store[name]
    }

    system() {
        return {
            store: this.store,
            getGroupStore: this.getGroupStore.bind(this)
        }
    }

    direct(params){
        let output = null
        let success = function(data) { output = data }
        let error = function(error) { output = error }
        this.data.action.bind(this.case)( params, this.system(), error, success );
        return output
    }

    action(params, callback = function(){}) {
        let error = function(error){
            callback(error, null);
        }
        let success = function(success) {
            callback(null, success);
        }
        this.data.action.bind(this.case)( params, this.system(), error, success );
    }

    promise(params) {
        return new Promise(( resolve, reject )=>{
            this.data.action.bind(this.case)( params, this.system(), reject, resolve );
        })
    }

    getStore(key) {
        if( this.store[key] ){
            return this.store[key]
        } else {
            this.systemError('getStore', 'Key not found.', key)
        }
    }

    use() {
        if( this.create ){ 
            this.create()
        }
        return {
            store: this.getStore.bind(this),
            direct: this.direct.bind(this),
            action: this.action.bind(this),
            promise: this.promise.bind(this)
        }
    }

}
