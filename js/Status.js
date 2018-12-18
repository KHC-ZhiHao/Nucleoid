class Status extends ModuleBase{

    constructor(name, type) {
        super("Status")
        this.name = name || 'no name'
        this.type = type || 'no type'
        this.message = ''
        this.success = false
        this.children = []
        this.startTime = Date.now()
        this.attributes = {}
        this.finishTime = null
    }

    get operationTime() {
        return (this.finishTime || Date.now()) - this.startTime
    }

    addAttr(key, value) {
        this.attributes[key] = value
    }

    set(success, message = '') {
        if (this.finishTime == null) {
            this.success = success
            this.message = message
            this.finishTime = Date.now()
        }
        return this
    }

    get() {
        let data = {
            name: this.name,
            type: this.type,
            message: this.message,
            success: this.success,
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