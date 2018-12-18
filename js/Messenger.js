class Messenger {

    constructor(root) {
        this.name = root.name
        this.base = root.base
        this.status = root.rootStatus
        this.success = root.rootStatus.success
        this.getBase = function() {
            let base = {}
            for (let key in root.base) {
                base[key] = root.base[key]
            }
            for (let key in root.protection) {
                base[key] = root.protection[key]
            }
            return base 
        }
    }

    isError() {
        return !this.success
    }

    getErrorMessage() {
        return this.isError ? this.status.message : null
    }

    getStatusToJson() {
        return this.status.json()
    }

}