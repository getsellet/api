const db = require('../../modules/db')
const { default: ow } = require('ow')
const { ObjectId } = require('mongodb')

module.exports = {
  endpoint: '/product/:id',
  get: async (req, res) => {
    if (!req.hub) return res.status(401).send({ message: 'Unauthorized' }) // auth

    // validate request
    try {
      ow(req.params, ow.object.exactShape({ id: ow.string.is((v) => ObjectId.isValid(v) || `Expected \`${v}\` to be a BSON object id`) }))
    } catch (err) {
      return res.status(400).send({ message: err.message.replaceAll('`', '\'').replace('object \'req.body\'', 'body') })
    }

    // find product
    const product = await db.collection('products').findOne({
      _id: new ObjectId(req.params.id),
      hub: req.hub._id
    })
    if (!product) return res.status(404).send({ message: `Product '${req.params.id}' could not be found` })

    return res.status(200).send(product)
  }
}
