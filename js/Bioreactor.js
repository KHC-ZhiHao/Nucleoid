class BioreactorBase extends ModuleBase {

    constructor() {
        super("Bioreactor")
        this.mainGroup = new MethodGroup( {}, true );
        this.groups = {};
    }

    hasGroup(name) {
        return !!this.groups[name]
    }

    hasMethod(name) {
        return !!this.mainGroup.hasMethod(name)
    }

    hasCurry(name) {
        return !!this.mainGroup.hasCurry(name)
    }

    getMethod(name) {
        let groupMode = name.includes('-');
        let split = groupMode ? name.split('-') : [null, name];
        let target = groupMode ? this.groups[split[0]] : this.mainGroup
        if( target ){
            let method = target.pool[split[1]];
            if( method ){
                return method
            } else {
                this.$systemError('getMethod', 'Method not found.', split[1])
            }
        } else {
            this.$systemError('getMethod', 'Group not found.', split[0])
        }
    }

    getCurry(name) {
        let groupMode = name.includes('-');
        let split = groupMode ? name.split('-') : [null, name];
        let target = groupMode ? this.groups[split[0]] : this.mainGroup
        if( target ){
            let curry = target.curryPool[split[1]];
            if( curry ){
                return curry
            } else {
                this.$systemError('getCurry', 'Method not found.', split[1])
            }
        } else {
            this.$systemError('getCurry', 'Group not found.', split[0])
        }
    }

    addMethod(options) {
        this.mainGroup.addMethod(options)
    }

    currying(options) {
        this.mainGroup.currying(options)
    }

    addGroup(name, group, options) {
        if( this.groups[name] == null ) {
            if( group instanceof MethodGroup ){
                if( group.create ){
                    group.create(options)
                }
                this.groups[name] = group;
            } else {
                this.$systemError('addGroup', 'Must group.', group)
            }
        } else {
            this.$systemError('addGroup', 'Name already exists.', name);
        }
    }

}

let Bioreactor = new BioreactorBase()
