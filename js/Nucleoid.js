/**
 * @class Nucleoid()
 * @desc 核心
 */

class Nucleoid {

    static addGroup( groupName, group, options ) {
        Bioreactor.addGroup( groupName, group, options );
    }

    static hasCurriedFunction(groupName, name) {
        return Bioreactor.hasCurriedFunction(groupName, name)
    }

    static hasMethod(groupName, name) {
        return Bioreactor.hasMethod(groupName, name)
    }

    static hasGroup(name) {
        return Bioreactor.hasGroup(groupName, name)
    }

    static callMethod(groupName, name) {
        return Bioreactor.getMethod(groupName, name).use()
    }

    static callCurriedFunction(groupName, name) {
        return Bioreactor.getCurriedFunction(groupName, name).use()
    }

    static createMethodGroup(options) {
        return new MethodGroup(options)
    }

    static createGene(name) {
        return new Gene(name)
    }

}
