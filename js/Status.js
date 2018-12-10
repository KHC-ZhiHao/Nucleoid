class Status extends ModuleBase{

    constructor(root, parent, name, type) {
        super("Status")
        this.root = root || null
        this.name = name || 'no name'
        this.type = type || 'no type'
        this.parent = parent
        this.message = ''
        this.success = false
        this.children = []
        this.attributes = {}
        this.operationTime = 0
        if (this.parent) {
            this.parent.addChildren(this)
        }
    }

    add(name, message = null) {
        this.attributes[name] = message || ''
    }

    set(success, message) {
        this.success = success
        this.message = message || ''
        this.operationTime = this.root.operationTime
    }

    get() {
        let data = {
            name: this.name,
            type: this.type,
            message: this.message,
            success: this.success,
            attributes: this.attributes,
            children: [],
            operationTime: this.operationTime
        }
        for (let child of this.children) {
            data.children.push(child.get())
        }
        return data
    }

    json() {
        return JSON.stringify(this.get(), null, 4)
    }

    addChildren(status) {
        if (status instanceof Status) {
            this.children.push(status)
        } else {
            this.$systemError('addChildren', 'Child not a status class.', status)
        }
    }

}