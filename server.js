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
    const url = `http://${request.info.host}${request.url.href || ''}`

    fs.stat(REDIRECTION_FILE, (error, stats) => {
      if (!error && stats.isFile()) {
        fs.readFile(REDIRECTION_FILE, (error, content) => {
          const redirections = JSON.parse(content)
        // const targetUrl = redirections[]
        })
      } else {
        if (error) {
          request.log('error', error)
        }

        reply(`<h1>No redirection configured for "${url}"!</h1>`)
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
