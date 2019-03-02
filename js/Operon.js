/**
 * @class Operon
 * @desc 統一io狀態的物件
 */

class Operon extends ModuleBase {

    constructor(options) {
        super('Operon')
        this.data = this.$verify(options, {
            units: [true, {}],
            structure: [true, []] 
        })
        this.validate()
    }

    get units() {
        return this.data.units
    }

    /**
     * @function validate
     * @desc 驗證Operon結構是否正確
     */

    validate() {
        if (Array.isArray(this.data.structure) === false) {
            this.$systemError('validate', `Structure not a array.`, this.data.structure)
        }
        for (let key in this.units) {
            let unit = this.units[key]
            if (unit.constructor == null || unit.prototype == null) {
                this.$systemError('validate', 'Unit not a constructor.', key)
            }
            let prototypes = Supports.getAllPrototype(unit)
            for (let name of this.data.structure) {
                if (prototypes.includes(name) === false) {
                    this.$systemError('validate', `Property(${name}) not found.`, name)
                }
            }
        }
    }

    /**
     * @function use
     * @desc 使用選擇的Unit
     */

    use(name, options) {
        let context = this.createContext(name, options)
        let unit = this.getUnit(name)
        return this.useUnit(unit, context)
    }

    /**
     * @function createContext
     * @desc 建立傳入Unit的Context
     */

    createContext(name, options) {
        return {
            data: options,
            useName: name
        }
    }

    /**
     * @function useUnit(unit,context)
     * @desc 使用Unit的邏輯層
     */

    useUnit(unit, context) {
        let target = new unit(context)
        let output = {}
        for (let key of this.data.structure) {
            output[key] = target[key].bind(target)
        }
        return output
    }

    /**
     * @function getUnit(name)
     * @desc 獲取Unit的邏輯層
     */

    getUnit(name) {
        if (this.data.units[name]) {
            return this.data.units[name]
        } else {
            this.$systemError('getUnit', 'Unit not found.', name)
        }
    }

    /**
     * @function exports()
     * @desc 輸出API
     */

    exports() {
        return {
            use: this.use.bind(this)
        }
    }

}
