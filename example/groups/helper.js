let Assembly = require('assemblyjs')
let group = new Assembly.Group()

/**
 * @function validate(options)
 * @desc 使用joi驗證數據
 */

group.addTool({
    name: 'validate',
    create() {
        this.joi = require('joi')
    },
    action({ head, params }, system, error, success) {
        this.joi.validate(head, this.joi.object().keys(params), function(err) {
            if (err) {
                error(err)
            } else {
                success()
            }
        })
    }
})

module.exports = group
