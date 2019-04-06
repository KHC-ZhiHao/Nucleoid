const Nucleoid = require('nucleoid')

module.exports = function (mode) {
    let options = require(`./${mode}`)
    if (Nucleoid.isGene(gene)) {
        return Nucleoid.createGene(mode, options)
    } else {
        throw new Error(`Not a gene(${mode})`)
    }
}