class Methods extends ModuleBase {
    
    constructor(){
        super("Methods")
        this.pool = {}
    }

    regster( name, method ){
        if( this.pool[name] == null ){
            this.pool[name] = {
                use : [],
                method : method
            }
        } else {
            this.systemError('regster', 'Method name already exists.', name)
        }
    }

    use(name){
        if( this.pool[name] ){
            let store = {}
            let action = this.pool[name].method(store, this.piece(name));
            if( typeof action === 'function' ){
                return { store, action }
            } else {
                this.systemError('use', 'Action not a function.', action)
            }
        } else {
            this.systemError('use', 'Method not found.', name)
        }
    }

    piece(poolName){
        return function(name){
            if( this.pool[poolName].use.includes(name) === false ){
                this.pool[poolName].use.push(name)
            }
            return this.use(name)
        }.bind(this)
    }

    getMaps(name){
        let used = [];
        let length = this.pool[name].use.length;
        for( let i = 0 ; i < length ; i++ ){
            used.push(this.getMaps(this.pool[name].use[i]))
        }
        return {
            name : name,
            used : used
        }
    }

}

let MethodBucket = new Methods()