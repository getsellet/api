(async () => {
  await require('./modules/db.js') // init db

  // webserver
  const express = require('express')
  const app = express()

  // middlewares
  const helmet = require('helmet')
  const auth = require('./middlewares/auth')

  app.use(helmet())
  app.use(auth())
  app.use(express.json())

  // endpoints
  const glob = require('glob-promise')
  const endpoints = await glob('./endpoints/**/*.js')

  for (const endpoint of endpoints) {
    const module = require(endpoint)

    if (!module.disabled) {
      // http methods
      if (module.get) app.get(module.endpoint, module.get)
      if (module.post) app.post(module.endpoint, module.post)
      if (module.put) app.put(module.endpoint, module.put)
      if (module.delete) app.delete(module.endpoint, module.delete)
      if (module.patch) app.patch(module.endpoint, module.patch)
    }
  }

  app.listen(8080, () => console.log('webserver listening to ::8080'))
})()
