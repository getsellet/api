module.exports = {
  endpoint: '/hub/',
  get: async (req, res) => {
    if (!req.hub) return res.status(401).send({ message: 'Unauthorized' }) // auth

    delete req.hub.token

    return res.status(200).send(req.hub)
  }
}
