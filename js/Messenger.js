class Messenger {

    constructor(root) {
        this.name = root.name
        this.base = root.base
        this.gene = root.gene
        this.status = root.rootStatus
        this.success = root.rootStatus.success
        this.getBase = root.getBase
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

    /**
     * @function getMethods()
     * @desc 獲取模式
     */

    getMode(){
        let mode = [];
        if (this.gene.mode.catchException) {
            mode.push('try-catch-mode')
        }
        if (this.gene.mode.timeout) {
            mode.push('timeout')
        }
        if (this.gene.mode.catchUncaughtException) {
            mode.push('uncaught-exception-mode')
        }
        if (this.gene.mode.traceBase) {
            mode.push('trace-base-mode')
        }
        return mode
    }


}