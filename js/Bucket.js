class Bucket extends ModuleBase {

    constructor() {
        super("Bucket")
        this.mainGroup = new MethodGroup( {}, true );
        this.groups = {};
    }

    hasGroup(name) {
        return !!this.groups[name]
    }

    hasMethod(name) {
        return !!this.mainGroup.hasMethod(name)
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
                console.log(this)
                this.systemError('getMethod', 'Method not found.', split[1])
            }
        } else {
            this.systemError('getMethod', 'Group not found.', split[0])
        }
    }

    addMethod(method) {
        this.mainGroup.addMethod(method)
    }

    addGroup(name, group, options) {
        if( this.groups[name] == null ) {
            if( group instanceof MethodGroup ){
                if( group.create ){
                    group.create(options)
                }
                this.groups[name] = group;
            } else {
                this.systemError('addGroup', 'Must group.', group)
            }
        } else {
            this.systemError('addGroup', 'Name already exists.', name);
        }
    }

}

let MethodBucket = new Bucket()