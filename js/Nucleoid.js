/**
 * @class Nucleoid()
 * @desc 核心
 */

class Nucleoid {

    static addGroup( groupName, group, options ) {
        Bioreactor.addGroup( groupName, group, options );
    }

    static addMethod(options) {
        Bioreactor.addMethod(options)
    }

    static currying(options) {
        Bioreactor.currying(options)
    }

    static hasCurry(name) {
        return Bioreactor.hasCurry(name)
    }

    static hasMethod(name) {
        return Bioreactor.hasMethod(name)
    }

    static hasGroup(name) {
        return Bioreactor.hasGroup(name)
    }

    static callMethod(name) {
        return Bioreactor.getMethod(name).use()
    }

    static callCurry(name) {
        return Bioreactor.getCurry(name).use()
    }

    static createMethodGroup(options) {
        return new MethodGroup(options)
    }

    static createGene(name) {
        return new Gene(name)
    }

}
