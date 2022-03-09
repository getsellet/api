const db = require('../modules/db')

module.exports = () => async (req, _, next) => {
  const auth = req.headers.authorization
  if (typeof auth !== 'string') return next()

  const hub = await db.collection('hubs').findOne({ token: auth.substring(7) })
  if (hub) req.hub = hub

  return next()
}
