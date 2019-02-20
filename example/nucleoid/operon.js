const Test = require('./units/test')
const Event = require('./units/event')
const Request = require('./units/request')
const Nucleoid = require('nucleoid')

module.exports = Nucleoid.createOperon({
    structure: ['get', 'set', 'done', 'create', 'isError', 'validate', 'isComplete', 'getMessage'],
    units: {
        test: Test,
        event: Event,
        request: Request
    }
})