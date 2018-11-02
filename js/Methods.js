class Methods extends ModuleBase {
    
    constructor(){
        super("Methods")
        this.bases = {}
        this.stores = {}
    }

    regster( name, method ){
        if( this.bases[name] == null ){
            this.bases[name] = method
            this.stores[name] = {};
        } else {
            this.systemError('regster', 'Method name already exists.', name)
        }
    }

    use(name){
        if( this.bases[name] ){
            let action = this.bases[name](this.stores[name]);
            return {
                store : this.stores[name],
                action : action
            }
        } else {
            this.systemError('use', 'Method not found.', name)
        }
    }

}

let MethodBucket = new Methods()