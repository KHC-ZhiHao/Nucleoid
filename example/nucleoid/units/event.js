
module.exports = class {

    constructor(context) {
        this.callback = context.data.callback
        this.complete = false
        this.statusCode = 0
        this.initCode()
    }

    initCode() {
        this.code = {
            '0': 'Success',
            '1': 'Timeout',
            '2': 'Uncaught Exception.',
            '3': 'Data not set.'
        }
    }

    // operon

    check() {
        return !!this.callback
    }

    get() {
        return null
    }

    set(statusCode = 0) {
        this.complete = true
        this.statusCode = statusCode
    }

    done() {
        this.callback(null, '')
    }

    isError() {
        return this.statusCode !== 0
    }

    isComplete() {
        return this.complete
    }

    getMessage() {
        return this.code[this.statusCode] || 'Unknown error'
    }

}