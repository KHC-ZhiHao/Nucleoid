const Packhouse = require('packhouse')
const factory = new Packhouse()

factory.setBridge((factory, groupName) => {
    if (factory.hasGroup(groupName) === false) {
        factory.addGroup(groupName, require(`./groups/${groupName}`))
    }
})

module.exports = factory