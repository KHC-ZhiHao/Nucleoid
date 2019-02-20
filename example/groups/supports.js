const Assembly = require('assemblyjs')
const Group = new Assembly.Group({
    alias: 'supports'
})

Group.addMold({
    name: 'validateFormat',
    check(params) {
        return typeof params === 'object' ? true : 'param not a object.'
    },
    casting(params = {}) {
        return {
            head: params.head || {},
            params: params.params || {}
        }
    }
})

/**
 * @function validate(options)
 * @desc 使用joi驗證數據
 */

Group.addTool({
    name: 'validate',
    molds: ['validateFormat'],
    paramLength: 2,
    create() {
        this.joi = require('joi')
    },
    action( head, params, system, error, success) {
        this.joi.validate(head, this.joi.object().keys(params), function(err) {
            if (err) {
                error(err)
            } else {
                success()
            }
        })
    }
})

module.exports = Group
