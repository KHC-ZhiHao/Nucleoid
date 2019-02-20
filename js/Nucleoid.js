/**
 * @class Nucleoid
 * @desc 掌控整個系統組成的核心物件，為建立Gene的接口
 */

class Nucleoid {

    /**
     * @function createGene(name)
     * @static
     * @desc 建立一個Gene
     */

    static createGene(name, options) {
        return new Gene(name, options)
    }

    /**
     * @function createOperon(type,options)
     * @static
     * @desc 建立Operon
     */

    static createOperon(options) {
        let operon = new Operon(options)
        return operon.exports()
    }

}
