const db = require('../../modules/db')
const { default: ow } = require('ow')
const crypto = require('crypto')

module.exports = {
  endpoint: '/hub/',
  post: async (req, res) => {
    // validate request
    try {
      ow(req.body, ow.object.exactShape({
        name: ow.string,
        guild: ow.string.numeric
      }))
    } catch (err) {
      return res.status(400).send({ message: err.message.replaceAll('`', '\'').replace('object \'req.body\'', 'body') })
    }

    // check for existing hub
    const existingHub = await db.collection('hubs').findOne({ guild: req.body.guild })
    if (existingHub) return res.status(409).send({ message: `Hub with guild '${req.body.guild}' already exists` })

    // insert hub
    const token = crypto.randomUUID()
    const hub = await db.collection('hubs').insertOne({
      ...req.body,
      token
    })

    return res.status(201).send({ _id: hub.insertedId, token })
  }
}
