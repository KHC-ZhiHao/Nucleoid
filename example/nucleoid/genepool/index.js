const Nucleoid = require('nucleoid')

module.exports = function (mode) {
    let gene = require(`./${mode}`)
    if (Nucleoid.isGene(gene)) {
        return gene
    } else {
        throw new Error(`Not a gene(${mode})`)
    }
}