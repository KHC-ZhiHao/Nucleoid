
module.exports = class {

    constructor(context) {
        this.body = 'Unknown error'
        this.event = context.data.event
        this.complete = false
        this.callback = context.data.callback
        this.statusCode = 500
        this.parseEvent()
    }

    // self

    parseEvent() {
        var all = {}
        var body = {}
        var query = this.event.queryStringParameters || {}
        var params = this.event.pathParameters || {}
        try {
            var body = JSON.parse(this.event.body || {})
        } catch (e) {
            var body = {}
        }
        Object.assign(all, body)
        Object.assign(all, query)
        this.request = {all, body, query, params}
    }

    // operon

    check() {
        return this.event && this.callback
    }

    get(name) {
        return this.request[name]
    }

    set(statusCode, body) {
        this.body = body
        this.complete = true
        this.statusCode = statusCode
    }

    done() {
        this.callback(null, {
            statusCode: this.status_code,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(this.body)
        })
    }

    isError() {
        return this.statusCode !== 200
    }

    isComplete() {
        return this.complete
    }

    getMessage() {
        return this.body
    }

}