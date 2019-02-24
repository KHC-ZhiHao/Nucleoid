
const io = require('./operon')
const joi = require('joi')
const factory = require('./factory')
const genePool = require('./genepool/index')

module.exports = function(name, mode, event, context, callback) {
    
    let gene = genePool(mode)

    gene.setAlias(name)
    gene.clearTemplate()
    gene.setGenetic(() => {
        return {
            $io: io.use(mode, { event, context, callback }),
            $fn: factory,
            $joi: joi
        }
    })

    return gene

}