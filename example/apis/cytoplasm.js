const nucleoid = require('../nucleoid')
const dynamoDB = require('../modules/dynamoDB')

/**
 * @name 獲取細胞質分子
 * @method get /cytoplasm
 */

module.exports = async(event, context, callback) => {

    let gene = nucleoid('get cytoplasm.', event, callback)

    gene.template('validate', (base, skill, next) => {
        let joi = require('joi')
        base.$factory.tool('helper', 'validate').action({
            head: base.$request.all(),
            params: {
                molecularFormula: joi.string().required()
            }
        }, function(err) {
            if (err) {
                base.$response.set(422, err)
            }
            next()
        })
    })

    gene.template('query ddb', (base, skill, next) => {
        var params = {
            TableName: 'cytoplasm',
            KeyConditionExpression: `#key = :key`,
            ExpressionAttributeValues: {
                ':key': base.$request.get('molecularFormula', 'C6H12O6')
            },
            ExpressionAttributeNames: {
                '#key': 'molecularFormula'
            }
        }
        dynamoDB.query(params, function(err, data) {
            if (err) {
                base.$response.set(500, err)
            } else {
                base.$response.set(200, data.Items)
            }
            next()
        })
    })

    let messenger = await gene.transcription()
    messenger.$response.send()

}
