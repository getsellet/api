const db = require('../../modules/db')

module.exports = {
  endpoint: '/hub/',
  delete: async (req, res) => {
    if (!req.hub) return res.status(401).send({ message: 'Unauthorized' }) // auth

    await db.collection('products').deleteMany({ hub: req.hub._id })
    await db.collection('hubs').deleteOne(req.hub)

    return res.status(200).send({})
  }
}
