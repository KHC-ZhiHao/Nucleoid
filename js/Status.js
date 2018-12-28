/**
 * @class Status()
 * @desc 堆棧狀態
 */

class Status extends ModuleBase{

    constructor(name, type) {
        super("Status")
        this.name = name || 'no name'
        this.type = type || 'no type'
        this.message = ''
        this.success = false
        this.children = []
        this.startTime = Date.now()
        this.attributes = {}
        this.finishTime = null
    }

    get operationTime() {
        return (this.finishTime || Date.now()) - this.startTime
    }

    /**
     * @function addAttr(key,value)
     * @desc 這個屬性會被加入在一個名為attributes的物件內
     */

    addAttr(key, value) {
        this.attributes[key] = value
    }

    /**
     * @function set(success,message)
     * @desc 當該狀態的模式進行到一個終點，設定成功與否和訊息
     */

    set(success, message = '') {
        if (this.finishTime == null) {
            this.success = success
            this.message = message
            this.finishTime = Date.now()
        }
        return this
    }

    /**
     * @function get()
     * @desc 取得該狀態序列化的參數
     */

    get() {
        let data = {
            name: this.name,
            type: this.type,
            message: this.message,
            success: this.success,
            attributes: this.attributes,
            operationTime: this.operationTime,
            children: []
        }
        for (let child of this.children) {
            data.children.push(child.get())
        }
        return data
    }

    /**
     * @function json()
     * @desc 取得序列化參數並轉呈json文本
     */

    json() {
        let data = this.get()
        let inspectJSON = function (target, used = []) {
            let output = {}
            for (let key in target) {
                let aims = target[key]
                let type = typeof aims
                if (type === 'function') {
                    continue
                } else if (type === 'object') {
                    let newUsed = [target].concat(used)
                    if (newUsed.includes(aims)) {
                        output[key] = 'Circular structure object.'
                    } else {
                        output[key] = inspectJSON(aims, newUsed)
                    }
                } else {
                    output[key] = aims
                }
            }
            return output
        }
        data = inspectJSON(data)
        return JSON.stringify(data, null, 4)
    }

    /**
     * @function addChildren(status)
     * @desc 將該status加入一個子狀態
     */

    addChildren(status) {
        if (status instanceof Status) {
            this.children.push(status)
        } else {
            this.$systemError('addChildren', 'Child not a status class.', status)
        }
    }

}
