const db = require('../../modules/db')
const { default: ow } = require('ow')
const { ObjectId } = require('mongodb')

module.exports = {
  endpoint: '/license/:id',
  patch: async (req, res) => {
    if (!req.hub) return res.status(401).send({ message: 'Unauthorized' }) // auth

    // validate request
    try {
      ow(req.params, ow.object.exactShape({ id: ow.string.is((v) => ObjectId.isValid(v) || `Expected \`${v}\` to be a BSON object id`) }))
      ow(req.body, ow.object.exactShape({
        product: ow.optional.string.is((v) => ObjectId.isValid(v) || `Expected \`${v}\` to be a BSON object id`),
        user: ow.optional.string.is((v) => ObjectId.isValid(v) || `Expected \`${v}\` to be a BSON object id`)
      }))
    } catch (err) {
      return res.status(400).send({ message: err.message.replaceAll('`', '\'').replace('object \'req.body\'', 'body') })
    }

    // find product and user (if applicable)
    if (req.body.product) {
      const product = await db.collection('products').findOne({
        _id: new ObjectId(req.body.product),
        hub: req.hub._id
      })
      if (!product) return res.status(404).send({ message: `Product '${req.body.product}' could not be found` })
      req.body.product = product._id
    }

    if (req.body.user) {
      const user = await db.collection('users').findOne({ _id: new ObjectId(req.body.user) })
      if (!user) return res.status(404).send({ message: `User '${req.body.user}' could not be found` })
      req.body.user = user._id
    }

    // update license
    const license = await db.collection('licenses').updateOne({
      _id: new ObjectId(req.params.id),
      hub: req.hub._id
    }, { $set: req.body })
    if (!license.matchedCount) return res.status(404).send({ message: `License '${req.params.id}' could not be found` })

    return res.status(200).send({})
  }
}
