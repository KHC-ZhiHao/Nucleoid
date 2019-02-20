const Assembly = require('assemblyjs')
const Group = new Assembly.Group({
    alias: 'db'
})

Group.addTool({
    name: 'put',
    paramLength: 2,
    create() {
        this.db = require('db')
    },
    action(data, system, error, success) {
        this.db.put(data, (err) => {
            if (err) {
                error(err)
            } else {
                success()
            }
        })
    }
})

module.exports = Group
