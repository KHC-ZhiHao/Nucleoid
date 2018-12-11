class BioreactorBase extends ModuleBase {

    constructor() {
        super("Bioreactor")
        this.groups = {};
    }

    // Get

    getGroup(name) {
        return this.groups[name]
    }

    getMethod(groupName, name) {
        return this.getGroup(groupName).getMethod(name)
    }

    getCurriedFunction(groupName, name) {
        return this.getGroup(groupName).getCurriedFunction(name)
    }

    // Add

    addGroup(name, group, options) {
        if( this.groups[name] == null ) {
            if (group instanceof MethodGroup) {
                if (group.create) {
                    group.create(options)
                }
                this.groups[name] = group
            } else {
                this.$systemError('addGroup', 'Must group.', group)
            }
        } else {
            this.$systemError('addGroup', 'Name already exists.', name)
        }
    }

    // Has

    hasGroup(name) {
        return !!this.groups[name]
    }

    hasMethod(groupName, name) {
        return !!this.getGroup(groupName).hasMethod(name)
    }

    hasCurriedFunction(groupName, name) {
        return !!this.getGroup(groupName).hasCurriedFunction(name)
    }

}

let Bioreactor = new BioreactorBase()
