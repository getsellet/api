const db = require('../../modules/db')
const { default: ow } = require('ow')

module.exports = {
  endpoint: '/product/',
  post: async (req, res) => {
    if (!req.hub) return res.status(401).send({ message: 'Unauthorized' }) // auth

    // validate request
    try {
      ow(req.body, ow.object.exactShape({
        name: ow.string,
        description: ow.string,
        url: ow.string.is((v) => /^(ftp|http|https):\/\/[^ "]+$/u.test(v) || `Expected \`${v}\` to be a url`),
        devProduct: ow.string.numeric
      }))
    } catch (err) {
      return res.status(400).send({ message: err.message.replaceAll('`', '\'').replace('object \'req.body\'', 'body') })
    }

    // check for existing product
    const existingProduct = await db.collection('products').findOne({
      name: req.body.name,
      hub: req.hub._id
    })
    if (existingProduct) return res.status(409).send({ message: `Product with name '${req.body.name}' already exists` })

    // insert product
    const product = await db.collection('products').insertOne({
      ...req.body,
      hub: req.hub._id
    })

    return res.status(201).send({ _id: product.insertedId })
  }
}
