// use https://data.gov.tw/dataset/40448

const nucleoid = require('../nucleoid/index')

module.exports = {

    main: async(event, context, callback) => {

        let gene = nucleoid('update.', 'request', event, context, callback)

        gene.template('validate', (base, skill, next) => {
            base.$factory.tool('support', 'validate').action({
                head: base.$io.get('all'),
                params: {
                    data: base.$joi.string().required()
                }
            }, (err) => {
                if (err) {
                    base.$io.set(422, err)
                }
                next()
            })
        })
    
        gene.template('put DB', (base, skill, next) => {
            base.$factory.tool('db', 'put').action(base.$io.get('all'), (result, err) => {
                if (err) {
                    base.$io.set(500, err)
                } else {
                    base.$io.set(200, {})
                }
                next()
            })
        })

        let messenger = await gene.transcription()
        return messenger.base.$io.done()
    }

}
