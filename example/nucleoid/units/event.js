
module.exports = class {

    constructor(context) {
        this.callback = context.data.callback
        this.complete = false
        this.success = false
        this.message = ''
    }

    check() {
        return !!this.callback
    }

    get() {
        return null
    }

    set(success, message) {
        this.message = message
        this.success = success
        this.complete = true
    }

    done() {
        this.callback(null, '')
    }

    isError() {
        return !this.success
    }

    isComplete() {
        return this.complete
    }

    getMessage() {
        return this.message || 'Unknown error'
    }

}