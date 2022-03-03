const db = require('../../modules/db')
const { default: ow } = require('ow')

module.exports = {
  endpoint: '/user/:source/:id',
  get: async (req, res) => {
    // validate request
    try {
      ow(req.params, ow.object.exactShape({
        source: ow.string.is((v) => ['discord', 'roblox'].includes(v) || `Expected \`${v}\` to be \`discord\` or \`roblox\``),
        id: ow.string.numeric
      }))
    } catch (err) {
      return res.status(400).send({ message: err.message.replaceAll('`', '\'').replace('object \'req.body\'', 'body') })
    }

    // find user
    const user = await db.collection('users').findOne({ [`${req.params.source}.id`]: req.params.id })
    if (!user) return res.status(404).send({ message: `'${req.params.source}' user '${req.params.id}' could not be found` })

    return res.status(200).send(user)
  }
}
