class Methods extends ModuleBase {
    
    constructor(){
        super("Methods")
        this.pool = {}
    }

    regster( name, method ){
        if( this.pool[name] == null ){
            this.pool[name] = method
        } else {
            this.systemError('regster', 'Method name already exists.', name)
        }
    }

    use(name){
        if( this.pool[name] ){
            let store = {}
            let action = this.pool[name](store);
            return { store, action }
        } else {
            this.systemError('use', 'Method not found.', name)
        }
    }

}

let MethodBucket = new Methods()