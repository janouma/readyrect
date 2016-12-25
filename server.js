'use strict'

const hapi = require('hapi')
const fs = require('fs')

const REDIRECTION_FILE = 'redirections.json'

const server = new hapi.Server({
  debug: {
    request: process.env.npm_package_config_logLevels.split(',')
      .map(level => level.trim())
  }
})

server.connection({ port: parseInt(process.env.npm_package_config_port, 10) })

server.route({
  method: 'GET',
  path: '/{path*}',
  handler: function (request, reply) {
    const originalUrl = `http://${request.info.host}${request.url.href || ''}`
    const fallbackResponse = `<h1>No redirection configured for "${originalUrl}"!</h1>`

    fs.stat(REDIRECTION_FILE, (error, stats) => {
      if (!error && stats.isFile()) {
        fs.readFile(REDIRECTION_FILE, (error, content) => {
          const redirections = JSON.parse(content)
          let transformedUrl = originalUrl

          for (const src of Object.keys(redirections)) {
            transformedUrl = transformedUrl.replace(src, redirections[src])
          }

          if (transformedUrl !== originalUrl) {
            reply.redirect(transformedUrl).permanent()
          } else {
            reply(fallbackResponse)
          }
        })
      } else {
        if (error) {
          request.log('error', error)
        }

        reply(fallbackResponse)
      }
    })
  }
})

server.start((err) => {

  if (err) {
    throw err
  }
  console.log(`Server running at: ${server.info.uri}`)
})
