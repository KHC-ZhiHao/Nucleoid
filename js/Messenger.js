/**
 * @class Messenger
 * @desc 負責被擲出Gene的物件
 */

class Messenger {

    constructor(root) {
        this.name = root.name
        this.base = root.base
        this.gene = root.gene
        this.status = root.rootStatus
        this.success = root.rootStatus.isSuccess()
        this.getBase = root.getBase
    }

    /**
     * @function isError()
     * @desc 是否為執行錯誤的Messenger
     * @returns {boolean}
     */

    isError() {
        return !this.success
    }

    /**
     * @function getErrorMessage()
     * @desc 獲取錯誤訊息
     * @returns {string|null}
     */

    getErrorMessage() {
        return this.isError ? this.status.getMessage() : null
    }

    /**
     * @function getStatusToJson()
     * @desc 獲取狀態並轉換成json格式
     * @returns {string} json file
     */

    getStatusToJson() {
        return this.status.json()
    }

    /**
     * @function getMethods()
     * @desc 獲取模式
     * @returns {array}
     */

    getMode(){
        return this.gene.mode.used()
    }

}