class Status extends ModuleBase{

    constructor(name, type) {
        super("Status")
        this.name = name || 'no name'
        this.type = type || 'no type'
        this.cache = null
        this.message = ''
        this.success = false
        this.children = []
        this.startTime = Date.now()
        this.finishTime = null
    }

    get operationTime() {
        return (this.finishTime || Date.now()) - this.startTime
    }

    success() {
        this.set(true)
    }

    error(message) {
        this.set(false, message)
    }

    set(success, message = '') {
        this.success = success
        this.message = message
        this.finishTime = Date.now()
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

    addChildren(status, target = this.children) {
        if (status instanceof Status) {
            target.push(status)
        } else {
            this.$systemError('addChildren', 'Child not a status class.', status)
        }
    }

}