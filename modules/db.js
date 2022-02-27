const mongodb = require('mongodb');

(async () => {
  const db = await new mongodb.MongoClient(process.env.MONGODB).connect()
  module.exports = db.db('sellet')
})()
