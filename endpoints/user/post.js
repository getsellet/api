const db = require('../../modules/db')
const { default: ow } = require('ow')
const roverify = require('roverify')

module.exports = {
  endpoint: '/user/',
  post: async (req, res) => {
    // validate request
    try {
      ow(req.body, ow.object.exactShape({
        discord: ow.string.numeric
      }))
    } catch (err) {
      return res.status(400).send({ message: err.message.replaceAll('`', '\'').replace('object \'req.body\'', 'body') })
    }

    // find verification
    let roblox

    try {
      roblox = await roverify.verify(req.body.discord)
    } catch {
      return res.status(400).send({ message: `Discord user '${req.body.discord}' is not verified with Bloxlink or RoVer` })
    }

    // remove/update roblox info
    roblox.id = roblox.id.toString()
    roblox.created = new Date(roblox.created)
    delete roblox.description
    delete roblox.isBanned
    delete roblox.externalAppDisplayName

    // upsert user
    const user = await db.collection('users').updateOne({ 'discord.id': req.body.discord }, { $set: { roblox } }, { upsert: true })
    if (!user.upsertedId) user._id = (await db.collection('users').findOne({ 'discord.id': req.body.discord }))._id

    return res.status(201).send({ _id: user.upsertedId || user._id, roblox })
  }
}
