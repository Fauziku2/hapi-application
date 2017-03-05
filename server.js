var Hapi = require('hapi')
var CardStore = require('./lib/cardStore')
var server = new Hapi.Server()

CardStore.initialize()

var cards = loadCards()

server.connection({port: 3000})

server.views({
  engines: {
    html: require('handlebars')
  },
  path: './templates'
})

server.register({
  register: require('good'),
  option: {
    opsInterval: 5000,
    reporters: [
      {
        report: require('good-file'),
        events: {ops: '*'},
        config: {
          path: './logs',
          prefix: 'hapi-process',
          rotate: 'daily'
        }
      },
      {
        report: require('good-file'),
        events: {response: '*'},
        config: {
          path: './logs',
          prefix: 'hapi-request',
          rotate: 'daily'
        }
      },
      {
        report: require('good-file'),
        events: {error: '*'},
        config: {
          path: './logs',
          prefix: 'hapi-error',
          rotate: 'daily'
        }
      }
    ]
  }
}, function (err) {
  console.log(err)
})

server.ext('onPreResponse', function (request, reply) {
  if (request.reponse.isBoom) {
    return reply.view('error', request.reponse)
  }
  reply.continue()
})

server.route(require('./lib/routes'))

server.start(function () {
  console.log('Listening on ' + server.info.uri)
})
