const db = require('../../modules/db')
const { default: ow } = require('ow')
const crypto = require('crypto')

module.exports = {
  endpoint: '/hub/',
  patch: async (req, res) => {
    if (!req.hub) return res.status(401).send({ message: 'Unauthorized' }) // auth

    // validate request
    try {
      ow(req.body, ow.object.exactShape({
        name: ow.optional.string,
        guild: ow.optional.string.numeric,
        token: ow.optional.boolean.true
      }))
    } catch (err) {
      return res.status(400).send({ message: err.message.replaceAll('`', '\'').replace('object \'req.body\'', 'body') })
    }

    // update hub
    if (req.body.token) req.body.token = crypto.randomUUID() // regenerate token
    await db.collection('hubs').updateOne(req.hub, { $set: req.body })

    return res.status(200).send(req.body.token ? { token: req.body.token } : {})
  }
}
