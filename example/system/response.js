const config = require('./config')

module.exports = class {

    constructor(context) {
        this.body = {}
        this.change = false
        this.context = context || {}
        this.statusCode = 200
    }

    set(status, body) {
        this.body = body || {}
        this.status = status || 500
        this.change = true
    }

    get() {
        return {
            statusCode: this.statusCode,
            headers: {
              'Content-Type': 'application/json;charset=utf-8',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(this.body)
        }
    }

    send() {
        if (config.cloud === 'aws') {
            this.context(null, this.get())
        }
        if (config.cloud === 'gcp') {
            this.context.setHeader('Access-Control-Allow-Origin', '*')
            this.context.setHeader('Content-Type', 'application/json;charset=utf-8')
            this.context.status(this.statusCode).send(JSON.stringify(this.body))
        }
        if (config.cloud === 'azure') {
            this.context.res = {
                body: JSON.stringify(this.body),
                status: this.statusCode,
                headers: {
                    "Access-Control-Allow-Origin" : '*',
                    "Content-Type" : "application/json"
                }
            }
            this.context.done()
        }
    }

}
