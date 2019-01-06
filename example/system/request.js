const config = require('./config')

module.exports = class {

    constructor(event) {
        this.event = event
        this.body = {}
        this.query = {}
        this.parse()
    }

    parse() {
        if (config.cloud === 'gcp') {
            let url = require('url')
            this.body = this.event.body || {}
            this.query = url.parse(this.event.url, true).query
            return
        }
        if (config.cloud === 'aws') {
            this.query = this.event.queryStringParameters || {}
            try {
                this.body = JSON.parse(this.event.body || {})
            } catch (exception) {
                this.body = {}
            }
            return
        }
        if (config.cloud === 'azure') {
            this.body = this.event.body || {}
            this.query = this.event.query || {}
        }
    }

    get(key, defaultValue) {
        return this.query[key] || defaultValue
    }

    input(key, defaultValue) {
        return this.body[key] || defaultValue
    }

    all() {
        let target = Object.assign({}, this.query)
        return Object.assign(target, this.body)
    }

}