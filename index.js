require('dotenv-safe').config()
const express = require('express')
const bodyParser = require('body-parser')
const { isCelebrateError } = require('celebrate')

const RouteError = require('./helpers/RouteError')

const app = express()
const port = 3000
const router = require('./routes')

app.use(bodyParser.json({
  type: function () {
    return true
  }
}))

app.use(router)

app.use((req, res, next) => {
  if (!req.route) {
    return next(new RouteError('Não encontrado!', 404))
  }
  next()
})

app.use((error, req, res, next) => {
  let codigo
  let mensagem
  if (error instanceof RouteError) {
    mensagem = error.message
    codigo = error.code
  } else if (isCelebrateError(error)) {
    mensagem = 'Problemas no formato da requisição'
    codigo = 400
  } else {
    mensagem = 'O servidor nao pode processar a requisição no momento, tente novamente mais tarde!'
    codigo = 500
  }
  res.status(codigo).json({ mensagem })
  console.log(error.message)
})

app.listen(port, () => {
  console.log(`Server escutanbdo em: http://localhost:${port}`)
})
