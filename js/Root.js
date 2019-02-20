/**
 * @class Root
 * @desc Gene執行Transcription時，掌控Status和Polling的源頭
 */

class Root extends ModuleBase {

    constructor(gene) {
        super("Root")
        this.gene = gene
        this.name = gene.name
        this.base = {}
        this.autos = []
        this.delay = 5
        this.interval = null
        this.operating = typeof window === 'undefined' ? 'node' : 'browser'
        this.rootStatus = new Status(this.name, 'root')
        this.protection = {}
        this.carryStatus = null
        this.pollingEvents = []
        this.initBase()
    }

    get status() {
        return this.carryStatus || this.rootStatus
    }

    /**
     * @function initPolling()
     * @desc 初始化輪尋機制
     */

    initPolling() {
        this.interval = setInterval(() => {
            let clear = false
            for (let i = 0; i < this.pollingEvents.length; i++) {
                let event = this.pollingEvents[i]
                if (event.finish) {
                    clear = true
                } else {
                    event.activate()
                }
            }
            if (clear) {
                this.clearPollingEvents()
            }
        }, this.delay)
    }

    /**
     * @function initBase()
     * @desc 初始化鹼基
     */

    initBase() {
        if (this.gene.genetic) {
            let datas = this.gene.genetic()
            if (typeof datas === "object") {
                for (let key in datas) {
                    this.addBase(key, datas[key])
                }
            } else {
                this.$systemError('initBase', 'Genetic retrun not a object', datas)
            }
        }
    }

    /**
     * @function getBase()
     * @desc 直接獲取base是不會得到protection物件的
     */

    getBase() {
        let base = {}
        for (let key in this.base) {
            base[key] = this.base[key]
        }
        for (let key in this.protection) {
            base[key] = this.protection[key]
        }
        return base 
    }

    /**
     * @function setTargetStatus(status)
     * @desc 轉移指定的status對象
     * @param {Status} status 
     */

    setTargetStatus(status) {
        this.carryStatus = status
    }

    /**
     * @function createSystemStatus(name,success,message)
     * @desc 快捷建立一個status至指定的對象中
     */

    createSystemStatus(name, success, message) {
        let status = new Status(name, 'system')
            status.set(success, message)
        this.status.addChildren(status)
    }

    /**
     * @function addBase(key,value)
     * @desc 加入一個全域屬性
     */

    addBase( key, value ){
        if( this.base[key] == null ){
            if( key.slice(0, 1) === "$" ){
                this.$protection(this.base, key, this.protection, value)
            } else {
                this.base[key] = value
            }
        } else {
            this.$systemError('addBase', 'Base key already exists.', key );
        }
    }

    /**
     * @function polling(options)
     * @desc 輪循一個事件
     * @param {object} options {name:string, action:function} 
     */

    polling(options) {
        if (this.interval == null) {
            this.initPolling()
        }
        this.pollingEvents.push(new PollingEvent(this, options))
    }

    /**
     * @function auto(options)
     * @desc 建立自動執行續
     */

    auto(options) {
        this.autos.push(new Auto(this, options))
    }

    /**
     * @function clearPollingEvents()
     * @desc 清空宣告停止輪循的事件
     */

    clearPollingEvents() {
        this.pollingEvents = this.pollingEvents.filter((d) => {
            return d.finish === false
        })
    }

    /**
     * @function createFragment(name)
     * @desc 建立一個片段
     */

    createFragment(name) {
        let fragment = new Fragment(this, name)
        return fragment.use()
    }

    /**
     * @function close(success,message,callback)
     * @desc 完成Transcription後，關閉系統
     * @param {boolean} success 系統是否順利結束
     * @param {boolean} force 是否強行關閉
     * @param {any} message 如果錯誤，是怎樣的錯誤
     */

    close(success, message, force, callback) {
        let close = () => {
            this.rootStatus.set(success, message)
            if (this.interval) {
                clearInterval(this.interval)
            }
            callback()
        }
        if (force) {
            close()
        } else {
            this.checkAutoOnload(close)
        }
    }

    checkAutoOnload(callback) {
        let check = this.autos.find((auto) => {
            return auto.finish === false
        })
        if (check == null) {
            callback()
        } else {
            setTimeout(() => {
                this.checkAutoOnload(callback)
            }, 10)
        }
    }

}
