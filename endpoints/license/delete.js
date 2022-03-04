const db = require('../../modules/db')
const { default: ow } = require('ow')
const { ObjectId } = require('mongodb')

module.exports = {
  endpoint: '/license/:id',
  delete: async (req, res) => {
    if (!req.hub) return res.status(401).send({ message: 'Unauthorized' }) // auth

    // validate request
    try {
      ow(req.params, ow.object.exactShape({ id: ow.string.is((v) => ObjectId.isValid(v) || `Expected \`${v}\` to be a BSON object id`) }))
    } catch (err) {
      return res.status(400).send({ message: err.message.replaceAll('`', '\'').replace('object \'req.body\'', 'body') })
    }

    // delete licenses
    const license = await db.collection('licenses').deleteOne({
      _id: new ObjectId(req.params.id),
      hub: req.hub._id
    })
    if (!license.deletedCount) return res.status(404).send({ message: `License '${req.params.id}' could not be found` })

    return res.status(200).send({})
  }
}
