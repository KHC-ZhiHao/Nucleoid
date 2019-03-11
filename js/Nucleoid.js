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
     * @function isMessenger(messenger)
     * @static
     * @desc 驗證該模組是否為messenger
     */

    static isMessenger(messenger) {
        return messenger instanceof Messenger
    }
    /**
     * @function isStatus(status)
     * @static
     * @desc 驗證該模組是否為status
     */

    static isStatus(status) {
        return status instanceof Status
    }

    /**
     * @function isGene(gene)
     * @static
     * @desc 驗證該模組是否為基因
     */

    static isGene(gene) {
        return gene instanceof Gene
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
