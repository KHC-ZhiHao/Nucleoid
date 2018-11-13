class Methods extends ModuleBase {
    
    constructor(){
        super("Methods")
        this.pool = {}
        this.group = {}
        this.regsterGroupMode = false
    }

    regster( name, method, group ){
        if( typeof method !== "function" || typeof name !== "string" ){
            this.systemError('regster', 'Params type error, try regsterMethod(string, function).', name)
            return null
        }
        if( /\-/g.test(name) && this.regsterGroupMode === false ){
            this.systemError('regster', 'Name can\'t has "-".', name)
            return null
        }
        if( this.pool[name] == null ){
            this.pool[name] = {
                use : [],
                group : this.regsterGroupMode ? group : null,
                method : method
            }
        } else {
            this.systemError('regster', 'Method name already exists.', name)
        }
    }

    regsterGroup( key, template ){
        if( this.group[key] == null ){
            if( typeof template === "function" ){
                this.regsterGroupMode = true
                this.group[key] = true
                template((name, method) => {
                    this.regster(key + '-' + name, method, key)
                })
                this.regsterGroupMode = false
            } else {
                this.systemError('regsterGroup', 'Template not a function.', template)
            }
        } else {
            this.systemError('regsterGroup', 'Group name already exists.', name)
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
        let group = this.pool[poolName].group ? this.pool[poolName].group + '-' : '';
        return function(name){
            let call = group + name
            if( this.pool[poolName].use.includes(call) === false ){
                this.pool[poolName].use.push(call)
            }
            return this.use(call)
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