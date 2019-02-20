class Operon extends ModuleBase {

    constructor(options) {
        super('Operon')
        this.data = this.$verify(options, {
            units: [true, {}],
            structure: [false, []] 
        })
        this.validate()
    }

    get units() {
        return this.data.units
    }

    validate() {
        if (Array.isArray(this.data.structure) === false) {
            this.$systemError('validate', `Structure not a array.`, this.data.structure)
        }
        for (let key in this.units) {
            let unit = this.units[key]
            if (unit.constructor == null || unit.prototype == null) {
                this.$systemError('validate', 'Unit not a constructor.', key)
            }
            let prototypes = Object.getOwnPropertyNames(unit.prototype)
            for (let name of this.data.structure) {
                if (prototypes.includes(name) === false) {
                    this.$systemError('validate', `Property(${name}) not found.`, name)
                }
            }
        }
    }

    use(name, options) {
        let context = this.createContext(name, options)
        let unit = this.getUnit(name)
        return this.useUnit(unit, context)
    }

    createContext(name, options) {
        return {
            data: options,
            useName: name
        }
    }

    useUnit(unit, context) {
        let target = new unit(context)
        let output = {}
        for (let key of this.data.structure) {
            output[key] = target[key].bind(target)
        }
        return output
    }

    getUnit(name) {
        if (this.data.units[name]) {
            return this.data.units[name]
        } else {
            this.$systemError('getUnit', 'Unit not found.', name)
        }
    }

    exports() {
        return {
            use: this.use.bind(this)
        }
    }

}
