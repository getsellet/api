const mongodb = require('mongodb')

module.exports = (async () => {
  const db = await new mongodb.MongoClient(process.env.MONGODB).connect()
  module.exports = db.db('sellet')
})()
