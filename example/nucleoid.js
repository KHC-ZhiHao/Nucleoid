// Module
let Nucleoid = require('nucleoid')
let Assembly = require('assemblyjs')

// System
let Config = require('./system/config')
let Request = require('./system/request')
let Response = require('./system/response')

// Repository
let GroupHelper = require('./groups/helper')
let Factory = new Assembly()
    Factory.addGroup('helper', GroupHelper)

module.exports = function (name, request, response) {

    let gene = Nucleoid.createGene(name)

    // 設定遺傳
    gene.setGenetic(() => {
        return {
            $config: Config,
            $factory: Factory,
            $request: new Request(request),
            $response: new Response(response),
        }
    })

    // 監聽愈時
    gene.setTimeoutMode(true, 20000, (base, exit, fail) => {
        base.$response.set(408, 'Request Timeout')
        exit()
    })

    // 監聽Try Catch
    gene.setCatchExceptionMode(Config.debug, (base, exception, exit, fail) => {
        base.$response.set(500, exception.message)
        exit()
    })

    // 監聽Uncaught Exception
    gene.setCatchUncaughtExceptionMode(Config.debug, (base, exception, exit, fail) => {
        base.$response.set(500, exception.message)
        exit()
    })

    // 起始
    gene.setInitiation((base, skill, next, exit, fail) => {
        if (request && response) {
            next()
        } else {
            base.$response.set(500, 'Unknown error.')
            exit()
        }
    })

    // 延長
    gene.setElongation((base, exit, fail) => {
        if (base.$response.change) {
            exit()
        }
    })

    // 中止
    gene.setTermination((base, status) => {
        if (base.$response.status !== 200) {
            console.error(status.json())
        }
    })

    return gene

}
