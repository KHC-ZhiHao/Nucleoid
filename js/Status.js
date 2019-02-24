/**
 * @class Status()
 * @desc 堆棧狀態
 */

class Status extends ModuleBase{

    constructor(name, type) {
        super("Status")
        this.name = name || 'no name'
        this.type = type || 'no type'
        this.detail = null
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
     * @function installDetail()
     * @desc 顯示更多資訊
     */

    installDetail() {
        if (this.detail == null) {
            this.detail = {
                operationTime : this.operationTime
            }
        }
    }

    /**
     * @function set(success,message)
     * @desc 當該狀態的模式進行到一個終點，設定成功與否和訊息
     */

    set(success, message = '') {
        if (this.finishTime == null) {
            this.success = success
            this.message = message instanceof Error ? message.stack : message
            this.finishTime = Date.now()
            this.installDetail()
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
            detail: this.detail,
            message: this.message,
            success: this.success,
            attributes: this.attributes,
            children: []
        }
        for (let child of this.children) {
            data.children.push(child.get())
        }
        return data
    }

    /**
     * @function inspect()
     * @desc 移除迴圈結構的物件
     */

    inspect(target, used = []) {
        if (target == null) {
            return null
        }
        let output = Array.isArray(target) ? [] : {}
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
                    output[key] = this.inspect(aims, newUsed)
                }
            } else {
                output[key] = aims
            }
        }
        return output
    }

    /**
     * @function getErrorStatus()
     * @desc 只獲取錯誤狀態並平面化資料
     */

    getErrorStatus() {
        let data = this.inspect(this.get())
        let output = []
        let action = function(status, start) {
            if (status.success === false) {
                output.push(status)
            }
            for (let child of status.children) {
                action(child)
            }
            if (start) {
                return output
            }
        }
        return action(data, true)
    }

    /**
     * @function json()
     * @desc 取得序列化參數並轉為json文本
     */

    json() {
        let data = this.inspect(this.get())
        return JSON.stringify(data, null, 4)
    }

    /**
     * @function html()
     * @desc 取得序列化參數並轉成html文本
     */

    html() {
        let data = this.inspect(this.get())
        let createCard = function(status) {
            let border = `solid 1px ${status.success ? 'blue' : 'red'}`
            let html = `<div style="padding:5px; margin: 5px; border:${border}">`
                html += `<div>type : ${status.type}</div>`
                html += `<div>name : ${status.name}</div>`
                html += status.message ? `<div>message : <br><pre>${status.message}</pre></div>` : ''
            if (status.detail) {
                html += `<div>detail : `
                html += `<pre>${JSON.stringify(status.detail, null, 4)}</pre>`
                html += `</div>`
            }
            for (let key in status.attributes) {
                html += `<div> attributes(${key}) : `
                html += `<pre>${JSON.stringify(status.attributes[key], null, 4)}</pre>`
                html += `</div>`
            }
            let length = status.children.length
            for (let i = 0; i < length; i++) {
                html += createCard(status.children[i])
            }
            html += '</div>'
            return html
        }
        return createCard(data)
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
