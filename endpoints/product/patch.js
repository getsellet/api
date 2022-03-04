const db = require('../../modules/db')
const { default: ow } = require('ow')
const { ObjectId } = require('mongodb')

module.exports = {
  endpoint: '/product/:id',
  patch: async (req, res) => {
    if (!req.hub) return res.status(401).send({ message: 'Unauthorized' }) // auth

    // validate request
    try {
      ow(req.params, ow.object.exactShape({ id: ow.string.is((v) => ObjectId.isValid(v) || `Expected \`${v}\` to be a BSON object id`) }))
      ow(req.body, ow.object.exactShape({
        name: ow.optional.string,
        description: ow.optional.string,
        url: ow.optional.string.is((v) => /^(ftp|http|https):\/\/[^ "]+$/u.test(v) || `Expected \`${v}\` to be a url`),
        devProduct: ow.optional.string.numeric
      }))
    } catch (err) {
      return res.status(400).send({ message: err.message.replaceAll('`', '\'').replace('object \'req.body\'', 'body') })
    }

    // update product
    const product = await db.collection('products').updateOne({
      _id: new ObjectId(req.params.id),
      hub: req.hub._id
    }, { $set: req.body })
    if (!product.matchedCount) return res.status(404).send({ message: `Product '${req.params.id}' could not be found` })

    return res.status(200).send({})
  }
}
