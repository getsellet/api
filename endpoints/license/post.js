const db = require('../../modules/db')
const { default: ow } = require('ow')
const { ObjectId } = require('mongodb')

module.exports = {
  endpoint: '/license/',
  post: async (req, res) => {
    if (!req.hub) return res.status(401).send({ message: 'Unauthorized' }) // auth

    // validate request
    try {
      ow(req.body, ow.object.exactShape({
        product: ow.string.is((v) => ObjectId.isValid(v) || `Expected \`${v}\` to be a BSON object id`),
        user: ow.string.is((v) => ObjectId.isValid(v) || `Expected \`${v}\` to be a BSON object id`)
      }))
    } catch (err) {
      return res.status(400).send({ message: err.message.replaceAll('`', '\'').replace('object \'req.body\'', 'body') })
    }

    // find product and user
    const product = await db.collection('products').findOne({
      _id: new ObjectId(req.body.product),
      hub: req.hub._id
    })
    if (!product) return res.status(404).send({ message: `Product '${req.body.product}' could not be found` })

    const user = await db.collection('users').findOne({ _id: new ObjectId(req.body.user) })
    if (!user) return res.status(404).send({ message: `User '${req.body.user}' could not be found` })

    // check for existing license
    const existingLicense = await db.collection('licenses').findOne({ product, user })
    if (existingLicense) return res.status(409).send({ message: `License for product '${req.body.product}' for user '${req.body.user}' already exists` })

    // insert license
    const license = await db.collection('licenses').insertOne({
      ...req.body,
      hub: req.hub._id
    })

    return res.status(201).send({ _id: license.insertedId })
  }
}
