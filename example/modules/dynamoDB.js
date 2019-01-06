const AWS = require('aws-sdk')
const client = new AWS.DynamoDB.DocumentClient({
    region: process.env.region,
    endpoint: process.env.endpoint
})

module.exports = client
